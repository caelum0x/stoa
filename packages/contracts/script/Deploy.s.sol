// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Vm, VM_ADDRESS} from "../test/Vm.sol";
import {StoaRegistry} from "../src/StoaRegistry.sol";
import {StoaEscrow} from "../src/StoaEscrow.sol";
import {ServiceRegistry} from "../src/ServiceRegistry.sol";
import {SocialFeed} from "../src/SocialFeed.sol";
import {TipJar} from "../src/TipJar.sol";
import {Streaming} from "../src/Streaming.sol";
import {Faucet} from "../src/Faucet.sol";
import {SessionKeyManager} from "../src/SessionKeyManager.sol";
import {SubscriptionManager} from "../src/SubscriptionManager.sol";
import {AgentVault} from "../src/AgentVault.sol";
import {ArbiterPanel} from "../src/ArbiterPanel.sol";

/// @notice Deploys StoaRegistry + StoaEscrow to Pharos Atlantic.
/// @dev Run with:
///      forge script script/Deploy.s.sol:Deploy --rpc-url pharos_atlantic --broadcast
///      Requires PRIVATE_KEY in the environment. Deployed addresses are printed in the
///      run summary and saved under broadcast/.
contract Deploy {
    Vm internal constant vm = Vm(VM_ADDRESS);

    event Deployed(string name, address addr);

    function run()
        external
        returns (
            StoaRegistry registry,
            StoaEscrow escrow,
            ServiceRegistry services,
            SocialFeed social,
            TipJar tipJar,
            Streaming streaming,
            Faucet faucet
        )
    {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        registry = new StoaRegistry();
        escrow = new StoaEscrow();
        services = new ServiceRegistry();
        social = new SocialFeed();
        tipJar = new TipJar();
        streaming = new Streaming();
        faucet = new Faucet(0.5 ether, 12 hours);

        SessionKeyManager sessions = new SessionKeyManager();
        SubscriptionManager subscriptions = new SubscriptionManager();
        address[] memory vaultOwners = new address[](1);
        vaultOwners[0] = vm.addr(pk);
        AgentVault vault = new AgentVault(vaultOwners, 1);
        ArbiterPanel panel = new ArbiterPanel(vaultOwners, 1);

        vm.stopBroadcast();

        emit Deployed("SessionKeyManager", address(sessions));
        emit Deployed("SubscriptionManager", address(subscriptions));
        emit Deployed("AgentVault", address(vault));
        emit Deployed("ArbiterPanel", address(panel));

        emit Deployed("StoaRegistry", address(registry));
        emit Deployed("StoaEscrow", address(escrow));
        emit Deployed("ServiceRegistry", address(services));
        emit Deployed("SocialFeed", address(social));
        emit Deployed("TipJar", address(tipJar));
        emit Deployed("Streaming", address(streaming));
        emit Deployed("Faucet", address(faucet));
    }
}
