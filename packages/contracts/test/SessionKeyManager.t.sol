// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {SessionKeyManager} from "../src/SessionKeyManager.sol";

contract SessionKeyManagerTest is TestBase {
    SessionKeyManager internal mgr;
    address internal owner = address(0x011E);
    address internal key = address(0x5E55);
    address internal payee = address(0xBEEF);

    function setUp() public {
        mgr = new SessionKeyManager();
        vm.deal(owner, 100 ether);
    }

    function test_DepositAuthorizeSpend() public {
        vm.prank(owner);
        mgr.deposit{value: 10 ether}();
        assertEq(mgr.balanceOf(owner), 10 ether, "deposited");

        vm.prank(owner);
        mgr.authorize(key, 3 ether, uint64(block.timestamp + 1 days));

        vm.warp(block.timestamp + 1 hours);
        vm.prank(key);
        mgr.spend(owner, payee, 2 ether);

        assertEq(payee.balance, 2 ether, "payee paid");
        assertEq(mgr.balanceOf(owner), 8 ether, "balance reduced");
        (uint256 cap,,) = mgr.allowanceOf(owner, key);
        assertEq(cap, 1 ether, "cap reduced");
    }

    function test_CapExceededReverts() public {
        vm.prank(owner);
        mgr.deposit{value: 10 ether}();
        vm.prank(owner);
        mgr.authorize(key, 1 ether, uint64(block.timestamp + 1 days));

        vm.prank(key);
        vm.expectRevert(SessionKeyManager.CapExceeded.selector);
        mgr.spend(owner, payee, 2 ether);
    }

    function test_ExpiredReverts() public {
        vm.prank(owner);
        mgr.deposit{value: 10 ether}();
        vm.prank(owner);
        mgr.authorize(key, 5 ether, uint64(block.timestamp + 100));

        vm.warp(block.timestamp + 200);
        vm.prank(key);
        vm.expectRevert(SessionKeyManager.Expired.selector);
        mgr.spend(owner, payee, 1 ether);
    }

    function test_RevokeBlocksSpend() public {
        vm.prank(owner);
        mgr.deposit{value: 10 ether}();
        vm.prank(owner);
        mgr.authorize(key, 5 ether, uint64(block.timestamp + 1 days));
        vm.prank(owner);
        mgr.revoke(key);

        vm.prank(key);
        vm.expectRevert(SessionKeyManager.NotActive.selector);
        mgr.spend(owner, payee, 1 ether);
    }

    function test_Withdraw() public {
        vm.prank(owner);
        mgr.deposit{value: 10 ether}();
        uint256 before = owner.balance;
        vm.prank(owner);
        mgr.withdraw(4 ether);
        assertEq(owner.balance - before, 4 ether, "withdrew");
    }
}
