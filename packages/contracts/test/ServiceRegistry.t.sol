// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {ServiceRegistry} from "../src/ServiceRegistry.sol";

contract ServiceRegistryTest is TestBase {
    ServiceRegistry internal reg;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        reg = new ServiceRegistry();
    }

    function test_ListAndGet() public {
        vm.prank(alice);
        uint256 id = reg.list(7, "market-insight", "https://a/insight", "ipfs://schema", 1e16);

        ServiceRegistry.Service memory s = reg.getService(id);
        assertEq(s.provider, alice, "provider");
        assertEq(s.agentId, 7, "agentId");
        assertEq(s.priceWei, 1e16, "price");
        assertTrue(s.active, "active");
        assertTrue(keccak256(bytes(s.capability)) == keccak256(bytes("market-insight")), "capability");
    }

    function test_IndexesByProviderAndCapability() public {
        vm.prank(alice);
        uint256 id1 = reg.list(0, "market-insight", "https://a/1", "", 1);
        vm.prank(alice);
        uint256 id2 = reg.list(0, "market-insight", "https://a/2", "", 2);
        vm.prank(bob);
        uint256 id3 = reg.list(0, "translation", "https://b/1", "", 3);

        uint256[] memory aliceServices = reg.servicesByProvider(alice);
        assertEq(aliceServices.length, 2, "alice has 2 services");
        assertEq(aliceServices[0], id1, "first");
        assertEq(aliceServices[1], id2, "second");

        uint256[] memory insight = reg.servicesByCapability("market-insight");
        assertEq(insight.length, 2, "two insight services");

        uint256[] memory translation = reg.servicesByCapability("translation");
        assertEq(translation.length, 1, "one translation service");
        assertEq(translation[0], id3, "bob service");

        assertEq(reg.totalServices(), 3, "total");
    }

    function test_UpdateOnlyProvider() public {
        vm.prank(alice);
        uint256 id = reg.list(0, "market-insight", "https://a/1", "", 1);

        vm.prank(bob);
        vm.expectRevert(ServiceRegistry.NotProvider.selector);
        reg.update(id, 5, false);

        vm.prank(alice);
        reg.update(id, 99, false);
        ServiceRegistry.Service memory s = reg.getService(id);
        assertEq(s.priceWei, 99, "price updated");
        assertTrue(!s.active, "deactivated");
    }

    function test_EmptyCapabilityReverts() public {
        vm.prank(alice);
        vm.expectRevert(ServiceRegistry.EmptyCapability.selector);
        reg.list(0, "", "https://a/1", "", 1);
    }

    function test_UnknownServiceReverts() public {
        vm.expectRevert(ServiceRegistry.UnknownService.selector);
        reg.getService(123);
    }
}
