// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SubscriptionManager
/// @notice Recurring PHRS pull-payments for agent services. A provider defines a plan (price +
///         period); a subscriber funds a subscription up-front; anyone can trigger `charge` once
///         per elapsed period to pull the price to the provider until funds run out or it's cancelled.
/// @dev Read/written by the `subscription` Stoa skill.
contract SubscriptionManager {
    struct Plan {
        address provider;
        uint256 price;
        uint64 period; // seconds
        bool active;
    }

    struct Subscription {
        uint256 planId;
        address subscriber;
        uint256 balance;
        uint64 nextCharge;
        bool active;
    }

    uint256 public nextPlanId = 1;
    uint256 public nextSubId = 1;
    mapping(uint256 => Plan) public plans;
    mapping(uint256 => Subscription) public subs;

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    event PlanCreated(uint256 indexed planId, address indexed provider, uint256 price, uint64 period);
    event Subscribed(uint256 indexed subId, uint256 indexed planId, address indexed subscriber, uint256 funded);
    event Charged(uint256 indexed subId, uint256 amount, uint64 nextCharge);
    event ToppedUp(uint256 indexed subId, uint256 amount);
    event Cancelled(uint256 indexed subId, uint256 refunded);

    error BadParams();
    error UnknownPlan();
    error NotSubscriber();
    error NotActive();
    error TooEarly();
    error InsufficientBalance();
    error TransferFailed();

    function createPlan(uint256 price, uint64 period) external returns (uint256 planId) {
        if (price == 0 || period == 0) revert BadParams();
        planId = nextPlanId++;
        plans[planId] = Plan({provider: msg.sender, price: price, period: period, active: true});
        emit PlanCreated(planId, msg.sender, price, period);
    }

    function subscribe(uint256 planId) external payable returns (uint256 subId) {
        Plan storage p = plans[planId];
        if (p.provider == address(0) || !p.active) revert UnknownPlan();
        if (msg.value < p.price) revert InsufficientBalance();
        subId = nextSubId++;
        subs[subId] = Subscription({
            planId: planId,
            subscriber: msg.sender,
            balance: msg.value,
            nextCharge: uint64(block.timestamp),
            active: true
        });
        emit Subscribed(subId, planId, msg.sender, msg.value);
    }

    /// @notice Pull one period's price to the provider. Callable by anyone (keeper-friendly).
    function charge(uint256 subId) external nonReentrant {
        Subscription storage sub = subs[subId];
        if (!sub.active) revert NotActive();
        Plan storage p = plans[sub.planId];
        if (block.timestamp < sub.nextCharge) revert TooEarly();
        if (sub.balance < p.price) revert InsufficientBalance();

        sub.balance -= p.price;
        sub.nextCharge = uint64(block.timestamp) + p.period;

        (bool sent,) = payable(p.provider).call{value: p.price}("");
        if (!sent) revert TransferFailed();
        emit Charged(subId, p.price, sub.nextCharge);
    }

    function topUp(uint256 subId) external payable {
        Subscription storage sub = subs[subId];
        if (!sub.active) revert NotActive();
        sub.balance += msg.value;
        emit ToppedUp(subId, msg.value);
    }

    function cancel(uint256 subId) external nonReentrant {
        Subscription storage sub = subs[subId];
        if (msg.sender != sub.subscriber) revert NotSubscriber();
        if (!sub.active) revert NotActive();
        uint256 refund = sub.balance;
        sub.balance = 0;
        sub.active = false;
        if (refund > 0) {
            (bool sent,) = payable(sub.subscriber).call{value: refund}("");
            if (!sent) revert TransferFailed();
        }
        emit Cancelled(subId, refund);
    }
}
