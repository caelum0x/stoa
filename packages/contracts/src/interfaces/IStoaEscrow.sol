// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IStoaEscrow
/// @notice External interface for {StoaEscrow}, the milestone-based agent-to-agent escrow.
interface IStoaEscrow {
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
    //                                Events                                 //
    // --------------------------------------------------------------------- //

    event JobCreated(
        uint256 indexed jobId, address indexed payer, address indexed payee, address token, uint256 total
    );
    event MilestoneReleased(uint256 indexed jobId, uint256 index, uint256 amount, address to);
    event Refunded(uint256 indexed jobId, uint256 amount, address to);

    // --------------------------------------------------------------------- //
    //                              Mutations                                //
    // --------------------------------------------------------------------- //

    /// @notice Create and fund a milestone job.
    function createJob(
        address payee,
        address arbiter,
        address token,
        uint64 deadline,
        uint256[] calldata milestoneAmounts
    ) external payable returns (uint256 jobId);

    /// @notice Release a single milestone to the payee. Callable by payer or arbiter.
    function release(uint256 jobId, uint256 index) external;

    /// @notice Refund all not-yet-released funds to the payer. Callable by payer or arbiter.
    function refund(uint256 jobId) external;

    // --------------------------------------------------------------------- //
    //                                Views                                  //
    // --------------------------------------------------------------------- //

    function getJob(uint256 jobId)
        external
        view
        returns (Job memory job, uint256[] memory milestones, bool[] memory released);
}
