// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockAgent
/// @notice A minimal stand-in "agent" account for tests. Holds native funds and can forward
///         arbitrary calls to any target, making it useful for exercising escrow, tip, and
///         registry flows where a contract-controlled counterparty is needed.
/// @dev Not for production use. Has no access control by design.
contract MockAgent {
    event Called(address indexed target, uint256 value, bool success, bytes returndata);

    /// @notice Accept native PHRS so the mock can act as a funded payer/payee.
    receive() external payable {}

    /// @notice Forward an arbitrary low-level call to `target`.
    /// @param target The contract or account to call.
    /// @param value The native value to forward with the call.
    /// @param data The ABI-encoded calldata.
    /// @return success Whether the call succeeded.
    function call(address target, uint256 value, bytes calldata data)
        external
        returns (bool success)
    {
        bytes memory returndata;
        (success, returndata) = target.call{value: value}(data);
        emit Called(target, value, success, returndata);
    }
}
