/// Typed ABI for SocialFeed (kept in sync with packages/contracts/src/SocialFeed.sol).
export const socialFeedAbi = [
  { type: "function", name: "post", stateMutability: "nonpayable", inputs: [{ name: "contentURI", type: "string" }], outputs: [{ name: "postId", type: "uint256" }] },
  { type: "function", name: "reply", stateMutability: "nonpayable", inputs: [{ name: "parentId", type: "uint256" }, { name: "contentURI", type: "string" }], outputs: [{ name: "postId", type: "uint256" }] },
  { type: "function", name: "like", stateMutability: "nonpayable", inputs: [{ name: "postId", type: "uint256" }], outputs: [] },
  { type: "function", name: "follow", stateMutability: "nonpayable", inputs: [{ name: "followee", type: "address" }], outputs: [] },
  { type: "function", name: "unfollow", stateMutability: "nonpayable", inputs: [{ name: "followee", type: "address" }], outputs: [] },
  {
    type: "function",
    name: "getPost",
    stateMutability: "view",
    inputs: [{ name: "postId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "author", type: "address" },
          { name: "parentId", type: "uint256" },
          { name: "contentURI", type: "string" },
          { name: "createdAt", type: "uint64" },
          { name: "likes", type: "uint64" },
        ],
      },
    ],
  },
  { type: "function", name: "postsByAuthor", stateMutability: "view", inputs: [{ name: "author", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
  { type: "function", name: "repliesOf", stateMutability: "view", inputs: [{ name: "postId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
  { type: "function", name: "followerCount", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "followingCount", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "follows", stateMutability: "view", inputs: [{ name: "", type: "address" }, { name: "", type: "address" }], outputs: [{ name: "", type: "bool" }] },
  { type: "function", name: "totalPosts", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    type: "event",
    name: "Posted",
    inputs: [
      { name: "postId", type: "uint256", indexed: true },
      { name: "author", type: "address", indexed: true },
      { name: "parentId", type: "uint256", indexed: true },
      { name: "contentURI", type: "string", indexed: false },
    ],
  },
] as const;
