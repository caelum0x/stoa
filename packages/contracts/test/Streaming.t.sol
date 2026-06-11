// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {Streaming} from "../src/Streaming.sol";

contract StreamingTest is TestBase {
    Streaming internal stream;
    address internal recipient = address(0xBEEF);

    receive() external payable {}

    function setUp() public {
        stream = new Streaming();
        vm.deal(address(this), 100 ether);
    }

    function test_LinearVestingAndWithdraw() public {
        vm.warp(1000);
        uint256 id = stream.createStream{value: 10 ether}(recipient, 1000, 2000);

        // Halfway through.
        vm.warp(1500);
        assertEq(stream.streamedAmount(id), 5 ether, "half vested");
        assertEq(stream.withdrawable(id), 5 ether, "half withdrawable");

        vm.prank(recipient);
        stream.withdraw(id, 5 ether);
        assertEq(recipient.balance, 5 ether, "recipient got half");

        // After end, full amount vested.
        vm.warp(2500);
        assertEq(stream.withdrawable(id), 5 ether, "remaining half");
    }

    function test_CancelSplitsFunds() public {
        vm.warp(1000);
        uint256 id = stream.createStream{value: 10 ether}(recipient, 1000, 2000);

        vm.warp(1500);
        uint256 senderBefore = address(this).balance;
        stream.cancel(id);

        assertEq(recipient.balance, 5 ether, "recipient vested half");
        assertEq(address(this).balance - senderBefore, 5 ether, "sender refunded half");
    }

    function test_OnlyRecipientWithdraws() public {
        vm.warp(1000);
        uint256 id = stream.createStream{value: 10 ether}(recipient, 1000, 2000);
        vm.warp(1500);
        vm.expectRevert(Streaming.NotAuthorized.selector);
        stream.withdraw(id, 1 ether);
    }
}
