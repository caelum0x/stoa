// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SessionKeyManager
/// @notice Lets an agent (owner) deposit PHRS and delegate bounded, expiring spend authority to
///         session keys. A session key can spend up to its cap, before its expiry, out of the
///         owner's deposited balance — the core primitive for safe autonomous delegation.
/// @dev Read/written by the `session_key` Stoa skill.
contract SessionKeyManager {
    struct Session {
        uint256 cap; // remaining native spend allowance
        uint64 validUntil; // unix expiry
        bool active;
    }

    mapping(address => uint256) public balanceOf; // owner => deposited PHRS
    mapping(address => mapping(address => Session)) public sessions; // owner => sessionKey => Session

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    event Deposited(address indexed owner, uint256 amount);
    event Authorized(address indexed owner, address indexed sessionKey, uint256 cap, uint64 validUntil);
    event Revoked(address indexed owner, address indexed sessionKey);
    event Spent(address indexed owner, address indexed sessionKey, address indexed to, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    error ZeroValue();
    error NotActive();
    error Expired();
    error CapExceeded();
    error InsufficientBalance();
    error TransferFailed();

    function deposit() external payable {
        if (msg.value == 0) revert ZeroValue();
        balanceOf[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function authorize(address sessionKey, uint256 cap, uint64 validUntil) external {
        sessions[msg.sender][sessionKey] = Session({cap: cap, validUntil: validUntil, active: true});
        emit Authorized(msg.sender, sessionKey, cap, validUntil);
    }

    function revoke(address sessionKey) external {
        sessions[msg.sender][sessionKey].active = false;
        emit Revoked(msg.sender, sessionKey);
    }

    /// @notice Called by a session key to spend from `owner`'s balance, within its cap and expiry.
    function spend(address owner, address to, uint256 amount) external nonReentrant {
        Session storage s = sessions[owner][msg.sender];
        if (!s.active) revert NotActive();
        if (block.timestamp > s.validUntil) revert Expired();
        if (amount > s.cap) revert CapExceeded();
        if (amount > balanceOf[owner]) revert InsufficientBalance();

        s.cap -= amount;
        balanceOf[owner] -= amount;

        (bool sent,) = payable(to).call{value: amount}("");
        if (!sent) revert TransferFailed();
        emit Spent(owner, msg.sender, to, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        if (amount > balanceOf[msg.sender]) revert InsufficientBalance();
        balanceOf[msg.sender] -= amount;
        (bool sent,) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }

    function allowanceOf(address owner, address sessionKey)
        external
        view
        returns (uint256 cap, uint64 validUntil, bool active)
    {
        Session storage s = sessions[owner][sessionKey];
        return (s.cap, s.validUntil, s.active);
    }
}
