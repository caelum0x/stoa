// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {ArbiterPanel} from "../src/ArbiterPanel.sol";

contract ArbiterPanelTest is TestBase {
    ArbiterPanel internal panel;
    address internal a = address(0xA1);
    address internal b = address(0xB2);
    address internal c = address(0xC3);
    address internal stranger = address(0x5757);

    function setUp() public {
        address[] memory arbiters = new address[](3);
        arbiters[0] = a;
        arbiters[1] = b;
        arbiters[2] = c;
        panel = new ArbiterPanel(arbiters, 2);
    }

    function test_OpenAndResolveFavorPayee() public {
        uint256 caseId = panel.openCase(42, "ipfs://evidence");

        vm.prank(a);
        panel.vote(caseId, true);
        // Not resolved yet.
        (,,,,, ArbiterPanel.Verdict v1) = panel.getCase(caseId);
        assertTrue(v1 == ArbiterPanel.Verdict.Pending, "still pending");

        vm.prank(b);
        panel.vote(caseId, true);
        (,,,,, ArbiterPanel.Verdict v2) = panel.getCase(caseId);
        assertTrue(v2 == ArbiterPanel.Verdict.FavorPayee, "resolved for payee");
    }

    function test_NonArbiterCannotVote() public {
        uint256 caseId = panel.openCase(1, "");
        vm.prank(stranger);
        vm.expectRevert(ArbiterPanel.NotArbiter.selector);
        panel.vote(caseId, true);
    }

    function test_CannotVoteTwice() public {
        uint256 caseId = panel.openCase(1, "");
        vm.prank(a);
        panel.vote(caseId, true);
        vm.prank(a);
        vm.expectRevert(ArbiterPanel.AlreadyVoted.selector);
        panel.vote(caseId, false);
    }

    function test_ResolveFavorPayer() public {
        uint256 caseId = panel.openCase(7, "");
        vm.prank(a);
        panel.vote(caseId, false);
        vm.prank(c);
        panel.vote(caseId, false);
        (,,,,, ArbiterPanel.Verdict v) = panel.getCase(caseId);
        assertTrue(v == ArbiterPanel.Verdict.FavorPayer, "resolved for payer");
    }
}
