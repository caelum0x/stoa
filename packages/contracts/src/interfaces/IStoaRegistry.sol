// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IStoaRegistry
/// @notice External interface for {StoaRegistry}, the ERC-8004-lite identity + reputation registry.
interface IStoaRegistry {
    // --------------------------------------------------------------------- //
    //                                Events                                 //
    // --------------------------------------------------------------------- //

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string metadataURI);
    event MetadataUpdated(uint256 indexed agentId, string metadataURI);
    event Attested(uint256 indexed agentId, address indexed from, int8 score, string uri);

    // --------------------------------------------------------------------- //
    //                              Mutations                                //
    // --------------------------------------------------------------------- //

    /// @notice Register a new agent identity.
    function register(string calldata metadataURI) external returns (uint256 agentId);

    /// @notice Update the metadata URI of an agent you own.
    function updateMetadata(uint256 agentId, string calldata metadataURI) external;

    /// @notice Record a reputation attestation for an agent.
    function attest(uint256 agentId, int8 score, string calldata uri) external;

    // --------------------------------------------------------------------- //
    //                                Views                                  //
    // --------------------------------------------------------------------- //

    /// @notice The first agentId registered by an owner (their primary identity).
    function primaryAgentId(address owner) external view returns (uint256);

    function getAgent(uint256 agentId)
        external
        view
        returns (address owner, string memory metadataURI, uint64 createdAt);

    function reputationOf(uint256 agentId) external view returns (uint64 count, int256 scoreSum);

    /// @notice Average score scaled by 100 (e.g. 350 == +3.50). Returns 0 when no attestations.
    function averageScoreX100(uint256 agentId) external view returns (int256);
}
