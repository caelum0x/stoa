import type { Action } from "../../types.js";
import { socialPostAction } from "./post.js";
import { socialReplyAction } from "./reply.js";
import { socialLikeAction } from "./like.js";
import { socialFollowAction } from "./follow.js";
import { socialUnfollowAction } from "./unfollow.js";
import { socialGetPostAction } from "./getPost.js";
import { socialPostsByAuthorAction } from "./postsByAuthor.js";
import { socialFollowInfoAction } from "./followInfo.js";

export const socialActions: Action[] = [
  socialPostAction,
  socialReplyAction,
  socialLikeAction,
  socialFollowAction,
  socialUnfollowAction,
  socialGetPostAction,
  socialPostsByAuthorAction,
  socialFollowInfoAction,
];

export {
  socialPostAction,
  socialReplyAction,
  socialLikeAction,
  socialFollowAction,
  socialUnfollowAction,
  socialGetPostAction,
  socialPostsByAuthorAction,
  socialFollowInfoAction,
};
