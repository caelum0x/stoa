// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Vm, VM_ADDRESS} from "./Vm.sol";

/// @notice Tiny assertion + cheatcode base so tests need no external lib.
/// @dev Forge treats any `test*` function that does not revert as passing.
abstract contract TestBase {
    Vm internal constant vm = Vm(VM_ADDRESS);

    function assertTrue(bool cond, string memory err) internal pure {
        require(cond, err);
    }

    function assertEq(uint256 a, uint256 b, string memory err) internal pure {
        require(a == b, err);
    }

    function assertEq(int256 a, int256 b, string memory err) internal pure {
        require(a == b, err);
    }

    function assertEq(address a, address b, string memory err) internal pure {
        require(a == b, err);
    }
}
