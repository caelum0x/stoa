// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Deploy} from "./Deploy.s.sol";

/// @notice Deploys the full Stoa suite to a local node (e.g. anvil). Inherits {Deploy.run}.
/// @dev forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://127.0.0.1:8545 --broadcast
contract DeployLocal is Deploy {}
