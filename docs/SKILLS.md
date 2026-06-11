# Stoa Skill Catalog

> Auto-generated from the skill registry. **251 skills** across 62 domains.

## commerce (7)

| Skill | Description |
|-------|-------------|
| `X402_PAY` | Pay an x402-protected HTTP endpoint on Pharos and return its content. Optionally enforces a maxPrice budget by reading the 402 quote before paying. |
| `X402_MONETIZE` | Expose content behind an x402 paywall on Pharos. Returns a URL that other agents can pay to access; revenue settles to this agent's address. |
| `AGENT_IDENTITY` | Register, resolve, or update an agent identity in the StoaRegistry on Pharos. Identities carry an off-chain metadata URI (agent card) and accrue on-chain reputation. |
| `REPUTATION` | Attest to an agent's reputation on Pharos (one attestation per address, no self-rating) or read its accumulated score from the StoaRegistry. |
| `AGENT_ESCROW` | Manage milestone escrow on Pharos: lock funds for a job, release milestones to the worker, refund the remainder, or read job state. Supports native PHRS and ERC-20. |
| `TREASURY_GUARD` | Send PHRS or ERC-20 on Pharos through policy guards: recipient allowlist, per-tx ceiling, rolling 24h cap, and a pre-flight simulation. Rejects any transfer that violates policy. |
| `SERVICE_LISTING` | List, update, and discover agent services on Pharos via the ServiceRegistry. Services carry a capability tag, an x402 endpoint, and a headline price so other agents can find and hire them. |

## chain (9)

