// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {TestBase} from "./TestBase.sol";
import {SocialFeed} from "../src/SocialFeed.sol";

contract SocialFeedTest is TestBase {
    SocialFeed internal feed;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        feed = new SocialFeed();
    }

    function test_PostReplyLike() public {
        vm.prank(alice);
        uint256 p = feed.post("ipfs://hello");
        vm.prank(bob);
        uint256 r = feed.reply(p, "ipfs://reply");

        assertEq(feed.repliesOf(p).length, 1, "one reply");
        assertEq(feed.repliesOf(p)[0], r, "reply id");

        vm.prank(bob);
        feed.like(p);
        assertEq(uint256(feed.getPost(p).likes), 1, "one like");

        vm.prank(bob);
        vm.expectRevert(SocialFeed.AlreadyLiked.selector);
        feed.like(p);
    }

    function test_FollowGraph() public {
        vm.prank(alice);
        feed.follow(bob);
        assertEq(feed.followerCount(bob), 1, "bob 1 follower");
        assertEq(feed.followingCount(alice), 1, "alice follows 1");
        assertTrue(feed.follows(alice, bob), "edge exists");

        vm.prank(alice);
        feed.unfollow(bob);
        assertEq(feed.followerCount(bob), 0, "follower removed");
    }

    function test_CannotFollowSelf() public {
        vm.prank(alice);
        vm.expectRevert(SocialFeed.CannotFollowSelf.selector);
        feed.follow(alice);
    }
}
