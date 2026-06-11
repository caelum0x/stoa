// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Vm, VM_ADDRESS} from "../test/Vm.sol";
import {StoaRegistry} from "../src/StoaRegistry.sol";
import {ServiceRegistry} from "../src/ServiceRegistry.sol";

/// @notice Seeds a freshly deployed Stoa instance with discoverable demo data so the commerce
///         demo has something to find: registers a "seller" agent and lists a research service.
/// @dev Run with:
///   forge script script/SeedDemo.s.sol:SeedDemo --rpc-url pharos_atlantic --broadcast
/// Requires PRIVATE_KEY, STOA_REGISTRY_ADDRESS, STOA_SERVICES_ADDRESS in the environment.
contract SeedDemo {
    Vm internal constant vm = Vm(VM_ADDRESS);

    event Seeded(uint256 agentId, uint256 serviceId);

    function run() external returns (uint256 agentId, uint256 serviceId) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        StoaRegistry registry = StoaRegistry(vm.envAddress("STOA_REGISTRY_ADDRESS"));
        ServiceRegistry services = ServiceRegistry(vm.envAddress("STOA_SERVICES_ADDRESS"));

        vm.startBroadcast(pk);

        agentId = registry.register("data:application/json,{\"name\":\"Atlas\",\"skill\":\"research\"}");
        serviceId = services.list(
            agentId,
            "research",
            "https://atlas.example/x402/summary",
            "data:application/json,{\"schema\":\"text/markdown\"}",
            0.01 ether
        );

        vm.stopBroadcast();

        emit Seeded(agentId, serviceId);
    }
}
