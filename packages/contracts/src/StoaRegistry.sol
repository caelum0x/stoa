// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StoaRegistry
/// @notice ERC-8004-lite identity + reputation registry for autonomous agents on Pharos.
/// @dev Agents register an off-chain metadata document (an "agent card") and accrue
///      on-chain reputation from counterparties they have transacted with. Designed to be
///      read by the `agent_identity` and `reputation` Stoa skills.
contract StoaRegistry {
    // --------------------------------------------------------------------- //
    //                                Types                                  //
    // --------------------------------------------------------------------- //

    struct Agent {
        address owner;
        string metadataURI; // URI to the agent card (ipfs://, https://, data:)
        uint64 createdAt;
    }

    struct Reputation {
        uint64 count; // number of distinct attesters
        int256 scoreSum; // sum of scores in range [-5, 5]
    }

    // --------------------------------------------------------------------- //
    //                                Storage                                //
    // --------------------------------------------------------------------- //

    uint256 public nextAgentId = 1;

    mapping(uint256 => Agent) private _agents;
    /// @notice The first agentId registered by an owner (their primary identity).
    mapping(address => uint256) public primaryAgentId;
    mapping(uint256 => Reputation) private _reputation;
    /// @notice Prevents an address from attesting to the same agent more than once.
    mapping(uint256 => mapping(address => bool)) public hasAttested;

    // --------------------------------------------------------------------- //
    //                                Events                                 //
    // --------------------------------------------------------------------- //

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string metadataURI);
    event MetadataUpdated(uint256 indexed agentId, string metadataURI);
    event Attested(uint256 indexed agentId, address indexed from, int8 score, string uri);

    // --------------------------------------------------------------------- //
    //                                Errors                                 //
    // --------------------------------------------------------------------- //

    error NotOwner();
    error UnknownAgent();
    error SelfAttest();
    error AlreadyAttested();
    error InvalidScore();

    // --------------------------------------------------------------------- //
    //                              Mutations                                //
    // --------------------------------------------------------------------- //

    /// @notice Register a new agent identity.
    /// @param metadataURI URI pointing to the agent card document.
    /// @return agentId The freshly minted, monotonically increasing agent id.
    function register(string calldata metadataURI) external returns (uint256 agentId) {
        agentId = nextAgentId++;
        _agents[agentId] = Agent({owner: msg.sender, metadataURI: metadataURI, createdAt: uint64(block.timestamp)});
        if (primaryAgentId[msg.sender] == 0) {
            primaryAgentId[msg.sender] = agentId;
        }
        emit AgentRegistered(agentId, msg.sender, metadataURI);
    }

    /// @notice Update the metadata URI of an agent you own.
    function updateMetadata(uint256 agentId, string calldata metadataURI) external {
        Agent storage a = _agents[agentId];
        if (a.owner == address(0)) revert UnknownAgent();
        if (a.owner != msg.sender) revert NotOwner();
        a.metadataURI = metadataURI;
        emit MetadataUpdated(agentId, metadataURI);
    }

    /// @notice Record a reputation attestation for an agent.
    /// @dev Caller cannot attest to their own agent and may only attest once per agent.
    /// @param score A signed score in the inclusive range [-5, 5].
    /// @param uri Optional URI to off-chain evidence (job receipt, review, tx hash).
    function attest(uint256 agentId, int8 score, string calldata uri) external {
        Agent storage a = _agents[agentId];
        if (a.owner == address(0)) revert UnknownAgent();
        if (a.owner == msg.sender) revert SelfAttest();
        if (score < -5 || score > 5) revert InvalidScore();
        if (hasAttested[agentId][msg.sender]) revert AlreadyAttested();

        hasAttested[agentId][msg.sender] = true;
        Reputation storage r = _reputation[agentId];
        r.count += 1;
        r.scoreSum += int256(score);

        emit Attested(agentId, msg.sender, score, uri);
    }

    // --------------------------------------------------------------------- //
    //                                Views                                  //
    // --------------------------------------------------------------------- //

    function getAgent(uint256 agentId)
        external
        view
        returns (address owner, string memory metadataURI, uint64 createdAt)
    {
        Agent storage a = _agents[agentId];
        if (a.owner == address(0)) revert UnknownAgent();
        return (a.owner, a.metadataURI, a.createdAt);
    }

    function reputationOf(uint256 agentId) external view returns (uint64 count, int256 scoreSum) {
        Reputation storage r = _reputation[agentId];
        return (r.count, r.scoreSum);
    }

    /// @notice Average score scaled by 100 (e.g. 350 == +3.50). Returns 0 when no attestations.
    function averageScoreX100(uint256 agentId) external view returns (int256) {
        Reputation storage r = _reputation[agentId];
        if (r.count == 0) return 0;
        return (r.scoreSum * 100) / int256(uint256(r.count));
    }
}
