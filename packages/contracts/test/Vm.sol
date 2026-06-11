// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// The canonical Foundry cheatcode address.
address constant VM_ADDRESS = 0x7109709ECfa91a80626fF3989D68f67F5b1DD12D;

/// @notice Minimal subset of the Foundry cheatcode interface.
/// @dev Declared inline so the test/deploy suite compiles and runs without `forge install forge-std`,
///      keeping the repo fully offline-buildable. Extend as needed.
interface Vm {
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function deal(address, uint256) external;
    function warp(uint256) external;
    function expectRevert() external;
    function expectRevert(bytes4) external;
    function label(address, string calldata) external;
    function envUint(string calldata) external view returns (uint256);
    function envAddress(string calldata) external view returns (address);
    function addr(uint256) external pure returns (address);
    function startBroadcast(uint256) external;
    function stopBroadcast() external;
}
