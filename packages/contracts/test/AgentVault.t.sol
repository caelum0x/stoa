// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {AgentVault} from "../src/AgentVault.sol";

contract AgentVaultTest is TestBase {
    AgentVault internal vault;
    address internal a = address(0xA1);
    address internal b = address(0xB2);
    address internal c = address(0xC3);
    address internal payee = address(0xBEEF);

    function setUp() public {
        address[] memory owners = new address[](3);
        owners[0] = a;
        owners[1] = b;
        owners[2] = c;
        vault = new AgentVault(owners, 2);

        vm.deal(address(this), 100 ether);
        (bool s,) = address(vault).call{value: 10 ether}("");
        require(s, "fund failed");
    }

    function test_TwoOfThreeExecutes() public {
        vm.prank(a);
        uint256 txId = vault.submit(payee, 3 ether, "");

        vm.prank(a);
        vault.confirm(txId);
        // One confirmation is not enough.
        vm.expectRevert(AgentVault.NotEnoughConfirmations.selector);
        vault.execute(txId);

        vm.prank(b);
        vault.confirm(txId);
        vault.execute(txId);

        assertEq(payee.balance, 3 ether, "payee paid after 2 confirmations");
    }

    function test_NonOwnerCannotSubmit() public {
        vm.prank(payee);
        vm.expectRevert(AgentVault.NotOwner.selector);
        vault.submit(payee, 1 ether, "");
    }

    function test_RevokeConfirmation() public {
        vm.prank(a);
        uint256 txId = vault.submit(payee, 1 ether, "");
        vm.prank(a);
        vault.confirm(txId);
        vm.prank(a);
        vault.revokeConfirmation(txId);

        vm.prank(b);
        vault.confirm(txId);
        vm.expectRevert(AgentVault.NotEnoughConfirmations.selector);
        vault.execute(txId);
    }

    function test_BadThresholdReverts() public {
        address[] memory owners = new address[](1);
        owners[0] = a;
        vm.expectRevert(AgentVault.BadParams.selector);
        new AgentVault(owners, 2);
    }
}
