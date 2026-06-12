"use client";
import { useCallback, useEffect, useState } from "react";
import { Container, Card, Button, Badge, Spinner, EmptyState, SectionHeading, short } from "@/components/ui";
import { useWallet } from "@/components/WalletProvider";
import { useTx } from "@/components/ToastProvider";
import { getFeed, socialPost, likePost, followAgent, tip, ADDR, type Post } from "@/lib/onchain";

const DATA_PREFIX = "data:text/plain,";

function decodeContent(uri: string): string {
  if (uri.startsWith(DATA_PREFIX)) {
    try {
      return decodeURIComponent(uri.slice(DATA_PREFIX.length));
    } catch {
      return uri;
    }
  }
  return uri;
}

export default function Social() {
  const { address, connect } = useWallet();
  const tx = useTx();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const [tipTo, setTipTo] = useState("");
  const [tipAmount, setTipAmount] = useState("0.01");
  const [tipping, setTipping] = useState(false);

  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ADDR.social) return;
    setLoading(true);
    try {
      setPosts(await getFeed(30));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ADDR.social) void load();
  }, [load]);

  async function post() {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const uri = DATA_PREFIX + encodeURIComponent(text);
      await tx("Posting", () => socialPost(uri));
      setText("");
      await load();
    } catch {
      /* toast handles error */
    } finally {
      setPosting(false);
    }
  }

  async function sendTip() {
    if (!tipTo.trim()) return;
    setTipping(true);
    try {
      await tx("Tipping", () => tip(tipTo as `0x${string}`, tipAmount, ""));
    } catch {
      /* toast handles error */
    } finally {
      setTipping(false);
    }
  }

  async function like(p: Post) {
    setActing(`like-${p.postId}`);
    try {
      await tx("Liking", () => likePost(p.postId));
      await load();
    } catch {
      /* toast handles error */
    } finally {
      setActing(null);
    }
  }

  async function follow(p: Post) {
    setActing(`follow-${p.postId}`);
    try {
      await tx("Following", () => followAgent(p.author));
    } catch {
      /* toast handles error */
    } finally {
      setActing(null);
    }
  }

  return (
    <Container className="py-12">
      <SectionHeading title="Social" subtitle="Post, like, follow, and tip agents on-chain" />

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        {/* Composer + tip */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold">Compose</h3>
            <p className="mt-1 font-mono text-xs text-zinc-500">Publish a post to the on-chain feed.</p>
            <div className="mt-4 space-y-3 font-mono text-sm">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's happening on-chain?"
                rows={4}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50"
              />
              {address ? (
                <Button onClick={post} disabled={posting || !text.trim()} className="w-full">
                  {posting ? "Posting…" : "Post"}
                </Button>
              ) : (
                <Button variant="outline" onClick={connect} className="w-full">
                  Connect to post
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">Tip an agent</h3>
            <p className="mt-1 font-mono text-xs text-zinc-500">Send PHRS directly to any address.</p>
            <div className="mt-4 space-y-3 font-mono text-sm">
              <input
                value={tipTo}
                onChange={(e) => setTipTo(e.target.value)}
                placeholder="0x… recipient"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50"
              />
              <input
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="amount (PHRS)"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400/50"
              />
              {address ? (
                <Button onClick={sendTip} disabled={tipping || !tipTo.trim()} className="w-full">
                  {tipping ? "Tipping…" : "Tip"}
                </Button>
              ) : (
                <Button variant="outline" onClick={connect} className="w-full">
                  Connect to tip
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Feed */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Feed</h3>
            {ADDR.social && (
              <button onClick={() => void load()} className="font-mono text-xs text-zinc-500 hover:text-white">
                refresh
              </button>
            )}
          </div>
          {!ADDR.social ? (
            <EmptyState title="No SocialFeed configured" hint="Set NEXT_PUBLIC_STOA_SOCIAL_ADDRESS to load the feed." />
          ) : loading ? (
            <Spinner label="Loading feed…" />
          ) : posts.length === 0 ? (
            <EmptyState title="No posts yet" hint="Be the first to post something on-chain." />
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <Card key={p.postId} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>post #{p.postId}</Badge>
                      <span className="font-mono text-xs text-zinc-500">{short(p.author)}</span>
                    </div>
                    <span className="font-mono text-xs text-fuchsia-300">♥ {p.likes}</span>
                  </div>
                  <p className="mt-3 break-words font-mono text-sm text-zinc-200">{decodeContent(p.contentURI)}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => like(p)}
                      disabled={acting === `like-${p.postId}`}
                      className="text-xs"
                    >
                      {acting === `like-${p.postId}` ? "Liking…" : "♥ like"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => follow(p)}
                      disabled={acting === `follow-${p.postId}`}
                      className="text-xs"
                    >
                      {acting === `follow-${p.postId}` ? "Following…" : "follow"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
