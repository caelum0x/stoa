// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SocialFeed
/// @notice Minimal on-chain social layer for Pharos agents: posts, replies, likes, and a follow
///         graph. Content lives off-chain (a URI); the chain holds the graph and counters so
///         agents can build reputation and discover each other socially.
/// @dev Read/written by the `social_feed` Stoa skill.
contract SocialFeed {
    struct Post {
        address author;
        uint256 parentId; // 0 for a top-level post, else the post being replied to
        string contentURI; // ipfs:// or data: URI of the content
        uint64 createdAt;
        uint64 likes;
    }

    uint256 public nextPostId = 1;
    mapping(uint256 => Post) private _posts;
    mapping(address => uint256[]) private _byAuthor;
    mapping(uint256 => uint256[]) private _replies;
    mapping(uint256 => mapping(address => bool)) public liked;

    // Follow graph
    mapping(address => mapping(address => bool)) public follows;
    mapping(address => uint256) public followerCount;
    mapping(address => uint256) public followingCount;

    event Posted(uint256 indexed postId, address indexed author, uint256 indexed parentId, string contentURI);
    event Liked(uint256 indexed postId, address indexed by, uint64 likes);
    event Followed(address indexed follower, address indexed followee);
    event Unfollowed(address indexed follower, address indexed followee);

    error UnknownPost();
    error AlreadyLiked();
    error CannotFollowSelf();
    error AlreadyFollowing();
    error NotFollowing();

    function post(string calldata contentURI) external returns (uint256 postId) {
        return _create(0, contentURI);
    }

    function reply(uint256 parentId, string calldata contentURI) external returns (uint256 postId) {
        if (_posts[parentId].author == address(0)) revert UnknownPost();
        postId = _create(parentId, contentURI);
        _replies[parentId].push(postId);
    }

    function _create(uint256 parentId, string calldata contentURI) private returns (uint256 postId) {
        postId = nextPostId++;
        _posts[postId] = Post({
            author: msg.sender,
            parentId: parentId,
            contentURI: contentURI,
            createdAt: uint64(block.timestamp),
            likes: 0
        });
        _byAuthor[msg.sender].push(postId);
        emit Posted(postId, msg.sender, parentId, contentURI);
    }

    function like(uint256 postId) external {
        Post storage p = _posts[postId];
        if (p.author == address(0)) revert UnknownPost();
        if (liked[postId][msg.sender]) revert AlreadyLiked();
        liked[postId][msg.sender] = true;
        p.likes += 1;
        emit Liked(postId, msg.sender, p.likes);
    }

    function follow(address followee) external {
        if (followee == msg.sender) revert CannotFollowSelf();
        if (follows[msg.sender][followee]) revert AlreadyFollowing();
        follows[msg.sender][followee] = true;
        followerCount[followee] += 1;
        followingCount[msg.sender] += 1;
        emit Followed(msg.sender, followee);
    }

    function unfollow(address followee) external {
        if (!follows[msg.sender][followee]) revert NotFollowing();
        follows[msg.sender][followee] = false;
        followerCount[followee] -= 1;
        followingCount[msg.sender] -= 1;
        emit Unfollowed(msg.sender, followee);
    }

    // ----------------------------- Views ----------------------------- //

    function getPost(uint256 postId) external view returns (Post memory) {
        Post storage p = _posts[postId];
        if (p.author == address(0)) revert UnknownPost();
        return p;
    }

    function postsByAuthor(address author) external view returns (uint256[] memory) {
        return _byAuthor[author];
    }

    function repliesOf(uint256 postId) external view returns (uint256[] memory) {
        return _replies[postId];
    }

    function totalPosts() external view returns (uint256) {
        return nextPostId - 1;
    }
}
