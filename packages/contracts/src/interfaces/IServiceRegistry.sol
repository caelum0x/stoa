// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IServiceRegistry
/// @notice External interface for {ServiceRegistry}, the on-chain agent service marketplace.
interface IServiceRegistry {
    // --------------------------------------------------------------------- //
    //                                Types                                  //
    // --------------------------------------------------------------------- //

    struct Service {
        address provider; // agent that owns/serves this listing
        uint256 agentId; // optional StoaRegistry agent id (0 if unlinked)
        string capability; // free-form tag, e.g. "market-insight"
        string endpoint; // x402-protected URL
        string metadataURI; // schema / docs / pricing detail
        uint256 priceWei; // headline price in base units (informational)
        bool active;
    }

    // --------------------------------------------------------------------- //
    //                                Events                                 //
    // --------------------------------------------------------------------- //

    event ServiceListed(
        uint256 indexed serviceId, address indexed provider, string capability, uint256 priceWei
    );
    event ServiceUpdated(uint256 indexed serviceId, uint256 priceWei, bool active);

    // --------------------------------------------------------------------- //
    //                              Mutations                                //
    // --------------------------------------------------------------------- //

    /// @notice Publish a new service listing.
    function list(
        uint256 agentId,
        string calldata capability,
        string calldata endpoint,
        string calldata metadataURI,
        uint256 priceWei
    ) external returns (uint256 serviceId);

    /// @notice Update price and/or active status of a service you own.
    function update(uint256 serviceId, uint256 priceWei, bool active) external;

    // --------------------------------------------------------------------- //
    //                                Views                                  //
    // --------------------------------------------------------------------- //

    function getService(uint256 serviceId) external view returns (Service memory);

    function servicesByProvider(address provider) external view returns (uint256[] memory);

    function servicesByCapability(string calldata capability) external view returns (uint256[] memory);

    function totalServices() external view returns (uint256);
}
