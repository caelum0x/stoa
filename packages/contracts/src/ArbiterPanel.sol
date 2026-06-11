// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ArbiterPanel
/// @notice A panel of arbiters that votes on disputes referencing Stoa escrow jobs. When a
///         threshold of arbiters agree, a verdict (favor payee / favor payer) is recorded on-chain.
///         The escrow arbiter (an agent or human) follows the verdict to release or refund.
/// @dev Read/written by the `dispute` Stoa skill. Advisory by design — it records the outcome and
///      leaves fund movement to StoaEscrow, keeping each contract single-purpose and auditable.
contract ArbiterPanel {
    enum Verdict {
        Pending,
        FavorPayee,
        FavorPayer
    }

    struct Case {
        uint256 jobRef; // referenced StoaEscrow jobId
        address opener;
        string evidenceURI;
        uint8 votesPayee;
        uint8 votesPayer;
        Verdict verdict;
    }

    address[] public arbiters;
    mapping(address => bool) public isArbiter;
    uint8 public threshold;

    Case[] private _cases;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event CaseOpened(uint256 indexed caseId, uint256 indexed jobRef, address indexed opener, string evidenceURI);
    event Voted(uint256 indexed caseId, address indexed arbiter, bool favorPayee);
    event Resolved(uint256 indexed caseId, Verdict verdict);

    error NotArbiter();
    error BadParams();
    error UnknownCase();
    error AlreadyVoted();
    error AlreadyResolved();

    constructor(address[] memory _arbiters, uint8 _threshold) {
        if (_arbiters.length == 0 || _threshold == 0 || _threshold > _arbiters.length) revert BadParams();
        for (uint256 i; i < _arbiters.length; ++i) {
            address a = _arbiters[i];
            if (a == address(0) || isArbiter[a]) revert BadParams();
            isArbiter[a] = true;
            arbiters.push(a);
        }
        threshold = _threshold;
    }

    function openCase(uint256 jobRef, string calldata evidenceURI) external returns (uint256 caseId) {
        caseId = _cases.length;
        _cases.push(
            Case({
                jobRef: jobRef,
                opener: msg.sender,
                evidenceURI: evidenceURI,
                votesPayee: 0,
                votesPayer: 0,
                verdict: Verdict.Pending
            })
        );
        emit CaseOpened(caseId, jobRef, msg.sender, evidenceURI);
    }

    function vote(uint256 caseId, bool favorPayee) external {
        if (!isArbiter[msg.sender]) revert NotArbiter();
        if (caseId >= _cases.length) revert UnknownCase();
        Case storage c = _cases[caseId];
        if (c.verdict != Verdict.Pending) revert AlreadyResolved();
        if (hasVoted[caseId][msg.sender]) revert AlreadyVoted();

        hasVoted[caseId][msg.sender] = true;
        if (favorPayee) c.votesPayee += 1;
        else c.votesPayer += 1;
        emit Voted(caseId, msg.sender, favorPayee);

        if (c.votesPayee >= threshold) {
            c.verdict = Verdict.FavorPayee;
            emit Resolved(caseId, Verdict.FavorPayee);
        } else if (c.votesPayer >= threshold) {
            c.verdict = Verdict.FavorPayer;
            emit Resolved(caseId, Verdict.FavorPayer);
        }
    }

    function caseCount() external view returns (uint256) {
        return _cases.length;
    }

    function getCase(uint256 caseId)
        external
        view
        returns (uint256 jobRef, address opener, string memory evidenceURI, uint8 votesPayee, uint8 votesPayer, Verdict verdict)
    {
        if (caseId >= _cases.length) revert UnknownCase();
        Case storage c = _cases[caseId];
        return (c.jobRef, c.opener, c.evidenceURI, c.votesPayee, c.votesPayer, c.verdict);
    }
}
