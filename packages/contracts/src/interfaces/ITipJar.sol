// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ITipJar
/// @notice External interface for {TipJar}, the native-PHRS tipping contract for agents.
interface ITipJar {
    // --------------------------------------------------------------------- //
    //                                Events                                 //
    // --------------------------------------------------------------------- //

    event Tipped(address indexed from, address indexed to, uint256 amount, string memo);
    event Withdrawn(address indexed to, uint256 amount);

    // --------------------------------------------------------------------- //
    //                              Mutations                                //
    // --------------------------------------------------------------------- //

    /// @notice Tip a recipient. The value is held until they withdraw.
    function tip(address to, string calldata memo) external payable;

    /// @notice Withdraw all tips owed to the caller.
    function withdraw() external;

    // --------------------------------------------------------------------- //
    //                                Views                                  //
    // --------------------------------------------------------------------- //

    /// @notice Withdrawable balance, per recipient.
    function balance(address recipient) external view returns (uint256);

    function totalReceived(address recipient) external view returns (uint256);

    function totalGiven(address giver) external view returns (uint256);

    /// @notice Total tipped from `from` to `to`.
    function tipsBetween(address from, address to) external view returns (uint256);
}
