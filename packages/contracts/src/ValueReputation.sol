// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ValueReputation
/// @notice Reputation weighted by real economic activity. A counterparty records the value it
///         settled with an agent (after paying an escrow milestone, tip, or stream); the agent
///         accrues total value settled + a job count. Complements StoaRegistry's star attestations
///         with hard-to-fake economic signal.
/// @dev Read/written by the `reputation_value` Stoa skill. Intended to be called by the paying
///      side; a recorder cannot count value against its own agent id (self-dealing guard via a
///      per-(agentId,recorder) one-shot is intentionally NOT applied — repeated real jobs should
///      keep accruing — but zero-value records are rejected).
contract ValueReputation {
    struct Rep {
        uint256 totalValue;
        uint64 jobCount;
    }

    mapping(uint256 => Rep) private _rep; // agentId => reputation

    event Settlement(uint256 indexed agentId, address indexed from, uint256 value);

    error ZeroValue();

    /// @notice Record that `msg.sender` settled `value` with the agent identified by `agentId`.
    function recordSettlement(uint256 agentId, uint256 value) external {
        if (value == 0) revert ZeroValue();
        Rep storage r = _rep[agentId];
        r.totalValue += value;
        r.jobCount += 1;
        emit Settlement(agentId, msg.sender, value);
    }

    function scoreOf(uint256 agentId)
        external
        view
        returns (uint256 totalValue, uint64 jobCount, uint256 averageValue)
    {
        Rep storage r = _rep[agentId];
        uint256 avg = r.jobCount == 0 ? 0 : r.totalValue / r.jobCount;
        return (r.totalValue, r.jobCount, avg);
    }
}
