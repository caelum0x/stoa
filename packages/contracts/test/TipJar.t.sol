// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {TipJar} from "../src/TipJar.sol";

contract TipJarTest is TestBase {
    TipJar internal jar;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        jar = new TipJar();
        vm.deal(alice, 10 ether);
    }

    function test_TipAndWithdraw() public {
        vm.prank(alice);
        jar.tip{value: 1 ether}(bob, "gm");

        assertEq(jar.balance(bob), 1 ether, "bob owed");
        assertEq(jar.totalGiven(alice), 1 ether, "alice gave");
        assertEq(jar.tipsBetween(alice, bob), 1 ether, "pair total");

        vm.prank(bob);
        jar.withdraw();
        assertEq(bob.balance, 1 ether, "bob withdrew");
        assertEq(jar.balance(bob), 0, "balance cleared");
    }

    function test_ZeroTipReverts() public {
        vm.prank(alice);
        vm.expectRevert(TipJar.ZeroTip.selector);
        jar.tip{value: 0}(bob, "");
    }

    function test_SelfTipReverts() public {
        vm.prank(alice);
        vm.expectRevert(TipJar.BadRecipient.selector);
        jar.tip{value: 1 ether}(alice, "");
    }
}
