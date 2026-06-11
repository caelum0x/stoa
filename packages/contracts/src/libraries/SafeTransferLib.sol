// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SafeTransferLib
/// @notice Minimal, dependency-free helpers for safely transferring native PHRS and ERC-20 tokens.
/// @dev ERC-20 calls tolerate tokens that return no value (non-standard) as well as those that
///      return a boolean, reverting only on an explicit `false` or a failed call.
library SafeTransferLib {
    error ETHTransferFailed();
    error TransferFailed();
    error TransferFromFailed();

    /// @notice Send native value to `to`, reverting on failure.
    function safeTransferETH(address to, uint256 amount) internal {
        (bool success,) = to.call{value: amount}("");
        if (!success) revert ETHTransferFailed();
    }

    /// @notice Call ERC-20 `transfer(address,uint256)`, reverting on failure.
    function safeTransfer(address token, address to, uint256 amount) internal {
        // 0xa9059cbb == bytes4(keccak256("transfer(address,uint256)"))
        (bool success, bytes memory data) =
            token.call(abi.encodeWithSelector(0xa9059cbb, to, amount));
        if (!_ok(success, data)) revert TransferFailed();
    }

    /// @notice Call ERC-20 `transferFrom(address,address,uint256)`, reverting on failure.
    function safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        // 0x23b872dd == bytes4(keccak256("transferFrom(address,address,uint256)"))
        (bool success, bytes memory data) =
            token.call(abi.encodeWithSelector(0x23b872dd, from, to, amount));
        if (!_ok(success, data)) revert TransferFromFailed();
    }

    /// @dev A call is considered successful when it did not revert AND it either returned no data
    ///      or returned a non-zero (truthy) value, as ERC-20s do.
    function _ok(bool success, bytes memory data) private pure returns (bool) {
        return success && (data.length == 0 || abi.decode(data, (bool)));
    }
}
