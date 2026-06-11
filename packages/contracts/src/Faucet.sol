// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Faucet
/// @notice A rate-limited PHRS faucet so new agents can bootstrap gas on Pharos testnet.
/// @dev Read/written by the `faucet` Stoa skill. Anyone can fund it; each address may drip once
///      per cooldown window.
contract Faucet {
    address public owner;
    uint256 public dripAmount;
    uint256 public cooldown; // seconds
    mapping(address => uint256) public lastDrip;

    event Dripped(address indexed to, uint256 amount);
    event Funded(address indexed from, uint256 amount);
    event ConfigUpdated(uint256 dripAmount, uint256 cooldown);

    error NotOwner();
    error CoolingDown(uint256 readyAt);
    error Dry();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(uint256 _dripAmount, uint256 _cooldown) {
        owner = msg.sender;
        dripAmount = _dripAmount;
        cooldown = _cooldown;
    }

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function fund() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function drip() external {
        uint256 readyAt = lastDrip[msg.sender] + cooldown;
        if (block.timestamp < readyAt) revert CoolingDown(readyAt);
        if (address(this).balance < dripAmount) revert Dry();

        lastDrip[msg.sender] = block.timestamp;
        (bool sent,) = payable(msg.sender).call{value: dripAmount}("");
        if (!sent) revert TransferFailed();
        emit Dripped(msg.sender, dripAmount);
    }

    function nextDripAt(address account) external view returns (uint256) {
        return lastDrip[account] + cooldown;
    }

    function setConfig(uint256 _dripAmount, uint256 _cooldown) external onlyOwner {
        dripAmount = _dripAmount;
        cooldown = _cooldown;
        emit ConfigUpdated(_dripAmount, _cooldown);
    }
}