| Skill | Description |
|-------|-------------|
| `GET_BLOCK_NUMBER` | Return the latest block number on the connected Pharos network. |
| `GET_GAS_PRICE` | Return the current gas price on the connected Pharos network, in wei and gwei. |
| `GET_NATIVE_BALANCE` | Return the native PHRS balance of an address (defaults to the agent's own address). |
| `GET_TX_STATUS` | Return whether a transaction succeeded, its block, and gas used on Pharos. |
| `GET_NONCE` | Return the transaction count (nonce) for an address on Pharos. |
| `GET_CHAIN_INFO` | Return the connected Pharos network's id, name, native currency, and RPC URL. |
| `IS_CONTRACT` | Return whether an address is a contract (has bytecode) or an EOA on Pharos. |
| `GET_BLOCK` | Return a summary of a Pharos block: timestamp, transaction count, gas used/limit. |
| `ESTIMATE_GAS` | Estimate the gas required for a transaction from the agent on Pharos. |

## token (6)

| Skill | Description |
|-------|-------------|
| `ERC20_BALANCE` | Return the ERC-20 balance of an account on Pharos, formatted by the token's decimals. |
| `ERC20_TRANSFER` | Transfer ERC-20 tokens from the agent to a recipient on Pharos. |
| `ERC20_APPROVE` | Approve a spender to transfer the agent's ERC-20 tokens on Pharos. |
| `ERC20_ALLOWANCE` | Return the remaining ERC-20 allowance an owner has granted a spender on Pharos. |
| `ERC20_METADATA` | Return an ERC-20 token's name, symbol, decimals, and total supply on Pharos. |
| `ERC20_TRANSFER_FROM` | Transfer ERC-20 tokens from an approving owner to a recipient, using the agent's allowance. |

## native (2)

| Skill | Description |
|-------|-------------|
| `NATIVE_TRANSFER` | Send native PHRS from the agent to a recipient on Pharos. |
| `NATIVE_MULTISEND` | Send native PHRS to multiple recipients in sequence; returns a tx hash per payment. |

## wallet (3)

| Skill | Description |
|-------|-------------|
| `GET_AGENT_ADDRESS` | Return the agent's own on-chain address and chain id. |
| `SIGN_MESSAGE` | Sign a UTF-8 message with the agent's key (EIP-191). Returns the signature. |
| `VERIFY_MESSAGE` | Recover the address that signed a message (EIP-191) and optionally compare it to an expected signer. |

## nft (9)

| Skill | Description |
|-------|-------------|
| `ERC721_OWNER_OF` | Return the owner address of a specific ERC-721 token on Pharos. |
| `ERC721_BALANCE` | Return the number of ERC-721 tokens an owner holds in a collection on Pharos. |
| `ERC721_TOKEN_URI` | Return the tokenURI (metadata location) of a specific ERC-721 token on Pharos. |
| `ERC721_METADATA` | Return the name and symbol of an ERC-721 collection on Pharos. |
| `ERC721_TRANSFER` | Safely transfer an ERC-721 token from the agent to a recipient on Pharos. |
| `ERC721_APPROVE` | Approve an address to transfer a specific ERC-721 token owned by the agent on Pharos. |
| `ERC721_SET_APPROVAL_FOR_ALL` | Grant or revoke an operator's approval over all of the agent's ERC-721 tokens in a collection on Pharos. |
| `ERC721_IS_APPROVED_FOR_ALL` | Check whether an operator is approved for all of an owner's ERC-721 tokens in a collection on Pharos. |
| `ERC721_GET_APPROVED` | Return the address approved to transfer a specific ERC-721 token on Pharos. |

## erc1155 (6)

| Skill | Description |
|-------|-------------|
| `ERC1155_BALANCE` | Return the ERC-1155 balance of a given token id for an account on Pharos. |
| `ERC1155_BALANCE_BATCH` | Return ERC-1155 balances for paired accounts and ids via balanceOfBatch on Pharos. |
| `ERC1155_URI` | Return the metadata URI for an ERC-1155 token id on Pharos. |
| `ERC1155_IS_APPROVED_FOR_ALL` | Return whether an operator is approved for all of an owner's ERC-1155 tokens on Pharos. |
| `ERC1155_SET_APPROVAL_FOR_ALL` | Grant or revoke operator approval for all of the agent's ERC-1155 tokens on Pharos. |
| `ERC1155_SAFE_TRANSFER` | Transfer an amount of an ERC-1155 token id from the agent to a recipient on Pharos. |

## contract (5)

| Skill | Description |
|-------|-------------|
| `CONTRACT_READ` | Read from any contract by calling a view/pure function with a supplied ABI. |
| `CONTRACT_WRITE` | Send a state-changing transaction to any contract using a supplied ABI; waits for the receipt. |
| `CONTRACT_SIMULATE` | Simulate a contract call from the agent's account without broadcasting, returning the would-be result. |
| `GET_STORAGE_AT` | Read the raw 32-byte value stored at a contract storage slot. |
| `CONTRACT_MULTICALL` | Aggregate many contract view calls into a single multicall, returning each result (allowing failures). |

## utils (10)

| Skill | Description |
|-------|-------------|
| `IS_ADDRESS` | Return whether the given string is a valid EVM (0x) address. |
| `CHECKSUM_ADDRESS` | Convert an EVM address to its EIP-55 checksummed representation. |
| `KECCAK256` | Compute the keccak-256 hash of hex data (0x-prefixed) or a UTF-8 string. |
| `TO_HEX` | Encode a value to 0x-prefixed hex. Decimal-integer strings encode as bigint, everything else as a UTF-8 string. |
| `FROM_HEX` | Decode a 0x-prefixed hex value into a string, number, or bigint. |
| `PARSE_UNITS` | Convert a human-readable decimal amount into base units given a decimals count. |
| `FORMAT_UNITS` | Convert a base-unit integer string into a human-readable decimal amount given a decimals count. |
| `NAMEHASH` | Compute the ENS namehash (node) for a dotted name. |
| `STRING_TO_HEX` | Encode a UTF-8 string into its 0x-prefixed hex representation. |
| `HEX_TO_STRING` | Decode a 0x-prefixed hex value into its UTF-8 string representation. |

## encoding (6)

| Skill | Description |
|-------|-------------|
| `ENCODE_ABI_PARAMETERS` | ABI-encode a list of values against parameter types and return the hex data. |
| `DECODE_ABI_PARAMETERS` | Decode ABI-encoded hex data against parameter types; bigint values become strings. |
| `FUNCTION_SELECTOR` | Compute the 4-byte function selector for a Solidity function signature. |
| `EVENT_TOPIC` | Compute the topic0 (keccak256) hash for a Solidity event signature. |
| `ENCODE_FUNCTION_DATA` | Encode calldata (selector + args) for a function call given an ABI and arguments. |
| `DECODE_FUNCTION_DATA` | Decode calldata against an ABI into the matched function name and arguments; bigints become strings. |

## defi (6)

| Skill | Description |
|-------|-------------|
| `PRICE_FEED_READ` | Read the latest price from a Chainlink-style AggregatorV3 feed, formatted by its decimals. |
| `ERC4626_TOTAL_ASSETS` | Return the total amount of underlying assets managed by an ERC-4626 vault. |
| `ERC4626_CONVERT_TO_ASSETS` | Convert a given amount of ERC-4626 vault shares to the equivalent underlying assets. |
| `ERC4626_CONVERT_TO_SHARES` | Convert a given amount of underlying assets to the equivalent ERC-4626 vault shares. |
| `ERC4626_PREVIEW_REDEEM` | Preview the amount of underlying assets returned for redeeming a given number of ERC-4626 vault shares. |
| `UNIV2_RESERVES` | Read the reserves and token0/token1 addresses of a UniswapV2-style liquidity pair. |

## portfolio (2)

| Skill | Description |
|-------|-------------|
| `PORTFOLIO` | Return the native PHRS balance and formatted balances for a list of ERC-20 tokens. |
| `TOKEN_HOLDINGS` | Return the native PHRS balance and only the ERC-20 tokens with a nonzero balance. |

## explorer (4)

| Skill | Description |
|-------|-------------|
| `EXPLORER_TX_URL` | Build the block explorer URL for a transaction hash on the connected Pharos network. |
| `EXPLORER_ADDRESS_URL` | Build the block explorer URL for an address on the connected Pharos network. |
| `EXPLORER_BLOCK_URL` | Build the block explorer URL for a block number on the connected Pharos network. |
| `EXPLORER_TOKEN_URL` | Build the block explorer URL for a token contract on the connected Pharos network. |

## social (8)

| Skill | Description |
|-------|-------------|
| `SOCIAL_POST` | Publish a new post to the Pharos social feed and return its post id. |
| `SOCIAL_REPLY` | Reply to an existing post on the Pharos social feed. |
| `SOCIAL_LIKE` | Like a post on the Pharos social feed. |
| `SOCIAL_FOLLOW` | Follow another account on the Pharos social feed. |
| `SOCIAL_UNFOLLOW` | Unfollow an account on the Pharos social feed. |
| `SOCIAL_GET_POST` | Read a single post from the Pharos social feed by its id. |
| `SOCIAL_POSTS_BY_AUTHOR` | List the post ids authored by an account on the Pharos social feed. |
| `SOCIAL_FOLLOW_INFO` | Return the follower and following counts for an account on the Pharos social feed. |

## tip (3)

| Skill | Description |
|-------|-------------|
| `TIP_SEND` | Send a native PHRS tip to a recipient through the TipJar contract, with an optional memo. |
| `TIP_WITHDRAW` | Withdraw all native PHRS tips accumulated for the agent in the TipJar contract. |
| `TIP_STATS` | Read TipJar stats for an account: withdrawable balance, total received, and total given, all in PHRS. |

## stream (5)

| Skill | Description |
|-------|-------------|
| `STREAM_CREATE` | Create a native PHRS payment stream that linearly vests from start to stop on Pharos. |
| `STREAM_WITHDRAW` | Withdraw an amount of vested native PHRS from an existing payment stream on Pharos. |
| `STREAM_CANCEL` | Cancel a native PHRS payment stream on Pharos, settling vested and unvested balances. |
| `STREAM_GET` | Read a payment stream's sender, recipient, token, deposit, withdrawn, window, and cancelled flag on Pharos. |
| `STREAM_WITHDRAWABLE` | Read the currently withdrawable and total streamed PHRS amounts for a payment stream on Pharos. |

## events (3)

| Skill | Description |
|-------|-------------|
| `EVENTS_GET_LOGS` | Fetch raw event logs on Pharos, optionally filtered by contract address and block range. |
| `EVENTS_PARSE_RECEIPT` | Fetch a transaction receipt on Pharos and decode its event logs using the provided ABI. |
| `EVENTS_BY_CONTRACT` | Fetch and decode events of a given name emitted by a contract on Pharos. |

## math (8)

| Skill | Description |
|-------|-------------|
| `MATH_ADD` | Add two integer strings using bigint arithmetic. No network access. |
| `MATH_SUB` | Subtract b from a using bigint arithmetic. No network access. |
| `MATH_MUL` | Multiply two integer strings using bigint arithmetic. No network access. |
| `MATH_DIV` | Integer-divide a by b using bigint arithmetic. Fails on divide-by-zero. No network access. |
| `MATH_MIN` | Return the minimum of a list of integer strings using bigint arithmetic. No network access. |
| `MATH_MAX` | Return the maximum of a list of integer strings using bigint arithmetic. No network access. |
| `MATH_COMPARE` | Compare a and b: returns -1 if a<b, 0 if equal, 1 if a>b. Uses bigint. No network access. |
| `MATH_PERCENT_OF` | Compute (value * percent / 100) using bigint integer arithmetic. No network access. |

## format (5)

| Skill | Description |
|-------|-------------|
| `FORMAT_TOKEN_AMOUNT` | Format a base-unit token amount into a human-readable decimal string, optionally suffixed with a symbol. Pure, no network access. |
| `FORMAT_SHORT_ADDRESS` | Shorten a 0x address to its first 6 and last 4 characters joined by an ellipsis. Pure, no network access. |
| `FORMAT_DURATION` | Convert a whole-second duration into a compact human string such as "1h 2m 3s". Pure, no network access. |
| `FORMAT_TIMESTAMP` | Convert a Unix timestamp in seconds to an ISO 8601 UTC date-time string. Pure, no network access. |
| `FORMAT_GWEI` | Format a wei amount into a gwei decimal string, useful for displaying gas prices. Pure, no network access. |

## validate (5)

| Skill | Description |
|-------|-------------|
| `VALIDATE_IS_HEX` | Pure validator: returns whether the given value is a valid 0x-prefixed hex string. |
| `VALIDATE_IS_TX_HASH` | Pure validator: returns whether the given value is a 0x-prefixed 32-byte transaction hash. |
| `VALIDATE_IS_ADDRESS` | Pure validator: returns whether the given value is a valid EVM address per viem isAddress. |
| `VALIDATE_IS_UINT` | Pure validator: returns whether the given value is a non-negative integer string (uint). |
| `VALIDATE_IS_CHECKSUM` | Pure validator: returns whether the given address is a correctly EIP-55 checksummed address. |

## keys (2)

| Skill | Description |
|-------|-------------|
| `KEY_GENERATE_PRIVATE_KEY` | Generate a fresh random private key and its derived address. TESTNET/dev use only — never use a generated key to hold real funds. |
| `KEY_ADDRESS_FROM_PRIVATE_KEY` | Derive the EVM address corresponding to a given private key. |

## typeddata (3)

| Skill | Description |
|-------|-------------|
| `SIGN_TYPED_DATA` | Sign an EIP-712 typed-data payload with the agent's wallet and return the signature. |
| `HASH_TYPED_DATA` | Compute the EIP-712 struct hash (digest) of a typed-data payload without signing. |
| `HASH_MESSAGE` | Compute the EIP-191 personal-sign hash of a plain string message. |

## txops (3)

| Skill | Description |
|-------|-------------|
| `GET_TRANSACTION` | Fetch a transaction by hash on Pharos and return sender, recipient, value, nonce, and block. |
| `SEND_RAW_TX` | Send a raw native PHRS transaction with optional value and calldata, then wait for the receipt. |
| `WAIT_FOR_TX` | Wait for a transaction receipt on Pharos and return its status, block, and gas used. |

## faucet (3)

| Skill | Description |
|-------|-------------|
| `FAUCET_DRIP` | Claim native PHRS from the Pharos testnet faucet (subject to its cooldown). |
| `FAUCET_FUND` | Deposit native PHRS into the Pharos testnet faucet so others can drip. |
| `FAUCET_STATUS` | Report the faucet's drip amount, cooldown, and the next drip time for an account. |

## discovery (2)

| Skill | Description |
|-------|-------------|
| `AGENT_DISCOVERY` | Discover agents registered on StoaRegistry by scanning AgentRegistered events on Pharos. |
| `SERVICE_DISCOVERY` | Discover services listed on ServiceRegistry by scanning ServiceListed events on Pharos. |

## abitools (6)

| Skill | Description |
|-------|-------------|
| `PARSE_ABI` | Convert an array of human-readable ABI signatures into a structured JSON ABI. |
| `PARSE_ABI_ITEM` | Convert one human-readable ABI signature into a structured JSON ABI item. |
| `FORMAT_ABI_ITEM` | Convert a JSON ABI item (as a JSON string) into its human-readable signature. |
| `GET_ABI_ITEM` | Retrieve a named function, event, or error item from a JSON ABI array. |
| `EXTRACT_FUNCTIONS` | List all function names and human-readable signatures contained in a JSON ABI. |
| `EXTRACT_EVENTS` | List all event names contained in a JSON ABI. |

## hashing (4)

| Skill | Description |
|-------|-------------|
| `SHA256_HASH` | Compute the SHA-256 hash of hex data (0x-prefixed) or a UTF-8 string. |
| `RIPEMD160_HASH` | Compute the RIPEMD-160 hash of hex data (0x-prefixed) or a UTF-8 string. |
| `KECCAK_STRING` | Compute the keccak-256 hash of a UTF-8 string (encoded to hex first). |
| `ID_HASH` | Compute keccak-256 of a function or event signature string (the event topic / function id). |

## units (5)

| Skill | Description |
|-------|-------------|
| `ETHER_TO_WEI` | Convert a decimal ether amount (18 decimals) into its wei base-unit integer string. |
| `WEI_TO_ETHER` | Convert a wei base-unit integer string into its decimal ether representation (18 decimals). |
| `GWEI_TO_WEI` | Convert a decimal gwei amount (9 decimals) into its wei base-unit integer string. |
| `WEI_TO_GWEI` | Convert a wei base-unit integer string into its decimal gwei representation (9 decimals). |
| `CONVERT_UNITS` | Re-denominate an integer base-unit value from one decimals scale to another, returning base units in the target decimals. |

## bytes (7)

| Skill | Description |
|-------|-------------|
| `HEX_TO_BYTES` | Decode a 0x-prefixed hex string into an array of byte values (0-255). |
| `BYTES_TO_HEX` | Encode an array of byte values (0-255) into a 0x-prefixed hex string. |
| `CONCAT_HEX` | Concatenate multiple 0x-prefixed hex strings into a single hex string. |
| `PAD_HEX` | Pad a 0x-prefixed hex string with zero bytes to a target size, left or right. |
| `SIZE_OF` | Return the length in bytes of a 0x-prefixed hex string. |
| `SLICE_HEX` | Extract a byte range [start, end) from a 0x-prefixed hex string. |
| `TRIM_HEX` | Strip leading zero bytes from a 0x-prefixed hex string. |

## account (3)

| Skill | Description |
|-------|-------------|
| `GET_BYTECODE` | Return the deployed runtime bytecode at an address on Pharos, plus its hex length. |
| `GET_CODE_SIZE` | Return the size in bytes of the deployed bytecode at an address on Pharos. |
| `IS_EOA` | Determine whether an address is an EOA (no deployed bytecode) or a contract on Pharos. |

## time (4)

| Skill | Description |
|-------|-------------|
| `UNIX_NOW` | Return the current local wall-clock time as a UNIX timestamp in seconds. |
| `SECONDS_UNTIL` | Return the number of seconds from now until a target UNIX timestamp. Negative if the target is in the past. |
| `CHAIN_TIME` | Return the timestamp of the latest block on the connected Pharos network as a UNIX timestamp in seconds. |
| `FORMAT_RELATIVE` | Format a target UNIX timestamp as a human relative phrase versus now, e.g. "in 3m" or "5m ago". |

## agentcard (2)

| Skill | Description |
|-------|-------------|
| `BUILD_AGENT_CARD` | Compose an agent card JSON object (name, description, capabilities, endpoint, agent address) and a data: URI encoding it. |
| `PARSE_AGENT_CARD` | Decode a "data:application/json," agent card URI back into its JSON object. |

## siwe (2)

| Skill | Description |
|-------|-------------|
| `BUILD_AUTH_MESSAGE` | Build a Sign-In With Ethereum style plaintext message for the agent's address on Pharos. |
| `SIGN_AUTH_MESSAGE` | Sign a SIWE-like plaintext message with the agent's wallet and return the signature. |

## gas (4)

| Skill | Description |
|-------|-------------|
| `ESTIMATE_FEES` | Estimate EIP-1559 gas fees on Pharos: maxFeePerGas and maxPriorityFeePerGas, in wei and gwei. |
| `MAX_PRIORITY_FEE` | Estimate the current max priority fee per gas (tip) on Pharos, in wei and gwei. |
| `BASE_FEE` | Return the base fee per gas of the latest Pharos block, in wei and gwei (or null if unavailable). |
| `TX_FEE_ESTIMATE` | Estimate the total fee for a native PHRS transfer by multiplying estimated gas by the gas price; returns the fee in PHRS. |

## blocks (3)

| Skill | Description |
|-------|-------------|
| `GET_BLOCK_BY_HASH` | Return a summary of a Pharos block identified by its hash: number, timestamp, and transaction count. |
| `BLOCK_TX_COUNT` | Return the number of transactions in a Pharos block, by number or the latest block. |
| `LATEST_BLOCKS` | Return summaries (number, timestamp, transaction count) of the most recent N Pharos blocks. |

## simulate (3)

| Skill | Description |
|-------|-------------|
| `RAW_CALL` | Simulate a low-level call (eth_call) with raw calldata and return the returned 0x bytes. |
| `ESTIMATE_CONTRACT_GAS` | Estimate the gas required to execute a contract function call against Pharos. |
| `PREPARE_TX` | Prepare a transaction request on Pharos and return its gas, fee, and nonce fields. |

## addressutils (4)

| Skill | Description |
|-------|-------------|
| `IS_ZERO_ADDRESS` | Return whether the given address equals the EVM zero address (0x0000...0000). |
| `ADDRESS_EQUAL` | Return whether two EVM addresses are equal, ignoring checksum casing. |
| `COMPUTE_CONTRACT_ADDRESS` | Compute the contract address a CREATE deployment would produce from a deployer address and nonce. |
| `COMPUTE_CREATE2_ADDRESS` | Compute the deterministic CREATE2 contract address from a deployer, salt, and init code hash. |

## sigutils (4)

| Skill | Description |
|-------|-------------|
| `PARSE_SIGNATURE` | Parse a 0x-prefixed hex signature into its r, s, and v / yParity components. |
| `SERIALIZE_SIGNATURE` | Serialize r, s, and yParity components into a single 0x-prefixed hex signature. |
| `RECOVER_PUBLIC_KEY` | Recover the public key that produced a signature over a given hash. |
| `RECOVER_TYPED_DATA_ADDRESS` | Recover the signer address from an EIP-712 typed-data signature. |

## convert (5)

| Skill | Description |
|-------|-------------|
| `HEX_TO_NUMBER` | Convert a 0x-prefixed hex string to a decimal number. |
| `NUMBER_TO_HEX` | Convert an integer to a 0x-prefixed hex string, optionally padded to a byte size. |
| `HEX_TO_BIGINT` | Convert a 0x-prefixed hex string to a big integer, returned as a decimal string. |
| `BOOL_TO_HEX` | Convert a boolean to a 0x-prefixed hex string (0x1 for true, 0x0 for false). |
| `HEX_TO_BOOL` | Convert a 0x-prefixed hex string to a boolean (0x1 is true, 0x0 is false). |

## rpc (2)

| Skill | Description |
|-------|-------------|
| `RAW_RPC_REQUEST` | Advanced escape-hatch: send a raw JSON-RPC request to the Pharos node and return the result. Use only when no dedicated skill exists. |
| `RPC_HEALTH` | Check the configured Pharos RPC endpoint by timing a block-number request; returns reachability, latency, and the current block number. |

## tokenlist (2)

| Skill | Description |
|-------|-------------|
| `LIST_KNOWN_TOKENS` | Return the full registry of well-known tokens on Pharos, mapping symbol to address, decimals, and name. |
| `RESOLVE_TOKEN` | Resolve a token symbol (case-insensitive) to its address, decimals, and name from the known-token registry. |

## permit (2)

| Skill | Description |
|-------|-------------|
| `ERC2612_NONCES` | Return the current ERC-2612 permit nonce for an owner on a token on Pharos. |
| `ERC2612_DOMAIN_SEPARATOR` | Return the EIP-712 DOMAIN_SEPARATOR for an ERC-2612 token on Pharos. |

## chainreg (2)

| Skill | Description |
|-------|-------------|
| `LIST_KNOWN_CHAINS` | List the chains registered with Stoa, including id, name, native currency and default RPC URL. |
| `CHAIN_BY_ID` | Look up a chain in the Stoa registry by its numeric id and return id, name and native currency. |

## multibalance (2)

| Skill | Description |
|-------|-------------|
| `NATIVE_BALANCES` | Return the native PHRS balance for each of several addresses on Pharos, formatted in PHRS. |
| `TOKEN_BALANCES` | Return the ERC-20 balance of one token for each of several accounts on Pharos, formatted by decimals. |

## memo (2)

| Skill | Description |
|-------|-------------|
| `ENCODE_MEMO` | Encode a UTF-8 string into 0x-prefixed hex, suitable for use as transaction calldata or an on-chain memo. |
| `DECODE_MEMO` | Decode 0x-prefixed hex (e.g. transaction calldata or an on-chain memo) back into a UTF-8 string. |

## erc165 (3)

| Skill | Description |
|-------|-------------|
| `SUPPORTS_INTERFACE` | Call ERC-165 supportsInterface(bytes4) on a contract and return whether it supports the given interface id. |
| `IS_ERC721` | Detect whether a contract implements the ERC-721 interface (0x80ac58cd) via ERC-165 supportsInterface. |
| `IS_ERC1155` | Detect whether a contract implements the ERC-1155 interface (0xd9b67a26) via ERC-165 supportsInterface. |

## base64 (3)

| Skill | Description |
|-------|-------------|
| `BASE64_ENCODE` | Encode UTF-8 text into a standard Base64 string. No network access. |
| `BASE64_DECODE` | Decode a standard Base64 string into UTF-8 text. No network access. |
| `BASE64URL_ENCODE` | Encode UTF-8 text into a URL-safe Base64 string (base64url). No network access. |

## random (3)

| Skill | Description |
|-------|-------------|
| `RANDOM_HEX` | Generate a 0x-prefixed hex string from Node crypto random bytes. Note: NOT intended to provide key-generation security guarantees beyond Node crypto. |
| `RANDOM_UUID` | Generate a random RFC 4122 version 4 UUID using Node crypto. |
| `RANDOM_BYTES` | Generate an array of random byte values (0-255) from Node crypto. |

## duration (3)

| Skill | Description |
|-------|-------------|
| `PARSE_DURATION` | Parse a compact duration string (d/h/m/s units) into total seconds. No network access. |
| `HUMANIZE_SECONDS` | Convert a seconds count into a human-readable "1d 2h 3m 4s" string, omitting zero units. No network access. |
| `FORMAT_COUNTDOWN` | Format a seconds count as a zero-padded "HH:MM:SS" string. Hours may exceed 99. No network access. |

## pricemath (3)

| Skill | Description |
|-------|-------------|
| `APPLY_BPS` | Compute amount * bps / 10000 using exact bigint math. No network access. |
| `SLIPPAGE_MIN_OUT` | Compute amount * (10000 - slippageBps) / 10000 using exact bigint math. No network access. |
| `PRICE_FROM_RESERVES` | Compute the spot price reserveOut / reserveIn as a decimal string with up to 8 fraction digits using exact bigint math. No network access. |

## amm (3)

| Skill | Description |
|-------|-------------|
| `AMOUNT_OUT` | Compute the Uniswap-v2 output amount for a given input and reserves (0.3% fee). No network access. |
| `AMOUNT_IN` | Compute the Uniswap-v2 input amount required for a desired output and reserves (0.3% fee). No network access. |
| `QUOTE` | Compute the Uniswap-v2 pro-rata equivalent amount of token B for a given amount of token A. No network access. |

## vault4626 (4)

| Skill | Description |
|-------|-------------|
| `PREVIEW_DEPOSIT` | Preview the number of ERC-4626 vault shares minted for depositing a given amount of underlying assets. |
| `PREVIEW_MINT` | Preview the amount of underlying assets required to mint a given number of ERC-4626 vault shares. |
| `MAX_WITHDRAW` | Return the maximum amount of underlying assets an owner can withdraw from an ERC-4626 vault. |
| `VAULT_ASSET` | Return the address of the underlying asset token managed by an ERC-4626 vault. |

## erc721enum (3)

| Skill | Description |
|-------|-------------|
| `ERC721_TOTAL_SUPPLY` | Return the total supply of an ERC-721 Enumerable collection on Pharos. |
| `TOKEN_BY_INDEX` | Return the token id at a global index of an ERC-721 Enumerable collection. |
| `TOKEN_OF_OWNER_BY_INDEX` | Return the token id owned by an account at a per-owner index of an ERC-721 Enumerable collection. |

## nodeinfo (3)

| Skill | Description |
|-------|-------------|
| `CLIENT_VERSION` | Return the Pharos node's client software version string via the web3_clientVersion JSON-RPC method. |
| `SYNC_STATUS` | Return the Pharos node's sync status via eth_syncing: false when fully synced, or an object describing sync progress. |
| `CHAIN_ID_RPC` | Return the Pharos chain id straight from the node via the eth_chainId JSON-RPC method, as both the raw hex string and a parsed decimal number. |

## permitsign (1)

| Skill | Description |
|-------|-------------|
| `BUILD_PERMIT_TYPED_DATA` | Build the EIP-712 typed data object for an ERC-2612 Permit. Owner is the agent. Pure: no network access. |

## sessionkey (6)

| Skill | Description |
|-------|-------------|
| `SESSION_DEPOSIT` | Deposit native PHRS into the SessionKeyManager so authorized session keys can spend against it. |
| `SESSION_AUTHORIZE` | Authorize a session key to spend up to a PHRS cap until a given expiry through the SessionKeyManager. |
| `SESSION_REVOKE` | Revoke a previously authorized session key so it can no longer spend through the SessionKeyManager. |
| `SESSION_SPEND` | As an authorized session key, spend an owner's deposited PHRS to a recipient via the SessionKeyManager. |
| `SESSION_WITHDRAW` | Withdraw unspent native PHRS from your SessionKeyManager balance back to your wallet. |
| `SESSION_ALLOWANCE` | Read the spending cap, expiry, and active flag for a session key under an owner from the SessionKeyManager. |

## subscription (6)

| Skill | Description |
|-------|-------------|
| `SUBSCRIPTION_CREATE_PLAN` | Create a recurring subscription plan with a native PHRS price charged every period seconds. |
| `SUBSCRIPTION_SUBSCRIBE` | Subscribe to a billing plan on SubscriptionManager, funding the subscription with native PHRS. |
| `SUBSCRIPTION_CHARGE` | Charge a due subscription on SubscriptionManager, debiting its balance and advancing the next charge time. |
| `SUBSCRIPTION_TOPUP` | Top up a subscription's balance with native PHRS so future charges can be collected. |
| `SUBSCRIPTION_CANCEL` | Cancel an active subscription on SubscriptionManager, stopping future charges. |
| `SUBSCRIPTION_GET` | Read a subscription's plan, subscriber, balance, next charge time, and active flag from SubscriptionManager. |

## vault (6)

| Skill | Description |
|-------|-------------|
| `VAULT_SUBMIT` | Submit a new transaction proposal to the AgentVault multisig, sending native PHRS and optional calldata. |
| `VAULT_CONFIRM` | Confirm a pending AgentVault transaction proposal, adding the caller's approval toward the threshold. |
| `VAULT_REVOKE` | Revoke the caller's confirmation on a pending AgentVault transaction, lowering its approval count. |
| `VAULT_EXECUTE` | Execute an AgentVault transaction that has met its confirmation threshold, dispatching the funds and calldata. |
| `VAULT_GET_TX` | Read a single AgentVault transaction proposal: destination, value, calldata, executed flag, and confirmation count. |
| `VAULT_INFO` | Read the AgentVault configuration: confirmation threshold, owner count, and total transaction count. |

## dispute (3)

| Skill | Description |
|-------|-------------|
| `DISPUTE_OPEN` | Open a dispute case in the ArbiterPanel referencing a StoaEscrow job, with evidence. |
| `DISPUTE_VOTE` | Vote as an arbiter on a dispute case (favor payee or payer). Requires arbiter rights. |
| `DISPUTE_GET` | Read a dispute case: referenced job, evidence, vote tally, and current verdict. |

## keeper (2)

| Skill | Description |
|-------|-------------|
| `KEEPER_SCAN_SUBSCRIPTIONS` | Scan subscriptions and report which are currently chargeable (active, past nextCharge, funded). |
| `KEEPER_CHARGE_DUE` | Attempt to charge each given subscription; collects tx hashes for those that succeed. |

## rwa (4)

| Skill | Description |
|-------|-------------|
| `RWA_ISSUE` | Issue a real-world-asset receipt (type, valuation, metadata) to a holder in the RwaRegistry. |
| `RWA_TRANSFER` | Transfer a real-world-asset receipt you hold to another address. |
| `RWA_REDEEM` | Redeem (settle) a real-world-asset receipt. Callable by the holder or issuer. |
| `RWA_GET` | Read a real-world-asset receipt by id, or list the asset ids ever held by an address. |

## repvalue (2)

| Skill | Description |
|-------|-------------|
| `REPUTATION_VALUE_RECORD` | Record that you settled some value with an agent, accruing its value-weighted reputation. Meant to be called by the paying counterparty after an escrow/tip/stream settles. |
| `REPUTATION_VALUE_SCORE` | Read an agent's value-weighted reputation: total value settled, job count, and average. |
