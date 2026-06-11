// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RwaRegistry
/// @notice A registry of tokenized real-world-asset (RWA) receipts — Pharos's RealFi thesis applied
///         to agents. An issuer records an asset (type, valuation, metadata) held by an address;
///         holders can transfer it, and the holder or issuer can redeem (settle) it.
/// @dev Read/written by the `rwa` Stoa skill. Non-fungible receipts identified by a sequential id.
contract RwaRegistry {
    struct Asset {
        address issuer;
        address holder;
        string assetType; // e.g. "invoice", "tbill", "real-estate"
        uint256 valuation; // base-unit valuation (informational)
        string metadataURI;
        bool redeemed;
    }

    uint256 public nextAssetId = 1;
    mapping(uint256 => Asset) private _assets;
    mapping(address => uint256[]) private _byHolder;

    event Issued(uint256 indexed assetId, address indexed issuer, address indexed holder, uint256 valuation);
    event Transferred(uint256 indexed assetId, address indexed from, address indexed to);
    event Redeemed(uint256 indexed assetId);

    error UnknownAsset();
    error NotHolder();
    error NotAuthorized();
    error AlreadyRedeemed();
    error BadParams();

    function issue(address holder, string calldata assetType, uint256 valuation, string calldata metadataURI)
        external
        returns (uint256 assetId)
    {
        if (holder == address(0) || bytes(assetType).length == 0) revert BadParams();
        assetId = nextAssetId++;
        _assets[assetId] = Asset({
            issuer: msg.sender,
            holder: holder,
            assetType: assetType,
            valuation: valuation,
            metadataURI: metadataURI,
            redeemed: false
        });
        _byHolder[holder].push(assetId);
        emit Issued(assetId, msg.sender, holder, valuation);
    }

    function transfer(uint256 assetId, address to) external {
        Asset storage a = _assets[assetId];
        if (a.issuer == address(0)) revert UnknownAsset();
        if (a.holder != msg.sender) revert NotHolder();
        if (a.redeemed) revert AlreadyRedeemed();
        if (to == address(0)) revert BadParams();
        a.holder = to;
        _byHolder[to].push(assetId);
        emit Transferred(assetId, msg.sender, to);
    }

    function redeem(uint256 assetId) external {
        Asset storage a = _assets[assetId];
        if (a.issuer == address(0)) revert UnknownAsset();
        if (msg.sender != a.holder && msg.sender != a.issuer) revert NotAuthorized();
        if (a.redeemed) revert AlreadyRedeemed();
        a.redeemed = true;
        emit Redeemed(assetId);
    }

    function getAsset(uint256 assetId) external view returns (Asset memory) {
        Asset storage a = _assets[assetId];
        if (a.issuer == address(0)) revert UnknownAsset();
        return a;
    }

    /// @notice Asset ids ever associated with a holder (may include since-transferred ids; check
    ///         the current holder via getAsset).
    function assetsByHolder(address holder) external view returns (uint256[] memory) {
        return _byHolder[holder];
    }
}
