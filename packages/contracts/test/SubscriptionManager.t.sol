// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {SubscriptionManager} from "../src/SubscriptionManager.sol";

contract SubscriptionManagerTest is TestBase {
    SubscriptionManager internal mgr;
    address internal provider = address(0x9201);
    address internal subscriber = address(0x5111);

    function setUp() public {
        mgr = new SubscriptionManager();
        vm.deal(subscriber, 100 ether);
    }

    function test_PlanSubscribeChargeFlow() public {
        vm.prank(provider);
        uint256 planId = mgr.createPlan(1 ether, 30 days);

        vm.warp(1_000_000);
        vm.prank(subscriber);
        uint256 subId = mgr.subscribe{value: 3 ether}(planId);

        // First charge is due immediately (nextCharge = now).
        mgr.charge(subId);
        assertEq(provider.balance, 1 ether, "first charge paid");

        // Charging again before the period elapses reverts.
        vm.expectRevert(SubscriptionManager.TooEarly.selector);
        mgr.charge(subId);

        // After the period, charge again.
        vm.warp(1_000_000 + 30 days);
        mgr.charge(subId);
        assertEq(provider.balance, 2 ether, "second charge paid");
    }

    function test_CancelRefunds() public {
        vm.prank(provider);
        uint256 planId = mgr.createPlan(1 ether, 30 days);
        vm.prank(subscriber);
        uint256 subId = mgr.subscribe{value: 3 ether}(planId);

        uint256 before = subscriber.balance;
        vm.prank(subscriber);
        mgr.cancel(subId);
        assertEq(subscriber.balance - before, 3 ether, "full refund (never charged)");
    }

    function test_SubscribeUnderpriceReverts() public {
        vm.prank(provider);
        uint256 planId = mgr.createPlan(1 ether, 30 days);
        vm.prank(subscriber);
        vm.expectRevert(SubscriptionManager.InsufficientBalance.selector);
        mgr.subscribe{value: 0.5 ether}(planId);
    }
}
