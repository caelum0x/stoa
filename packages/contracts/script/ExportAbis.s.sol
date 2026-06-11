// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Reminder helper for exporting contract ABIs.
/// @dev ABIs are produced by the compiler; use `forge inspect <Contract> abi` per contract.
contract ExportAbis {
    function run() external pure returns (string memory) {
        return "Run: forge inspect <Contract> abi";
    }
}
