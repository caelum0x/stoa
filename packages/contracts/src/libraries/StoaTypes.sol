// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StoaTypes
/// @notice Shared constants and small helpers used across the Stoa contract suite.
/// @dev Intentionally dependency-free. Holds escrow state codes, role identifiers, score bounds,
///      and a protocol version string so on-chain and off-chain code share one source of truth.
library StoaTypes {
    // --------------------------------------------------------------------- //
    //                               Version                                 //
    // --------------------------------------------------------------------- //

    /// @notice Human-readable protocol version of the Stoa contract suite.
    string internal constant VERSION = "1.0.0";

    // --------------------------------------------------------------------- //
    //                            Escrow states                              //
    // --------------------------------------------------------------------- //
    // Mirror StoaEscrow.State so off-chain tooling can reference numeric codes.

    uint8 internal constant ESCROW_ACTIVE = 0;
    uint8 internal constant ESCROW_COMPLETED = 1;
    uint8 internal constant ESCROW_REFUNDED = 2;

    // --------------------------------------------------------------------- //
    //                                Roles                                  //
    // --------------------------------------------------------------------- //

    bytes32 internal constant ROLE_PAYER = keccak256("stoa.role.payer");
    bytes32 internal constant ROLE_PAYEE = keccak256("stoa.role.payee");
    bytes32 internal constant ROLE_ARBITER = keccak256("stoa.role.arbiter");

    // --------------------------------------------------------------------- //
    //                            Reputation bounds                          //
    // --------------------------------------------------------------------- //

    int8 internal constant MIN_SCORE = -5;
    int8 internal constant MAX_SCORE = 5;

    /// @notice The sentinel token address used to denote native PHRS in escrow/streaming flows.
    address internal constant NATIVE_TOKEN = address(0);

    /// @notice Whether a signed reputation score is within the accepted inclusive range.
    function isValidScore(int8 score) internal pure returns (bool) {
        return score >= MIN_SCORE && score <= MAX_SCORE;
    }
}
