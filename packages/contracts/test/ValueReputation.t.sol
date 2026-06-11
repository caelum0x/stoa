// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {ValueReputation} from "../src/ValueReputation.sol";

contract ValueReputationTest is TestBase {
    ValueReputation internal rep;
    address internal payer1 = address(0x9001);
    address internal payer2 = address(0x9002);

    function setUp() public {
        rep = new ValueReputation();
    }

    function test_AccumulatesValueAndCount() public {
        vm.prank(payer1);
        rep.recordSettlement(7, 100);
        vm.prank(payer2);
        rep.recordSettlement(7, 300);

        (uint256 total, uint64 count, uint256 avg) = rep.scoreOf(7);
        assertEq(total, 400, "total value");
        assertEq(uint256(count), 2, "job count");
        assertEq(avg, 200, "average value");
    }

    function test_ZeroValueReverts() public {
        vm.prank(payer1);
        vm.expectRevert(ValueReputation.ZeroValue.selector);
        rep.recordSettlement(7, 0);
    }

    function test_EmptyAgentIsZero() public {
        (uint256 total, uint64 count, uint256 avg) = rep.scoreOf(999);
        assertEq(total, 0, "no value");
        assertEq(uint256(count), 0, "no jobs");
        assertEq(avg, 0, "no avg");
    }
}
