// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {RwaRegistry} from "../src/RwaRegistry.sol";

contract RwaRegistryTest is TestBase {
    RwaRegistry internal reg;
    address internal issuer = address(0x1551);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        reg = new RwaRegistry();
    }

    function test_IssueTransferRedeem() public {
        vm.prank(issuer);
        uint256 id = reg.issue(alice, "invoice", 1000e6, "ipfs://doc");

        RwaRegistry.Asset memory a = reg.getAsset(id);
        assertEq(a.holder, alice, "holder is alice");
        assertEq(a.valuation, 1000e6, "valuation");

        vm.prank(alice);
        reg.transfer(id, bob);
        assertEq(reg.getAsset(id).holder, bob, "holder now bob");

        vm.prank(bob);
        reg.redeem(id);
        assertTrue(reg.getAsset(id).redeemed, "redeemed");
    }

    function test_OnlyHolderTransfers() public {
        vm.prank(issuer);
        uint256 id = reg.issue(alice, "invoice", 1, "");
        vm.prank(bob);
        vm.expectRevert(RwaRegistry.NotHolder.selector);
        reg.transfer(id, bob);
    }

    function test_IssuerCanRedeem() public {
        vm.prank(issuer);
        uint256 id = reg.issue(alice, "invoice", 1, "");
        vm.prank(issuer);
        reg.redeem(id);
        assertTrue(reg.getAsset(id).redeemed, "issuer redeemed");
    }

    function test_BadParamsReverts() public {
        vm.prank(issuer);
        vm.expectRevert(RwaRegistry.BadParams.selector);
        reg.issue(address(0), "invoice", 1, "");
    }
}
