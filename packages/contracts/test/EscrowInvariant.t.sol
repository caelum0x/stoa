// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {StoaEscrow} from "../src/StoaEscrow.sol";

contract EscrowNativeHandler {
    StoaEscrow internal immutable escrow;
    address internal constant PAYEE = address(0xBEEF);
    address internal constant ARBITER = address(0xA161);

    uint256 public expectedLocked;
    uint256[] public jobIds;

    mapping(uint256 => uint256[3]) internal amounts;
    mapping(uint256 => uint8) internal milestoneCount;
    mapping(uint256 => uint8) internal releasedCount;
    mapping(uint256 => bool[3]) internal released;
    mapping(uint256 => bool) internal active;

    constructor(StoaEscrow _escrow) payable {
        escrow = _escrow;
    }

    receive() external payable {}

    function createNativeJob(uint96 first, uint96 second, uint96 third, uint8 countSeed) external {
        uint8 count = (countSeed % 3) + 1;
        uint256[3] memory values = [
            (uint256(first) % 1 ether) + 1,
            (uint256(second) % 1 ether) + 1,
            (uint256(third) % 1 ether) + 1
        ];

        uint256 total;
        uint256[] memory milestones = new uint256[](count);
        for (uint256 i; i < count; ++i) {
            milestones[i] = values[i];
            total += values[i];
        }
        if (address(this).balance < total) return;

        uint256 jobId = escrow.createJob{value: total}(PAYEE, ARBITER, address(0), 0, milestones);
        jobIds.push(jobId);
        amounts[jobId] = values;
        milestoneCount[jobId] = count;
        active[jobId] = true;
        expectedLocked += total;
    }

    function release(uint256 jobSeed, uint8 milestoneSeed) external {
        if (jobIds.length == 0) return;
        uint256 jobId = jobIds[jobSeed % jobIds.length];
        if (!active[jobId]) return;

        uint8 index = milestoneSeed % milestoneCount[jobId];
        if (released[jobId][index]) return;

        escrow.release(jobId, index);
        released[jobId][index] = true;
        releasedCount[jobId] += 1;
        expectedLocked -= amounts[jobId][index];
        if (releasedCount[jobId] == milestoneCount[jobId]) {
            active[jobId] = false;
        }
    }

    function refund(uint256 jobSeed) external {
        if (jobIds.length == 0) return;
        uint256 jobId = jobIds[jobSeed % jobIds.length];
        if (!active[jobId]) return;

        uint256 remaining;
        for (uint256 i; i < milestoneCount[jobId]; ++i) {
            if (!released[jobId][i]) {
                remaining += amounts[jobId][i];
            }
        }

        escrow.refund(jobId);
        active[jobId] = false;
        expectedLocked -= remaining;
    }
}

contract EscrowInvariantTest is TestBase {
    StoaEscrow internal escrow;
    EscrowNativeHandler internal handler;

    function setUp() public {
        escrow = new StoaEscrow();
        vm.deal(address(this), 1_000_000 ether);
        handler = new EscrowNativeHandler{value: 1_000_000 ether}(escrow);
    }

    function testFuzz_NativeEscrowBalanceMatchesOutstandingMilestones(bytes32 seed) public {
        for (uint256 i; i < 32; ++i) {
            uint256 word = uint256(keccak256(abi.encode(seed, i)));
            uint256 op = word % 3;

            if (op == 0) {
                // Fuzz entropy is intentionally narrowed to the handler's bounded argument types.
                // forge-lint: disable-next-line(unsafe-typecast)
                handler.createNativeJob(uint96(word), uint96(word >> 96), uint96(word >> 160), uint8(word >> 248));
            } else if (op == 1) {
                // Fuzz entropy is intentionally narrowed to select one of three milestone slots.
                // forge-lint: disable-next-line(unsafe-typecast)
                handler.release(word >> 8, uint8(word >> 16));
            } else {
                handler.refund(word >> 8);
            }

            _assertNativeEscrowBalanceMatchesOutstandingMilestones();
        }
    }

    function _assertNativeEscrowBalanceMatchesOutstandingMilestones() internal view {
        assertEq(address(escrow).balance, handler.expectedLocked(), "native escrow balance drift");
    }
}
