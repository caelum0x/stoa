// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {StoaRegistry} from "../src/StoaRegistry.sol";
import {ServiceRegistry} from "../src/ServiceRegistry.sol";
import {StoaEscrow} from "../src/StoaEscrow.sol";
import {ValueReputation} from "../src/ValueReputation.sol";

/// @notice The full agent-commerce lifecycle across all the core contracts, with no AI and no
///         network — the on-chain proof behind Stoa's "discover → trust → hire → settle → rate" loop.
contract MercatorFlowTest is TestBase {
    StoaRegistry internal registry;
    ServiceRegistry internal services;
    StoaEscrow internal escrow;
    ValueReputation internal valueRep;

    // Buyer is this test contract (so it can fund escrow); seller is an EOA that receives PHRS.
    address internal seller = address(0xA71A5); // "Atlas"

    receive() external payable {}

    function setUp() public {
        registry = new StoaRegistry();
        services = new ServiceRegistry();
        escrow = new StoaEscrow();
        valueRep = new ValueReputation();
        vm.deal(address(this), 100 ether);
    }

    function test_FullCommerceLoop() public {
        // --- Identity: both agents register ---------------------------------- //
        vm.prank(seller);
        uint256 sellerId = registry.register("data:application/json,{\"name\":\"Atlas\"}");
        uint256 buyerId = registry.register("data:application/json,{\"name\":\"Mercator\"}"); // msg.sender = buyer
        assertEq(sellerId, 1, "seller is agent #1");
        assertEq(buyerId, 2, "buyer is agent #2");

        // --- Discover: seller lists a service, buyer finds it ---------------- //
        vm.prank(seller);
        uint256 serviceId = services.list(sellerId, "research", "https://atlas/x402/summary", "", 0.01 ether);

        uint256[] memory found = services.servicesByCapability("research");
        assertEq(found.length, 1, "one research service discoverable");
        assertEq(found[0], serviceId, "discovered the seller's service");

        // --- Trust: buyer reads seller reputation (empty so far) ------------- //
        (uint64 count0,) = registry.reputationOf(sellerId);
        assertEq(uint256(count0), 0, "seller starts with no reputation");

        // --- Hire: buyer escrows a milestone job for the seller -------------- //
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = 0.001 ether;
        uint256 sellerBalBefore = seller.balance;
        uint256 jobId = escrow.createJob{value: 0.001 ether}(seller, address(0), address(0), 0, milestones);

        // --- Settle: buyer releases the milestone on delivery ---------------- //
        escrow.release(jobId, 0);
        assertEq(seller.balance - sellerBalBefore, 0.001 ether, "seller was paid the milestone");
        (StoaEscrow.Job memory job,,) = escrow.getJob(jobId);
        assertTrue(job.state == StoaEscrow.State.Completed, "job completed");

        // --- Rate: buyer writes star + value-weighted reputation ------------- //
        registry.attest(sellerId, 5, "stoa:job/1"); // msg.sender = buyer != seller owner
        (uint64 count1, int256 sum1) = registry.reputationOf(sellerId);
        assertEq(uint256(count1), 1, "one attestation recorded");
        assertEq(sum1, int256(5), "five-star score");

        valueRep.recordSettlement(sellerId, 0.001 ether);
        (uint256 totalValue, uint64 jobCount,) = valueRep.scoreOf(sellerId);
        assertEq(totalValue, 0.001 ether, "value reputation accrued");
        assertEq(uint256(jobCount), 1, "one settled job");
    }
}
