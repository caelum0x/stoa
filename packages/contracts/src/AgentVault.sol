// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentVault
/// @notice A minimal k-of-n multisig for shared agent / DAO treasuries on Pharos. Owners propose
///         native-PHRS transactions; once `threshold` owners confirm, anyone can execute.
/// @dev Read/written by the `agent_vault` Stoa skill.
contract AgentVault {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public threshold;

    Transaction[] private _txs;
    mapping(uint256 => mapping(address => bool)) public confirmed;

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert NotOwner();
        _;
    }

    event Deposited(address indexed from, uint256 amount);
    event Submitted(uint256 indexed txId, address indexed to, uint256 value);
    event Confirmed(uint256 indexed txId, address indexed owner, uint256 confirmations);
    event Revoked(uint256 indexed txId, address indexed owner);
    event Executed(uint256 indexed txId);

    error NotOwner();
    error BadParams();
    error UnknownTx();
    error AlreadyExecuted();
    error AlreadyConfirmed();
    error NotConfirmed();
    error NotEnoughConfirmations();
    error ExecFailed();

    constructor(address[] memory _owners, uint256 _threshold) {
        if (_owners.length == 0 || _threshold == 0 || _threshold > _owners.length) revert BadParams();
        for (uint256 i; i < _owners.length; ++i) {
            address o = _owners[i];
            if (o == address(0) || isOwner[o]) revert BadParams();
            isOwner[o] = true;
            owners.push(o);
        }
        threshold = _threshold;
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function submit(address to, uint256 value, bytes calldata data) external onlyOwner returns (uint256 txId) {
        txId = _txs.length;
        _txs.push(Transaction({to: to, value: value, data: data, executed: false, confirmations: 0}));
        emit Submitted(txId, to, value);
    }

    function confirm(uint256 txId) external onlyOwner {
        if (txId >= _txs.length) revert UnknownTx();
        Transaction storage t = _txs[txId];
        if (t.executed) revert AlreadyExecuted();
        if (confirmed[txId][msg.sender]) revert AlreadyConfirmed();
        confirmed[txId][msg.sender] = true;
        t.confirmations += 1;
        emit Confirmed(txId, msg.sender, t.confirmations);
    }

    function revokeConfirmation(uint256 txId) external onlyOwner {
        Transaction storage t = _txs[txId];
        if (t.executed) revert AlreadyExecuted();
        if (!confirmed[txId][msg.sender]) revert NotConfirmed();
        confirmed[txId][msg.sender] = false;
        t.confirmations -= 1;
        emit Revoked(txId, msg.sender);
    }

    function execute(uint256 txId) external nonReentrant {
        if (txId >= _txs.length) revert UnknownTx();
        Transaction storage t = _txs[txId];
        if (t.executed) revert AlreadyExecuted();
        if (t.confirmations < threshold) revert NotEnoughConfirmations();

        t.executed = true;
        (bool ok,) = t.to.call{value: t.value}(t.data);
        if (!ok) revert ExecFailed();
        emit Executed(txId);
    }

    function ownerCount() external view returns (uint256) {
        return owners.length;
    }

    function txCount() external view returns (uint256) {
        return _txs.length;
    }

    function getTransaction(uint256 txId)
        external
        view
        returns (address to, uint256 value, bytes memory data, bool executed, uint256 confirmations)
    {
        Transaction storage t = _txs[txId];
        return (t.to, t.value, t.data, t.executed, t.confirmations);
    }
}
