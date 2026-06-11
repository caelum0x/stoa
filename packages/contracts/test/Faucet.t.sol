// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {Faucet} from "../src/Faucet.sol";

contract FaucetTest is TestBase {
    Faucet internal faucet;
    address internal user = address(0x5E7);

    function setUp() public {
        faucet = new Faucet(1 ether, 1 days);
        vm.deal(address(this), 100 ether);
        (bool s,) = address(faucet).call{value: 10 ether}("");
        require(s, "fund failed");
    }

    function test_DripPaysAndRateLimits() public {
        vm.warp(1_000_000);
        vm.prank(user);
        faucet.drip();
        assertEq(user.balance, 1 ether, "user got drip");

        // Immediate second drip should revert (cooldown).
        vm.prank(user);
        vm.expectRevert();
        faucet.drip();

        // After cooldown, drip works again.
        vm.warp(1_000_000 + 1 days);
        vm.prank(user);
        faucet.drip();
        assertEq(user.balance, 2 ether, "user got second drip");
    }

    function test_OnlyOwnerSetsConfig() public {
        vm.prank(user);
        vm.expectRevert(Faucet.NotOwner.selector);
        faucet.setConfig(2 ether, 1 hours);

        faucet.setConfig(2 ether, 1 hours);
        assertEq(faucet.dripAmount(), 2 ether, "drip updated");
    }
}
