// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {StoaRegistry} from "../src/StoaRegistry.sol";

contract StoaRegistryTest is TestBase {
    StoaRegistry internal registry;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal carol = address(0xCAC0);

    function setUp() public {
        registry = new StoaRegistry();
    }

    function test_RegisterAssignsIncrementingIds() public {
        vm.prank(alice);
        uint256 id1 = registry.register("ipfs://alice");
        vm.prank(bob);
        uint256 id2 = registry.register("ipfs://bob");

        assertEq(id1, 1, "first id should be 1");
        assertEq(id2, 2, "second id should be 2");
        assertEq(registry.primaryAgentId(alice), 1, "alice primary id");

        (address owner, string memory uri,) = registry.getAgent(id1);
        assertEq(owner, alice, "owner mismatch");
        assertTrue(keccak256(bytes(uri)) == keccak256(bytes("ipfs://alice")), "uri mismatch");
    }

    function test_UpdateMetadataOnlyOwner() public {
        vm.prank(alice);
        uint256 id = registry.register("ipfs://v1");

        vm.prank(bob);
        vm.expectRevert(StoaRegistry.NotOwner.selector);
        registry.updateMetadata(id, "ipfs://hijack");

        vm.prank(alice);
        registry.updateMetadata(id, "ipfs://v2");
        (, string memory uri,) = registry.getAgent(id);
        assertTrue(keccak256(bytes(uri)) == keccak256(bytes("ipfs://v2")), "metadata not updated");
    }

    function test_AttestAccumulatesReputation() public {
        vm.prank(alice);
        uint256 id = registry.register("ipfs://alice");

        vm.prank(bob);
        registry.attest(id, 5, "ipfs://receipt-1");
        vm.prank(carol);
        registry.attest(id, 3, "ipfs://receipt-2");

        (uint64 count, int256 sum) = registry.reputationOf(id);
        assertEq(uint256(count), 2, "count");
        assertEq(sum, int256(8), "sum");
        assertEq(registry.averageScoreX100(id), int256(400), "avg x100");
    }

    function test_CannotSelfAttest() public {
        vm.prank(alice);
        uint256 id = registry.register("ipfs://alice");
        vm.prank(alice);
        vm.expectRevert(StoaRegistry.SelfAttest.selector);
        registry.attest(id, 5, "");
    }

    function test_CannotAttestTwice() public {
        vm.prank(alice);
        uint256 id = registry.register("ipfs://alice");
        vm.prank(bob);
        registry.attest(id, 5, "");
        vm.prank(bob);
        vm.expectRevert(StoaRegistry.AlreadyAttested.selector);
        registry.attest(id, 1, "");
    }

    function test_InvalidScoreReverts() public {
        vm.prank(alice);
        uint256 id = registry.register("ipfs://alice");
        vm.prank(bob);
        vm.expectRevert(StoaRegistry.InvalidScore.selector);
        registry.attest(id, 6, "");
    }

    function test_UnknownAgentReverts() public {
        vm.expectRevert(StoaRegistry.UnknownAgent.selector);
        registry.getAgent(999);
    }
}
