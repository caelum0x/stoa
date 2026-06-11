// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Deploy} from "./Deploy.s.sol";

/// @notice Deploys the full Stoa suite to Pharos Atlantic. Inherits {Deploy.run}.
/// @dev forge script script/DeployAtlantic.s.sol:DeployAtlantic --rpc-url pharos_atlantic --broadcast
contract DeployAtlantic is Deploy {}
