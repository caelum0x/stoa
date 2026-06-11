// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SignatureLib
/// @notice Dependency-free helpers for producing EIP-191 and EIP-712 digests.
library SignatureLib {
    /// @notice Produce an EIP-191 `personal_sign` digest for a 32-byte message hash.
    /// @dev keccak256("\x19Ethereum Signed Message:\n32" || hash).
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    /// @notice Produce an EIP-712 typed-data digest from a domain separator and struct hash.
    /// @dev keccak256("\x19\x01" || domainSeparator || structHash).
    function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
    }
}
