// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title Streaming
/// @notice Linear payment streams for continuous agent-to-agent compensation on Pharos.
///         A sender locks a deposit that vests linearly to the recipient between start and stop;
///         the recipient can withdraw the vested portion at any time. Either party can cancel,
///         splitting funds by what has vested so far. Supports native PHRS and ERC-20.
/// @dev Read/written by the `payment_stream` Stoa skill.
contract Streaming {
    struct Stream {
        address sender;
        address recipient;
        address token; // address(0) => native PHRS
        uint256 deposit;
        uint256 withdrawn;
        uint64 start;
        uint64 stop;
        bool cancelled;
    }

    uint256 public nextStreamId = 1;
    mapping(uint256 => Stream) private _streams;

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    event StreamCreated(
        uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 deposit
    );
    event Withdrawn(uint256 indexed streamId, uint256 amount);
    event Cancelled(uint256 indexed streamId, uint256 toRecipient, uint256 toSender);

    error BadParams();
    error BadValue();
    error NotAuthorized();
    error AlreadyCancelled();
    error TransferFailed();
    error TooMuch();

    /// @notice Create a native-PHRS stream funded by msg.value. For ERC-20 use createStreamErc20.
    function createStream(address recipient, uint64 start, uint64 stop)
        external
        payable
        nonReentrant
        returns (uint256 streamId)
    {
        if (recipient == address(0) || recipient == msg.sender || stop <= start) revert BadParams();
        if (msg.value == 0) revert BadValue();

        streamId = nextStreamId++;
        _streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            token: address(0),
            deposit: msg.value,
            withdrawn: 0,
            start: start,
            stop: stop,
            cancelled: false
        });
        emit StreamCreated(streamId, msg.sender, recipient, msg.value);
    }

    function createStreamErc20(address recipient, address token, uint256 amount, uint64 start, uint64 stop)
        external
        nonReentrant
        returns (uint256 streamId)
    {
        if (recipient == address(0) || recipient == msg.sender || stop <= start || amount == 0) {
            revert BadParams();
        }
        if (!IERC20(token).transferFrom(msg.sender, address(this), amount)) revert TransferFailed();

        streamId = nextStreamId++;
        _streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            deposit: amount,
            withdrawn: 0,
            start: start,
            stop: stop,
            cancelled: false
        });
        emit StreamCreated(streamId, msg.sender, recipient, amount);
    }

    /// @notice Total amount vested to the recipient at the current time.
    function streamedAmount(uint256 streamId) public view returns (uint256) {
        Stream storage s = _streams[streamId];
        if (block.timestamp <= s.start) return 0;
        if (block.timestamp >= s.stop) return s.deposit;
        uint256 elapsed = block.timestamp - s.start;
        uint256 duration = s.stop - s.start;
        return (s.deposit * elapsed) / duration;
    }

    /// @notice Amount the recipient can withdraw right now.
    function withdrawable(uint256 streamId) public view returns (uint256) {
        return streamedAmount(streamId) - _streams[streamId].withdrawn;
    }

    function withdraw(uint256 streamId, uint256 amount) external nonReentrant {
        Stream storage s = _streams[streamId];
        if (msg.sender != s.recipient) revert NotAuthorized();
        if (s.cancelled) revert AlreadyCancelled();
        if (amount > withdrawable(streamId)) revert TooMuch();

        s.withdrawn += amount;
        _payout(s.token, s.recipient, amount);
        emit Withdrawn(streamId, amount);
    }

    function cancel(uint256 streamId) external nonReentrant {
        Stream storage s = _streams[streamId];
        if (msg.sender != s.sender && msg.sender != s.recipient) revert NotAuthorized();
        if (s.cancelled) revert AlreadyCancelled();

        uint256 toRecipient = withdrawable(streamId);
        uint256 remaining = s.deposit - s.withdrawn - toRecipient;

        s.cancelled = true;
        s.withdrawn = s.deposit;

        if (toRecipient > 0) _payout(s.token, s.recipient, toRecipient);
        if (remaining > 0) _payout(s.token, s.sender, remaining);
        emit Cancelled(streamId, toRecipient, remaining);
    }

    function _payout(address token, address to, uint256 amount) private {
        if (token == address(0)) {
            (bool sent,) = payable(to).call{value: amount}("");
            if (!sent) revert TransferFailed();
        } else {
            if (!IERC20(token).transfer(to, amount)) revert TransferFailed();
        }
    }

    function getStream(uint256 streamId) external view returns (Stream memory) {
        return _streams[streamId];
    }
}
