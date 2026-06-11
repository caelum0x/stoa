// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ServiceRegistry
/// @notice On-chain marketplace of agent services. Lets agents publish discoverable, priced
///         services (an x402 endpoint + capability tag) that other agents can browse and hire.
/// @dev Pairs with the `service_listing` Stoa skill. Identity/reputation live in StoaRegistry;
///      this contract is the "discover" layer of discover → trust → hire → settle → rate.
contract ServiceRegistry {
    struct Service {
        address provider; // agent that owns/serves this listing
        uint256 agentId; // optional StoaRegistry agent id (0 if unlinked)
        string capability; // free-form tag, e.g. "market-insight"
        string endpoint; // x402-protected URL
        string metadataURI; // schema / docs / pricing detail
        uint256 priceWei; // headline price in base units (informational)
        bool active;
    }

    uint256 public nextServiceId = 1;
    mapping(uint256 => Service) private _services;
    /// @notice All service ids published by a given provider.
    mapping(address => uint256[]) private _byProvider;
    /// @notice Service ids grouped by capability tag (keccak256(tag) => ids).
    mapping(bytes32 => uint256[]) private _byCapability;

    event ServiceListed(
        uint256 indexed serviceId, address indexed provider, string capability, uint256 priceWei
    );
    event ServiceUpdated(uint256 indexed serviceId, uint256 priceWei, bool active);

    error NotProvider();
    error UnknownService();
    error EmptyCapability();

    /// @notice Publish a new service listing.
    function list(
        uint256 agentId,
        string calldata capability,
        string calldata endpoint,
        string calldata metadataURI,
        uint256 priceWei
    ) external returns (uint256 serviceId) {
        if (bytes(capability).length == 0) revert EmptyCapability();
        serviceId = nextServiceId++;
        _services[serviceId] = Service({
            provider: msg.sender,
            agentId: agentId,
            capability: capability,
            endpoint: endpoint,
            metadataURI: metadataURI,
            priceWei: priceWei,
            active: true
        });
        _byProvider[msg.sender].push(serviceId);
        _byCapability[keccak256(bytes(capability))].push(serviceId);
        emit ServiceListed(serviceId, msg.sender, capability, priceWei);
    }

    /// @notice Update price and/or active status of a service you own.
    function update(uint256 serviceId, uint256 priceWei, bool active) external {
        Service storage s = _services[serviceId];
        if (s.provider == address(0)) revert UnknownService();
        if (s.provider != msg.sender) revert NotProvider();
        s.priceWei = priceWei;
        s.active = active;
        emit ServiceUpdated(serviceId, priceWei, active);
    }

    // ----------------------------- Views ----------------------------- //

    function getService(uint256 serviceId) external view returns (Service memory) {
        Service storage s = _services[serviceId];
        if (s.provider == address(0)) revert UnknownService();
        return s;
    }

    function servicesByProvider(address provider) external view returns (uint256[] memory) {
        return _byProvider[provider];
    }

    function servicesByCapability(string calldata capability) external view returns (uint256[] memory) {
        return _byCapability[keccak256(bytes(capability))];
    }

    function totalServices() external view returns (uint256) {
        return nextServiceId - 1;
    }
}
