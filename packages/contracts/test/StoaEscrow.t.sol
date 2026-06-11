// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {StoaEscrow} from "../src/StoaEscrow.sol";
import {MockERC20} from "./MockERC20.sol";

contract StoaEscrowTest is TestBase {
    StoaEscrow internal escrow;
    MockERC20 internal token;

    address internal payee = address(0xBEEF);
    address internal arbiter = address(0xA161);
    address internal stranger = address(0x5747);

    receive() external payable {}

    function setUp() public {
        escrow = new StoaEscrow();
        token = new MockERC20();
        vm.deal(address(this), 100 ether);
    }

    function _twoMilestones() internal pure returns (uint256[] memory m) {
        m = new uint256[](2);
        m[0] = 1 ether;
        m[1] = 2 ether;
    }

    function test_NativeJobReleaseFlow() public {
        uint256[] memory m = _twoMilestones();
        uint256 jobId = escrow.createJob{value: 3 ether}(payee, arbiter, address(0), 0, m);

        assertEq(payee.balance, 0, "payee starts at 0");

        escrow.release(jobId, 0);
        assertEq(payee.balance, 1 ether, "milestone 0 paid");

        escrow.release(jobId, 1);
        assertEq(payee.balance, 3 ether, "milestone 1 paid");

        (StoaEscrow.Job memory job,,) = escrow.getJob(jobId);
        assertTrue(job.state == StoaEscrow.State.Completed, "job completed");
    }

    function test_NativeWrongValueReverts() public {
        uint256[] memory m = _twoMilestones();
        vm.expectRevert(StoaEscrow.BadValue.selector);
        escrow.createJob{value: 1 ether}(payee, arbiter, address(0), 0, m);
    }

    function test_ArbiterCanRelease() public {
        uint256[] memory m = _twoMilestones();
        uint256 jobId = escrow.createJob{value: 3 ether}(payee, arbiter, address(0), 0, m);

        vm.prank(arbiter);
        escrow.release(jobId, 0);
        assertEq(payee.balance, 1 ether, "arbiter released milestone");
    }

    function test_StrangerCannotRelease() public {
        uint256[] memory m = _twoMilestones();
        uint256 jobId = escrow.createJob{value: 3 ether}(payee, arbiter, address(0), 0, m);

        vm.prank(stranger);
        vm.expectRevert(StoaEscrow.NotAuthorized.selector);
        escrow.release(jobId, 0);
    }

    function test_RefundReturnsRemainder() public {
        uint256[] memory m = _twoMilestones();
        uint256 jobId = escrow.createJob{value: 3 ether}(payee, arbiter, address(0), 0, m);

        escrow.release(jobId, 0); // pay 1 ether to payee
        uint256 balBefore = address(this).balance;
        escrow.refund(jobId); // refund remaining 2 ether to payer (this)

        assertEq(address(this).balance - balBefore, 2 ether, "remainder refunded");
        (StoaEscrow.Job memory job,,) = escrow.getJob(jobId);
        assertTrue(job.state == StoaEscrow.State.Refunded, "job refunded");
    }

    function test_DoubleReleaseReverts() public {
        uint256[] memory m = _twoMilestones();
        uint256 jobId = escrow.createJob{value: 3 ether}(payee, arbiter, address(0), 0, m);
        escrow.release(jobId, 0);
        vm.expectRevert(StoaEscrow.AlreadyReleased.selector);
        escrow.release(jobId, 0);
    }

    function test_Erc20JobReleaseFlow() public {
        token.mint(address(this), 3_000_000);
        token.approve(address(escrow), 3_000_000);

        uint256[] memory m = new uint256[](2);
        m[0] = 1_000_000;
        m[1] = 2_000_000;

        uint256 jobId = escrow.createJob(payee, arbiter, address(token), 0, m);
        assertEq(token.balanceOf(address(escrow)), 3_000_000, "escrow funded");

        escrow.release(jobId, 0);
        assertEq(token.balanceOf(payee), 1_000_000, "erc20 milestone paid");
    }

    function test_SelfDealingReverts() public {
        uint256[] memory m = _twoMilestones();
        vm.expectRevert(StoaEscrow.BadParams.selector);
        escrow.createJob{value: 3 ether}(address(this), arbiter, address(0), 0, m);
    }
}
