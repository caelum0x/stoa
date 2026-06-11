// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title StoaEscrow
/// @notice Milestone-based escrow for agent-to-agent jobs on Pharos.
/// @dev Funds are locked up-front by the payer. Each milestone is released independently by the
///      payer or a neutral arbiter. Supports native PHRS (token == address(0)) and any ERC-20.
///      Read/written by the `agent_escrow` Stoa skill.
contract StoaEscrow {
    // --------------------------------------------------------------------- //
    //                                Types                                  //
    // --------------------------------------------------------------------- //

    enum State {
        Active,
        Completed,
        Refunded
    }

    struct Job {
        address payer;
        address payee;
        address arbiter; // optional; address(0) means payer-only control
        address token; // address(0) => native PHRS
        uint64 deadline; // informational; 0 means none
        State state;
        uint256 total;
        uint256 released;
    }

    // --------------------------------------------------------------------- //
    //                                Storage                                //
    // --------------------------------------------------------------------- //

    uint256 public nextJobId = 1;

    mapping(uint256 => Job) private _jobs;
    mapping(uint256 => uint256[]) private _milestones;
    mapping(uint256 => bool[]) private _released;

    // Minimal non-reentrancy guard (avoids an external dependency for a clean CertiK scan).
    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    // --------------------------------------------------------------------- //
    //                                Events                                 //
    // --------------------------------------------------------------------- //

    event JobCreated(
        uint256 indexed jobId, address indexed payer, address indexed payee, address token, uint256 total
    );
    event MilestoneReleased(uint256 indexed jobId, uint256 index, uint256 amount, address to);
    event Refunded(uint256 indexed jobId, uint256 amount, address to);

    // --------------------------------------------------------------------- //
    //                                Errors                                 //
    // --------------------------------------------------------------------- //

    error BadParams();
    error NotAuthorized();
    error WrongState();
    error BadValue();
    error AlreadyReleased();
    error TransferFailed();
    error IndexOutOfRange();

    // --------------------------------------------------------------------- //
    //                              Mutations                                //
    // --------------------------------------------------------------------- //

    /// @notice Create and fund a milestone job.
    /// @param payee The agent performing the work.
    /// @param arbiter Optional neutral party that can also release/refund. Use address(0) for none.
    /// @param token ERC-20 token address, or address(0) for native PHRS.
    /// @param deadline Informational unix deadline (0 for none).
    /// @param milestoneAmounts Per-milestone amounts; their sum is locked immediately.
    function createJob(
        address payee,
        address arbiter,
        address token,
        uint64 deadline,
        uint256[] calldata milestoneAmounts
    ) external payable nonReentrant returns (uint256 jobId) {
        if (payee == address(0) || payee == msg.sender || milestoneAmounts.length == 0) {
            revert BadParams();
        }

        uint256 total;
        for (uint256 i; i < milestoneAmounts.length; ++i) {
            if (milestoneAmounts[i] == 0) revert BadParams();
            total += milestoneAmounts[i];
        }

        if (token == address(0)) {
            if (msg.value != total) revert BadValue();
        } else {
            if (msg.value != 0) revert BadValue();
            if (!IERC20(token).transferFrom(msg.sender, address(this), total)) {
                revert TransferFailed();
            }
        }

        jobId = nextJobId++;
        _jobs[jobId] = Job({
            payer: msg.sender,
            payee: payee,
            arbiter: arbiter,
            token: token,
            deadline: deadline,
            state: State.Active,
            total: total,
            released: 0
        });
        _milestones[jobId] = milestoneAmounts;
        _released[jobId] = new bool[](milestoneAmounts.length);

        emit JobCreated(jobId, msg.sender, payee, token, total);
    }

    /// @notice Release a single milestone to the payee. Callable by payer or arbiter.
    function release(uint256 jobId, uint256 index) external nonReentrant {
        Job storage j = _jobs[jobId];
        if (j.state != State.Active) revert WrongState();
        if (msg.sender != j.payer && (j.arbiter == address(0) || msg.sender != j.arbiter)) {
            revert NotAuthorized();
        }
        if (index >= _milestones[jobId].length) revert IndexOutOfRange();
        if (_released[jobId][index]) revert AlreadyReleased();

        // Effects before interaction (checks-effects-interactions).
        _released[jobId][index] = true;
        uint256 amount = _milestones[jobId][index];
        j.released += amount;
        if (j.released == j.total) j.state = State.Completed;

        _payout(j.token, j.payee, amount);
        emit MilestoneReleased(jobId, index, amount, j.payee);
    }

    /// @notice Refund all not-yet-released funds to the payer. Callable by payer or arbiter.
    function refund(uint256 jobId) external nonReentrant {
        Job storage j = _jobs[jobId];
        if (j.state != State.Active) revert WrongState();
        if (msg.sender != j.payer && (j.arbiter == address(0) || msg.sender != j.arbiter)) {
            revert NotAuthorized();
        }

        uint256 remaining = j.total - j.released;
        j.state = State.Refunded;

        if (remaining > 0) {
            _payout(j.token, j.payer, remaining);
        }
        emit Refunded(jobId, remaining, j.payer);
    }

    // --------------------------------------------------------------------- //
    //                              Internal                                 //
    // --------------------------------------------------------------------- //

    function _payout(address token, address to, uint256 amount) private {
        if (token == address(0)) {
            (bool sent,) = payable(to).call{value: amount}("");
            if (!sent) revert TransferFailed();
        } else {
            if (!IERC20(token).transfer(to, amount)) revert TransferFailed();
        }
    }

    // --------------------------------------------------------------------- //
    //                                Views                                  //
    // --------------------------------------------------------------------- //

    function getJob(uint256 jobId)
        external
        view
        returns (Job memory job, uint256[] memory milestones, bool[] memory released)
    {
        return (_jobs[jobId], _milestones[jobId], _released[jobId]);
    }
}
