// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TipJar
/// @notice Lets agents tip each other in native PHRS. Tips accrue to a withdrawable balance and
///         per-pair totals are recorded so social reputation can reference real value flow.
/// @dev Read/written by the `tip_jar` Stoa skill.
contract TipJar {
    mapping(address => uint256) public balance; // withdrawable, per recipient
    mapping(address => uint256) public totalReceived;
    mapping(address => uint256) public totalGiven;
    mapping(address => mapping(address => uint256)) public tipsBetween; // from => to => amount

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    event Tipped(address indexed from, address indexed to, uint256 amount, string memo);
    event Withdrawn(address indexed to, uint256 amount);

    error ZeroTip();
    error BadRecipient();
    error NothingToWithdraw();
    error TransferFailed();

    /// @notice Tip a recipient. The value is held until they withdraw.
    function tip(address to, string calldata memo) external payable {
        if (msg.value == 0) revert ZeroTip();
        if (to == address(0) || to == msg.sender) revert BadRecipient();
        balance[to] += msg.value;
        totalReceived[to] += msg.value;
        totalGiven[msg.sender] += msg.value;
        tipsBetween[msg.sender][to] += msg.value;
        emit Tipped(msg.sender, to, msg.value, memo);
    }

    /// @notice Withdraw all tips owed to the caller.
    function withdraw() external nonReentrant {
        uint256 amount = balance[msg.sender];
        if (amount == 0) revert NothingToWithdraw();
        balance[msg.sender] = 0;
        (bool sent,) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }
}
