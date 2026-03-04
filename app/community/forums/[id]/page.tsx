import type { Metadata } from "next";
import { preloadQuery, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PostContent } from "./post-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const post = await fetchQuery(api.forums.getPostById, {
      postId: id as Id<"forumPosts">,
    });

    if (!post) {
      return {
        title: "Post Not Found",
        description: "This post could not be found on GBC Forums.",
      };
    }

    const description = post.content
      ? post.content.slice(0, 160)
      : `${post.title} - GBC Forums`;

    return {
      title: `${post.title} | GBC Forums`,
      description,
      openGraph: {
        title: `${post.title} | GBC Forums`,
        description,
        type: "article",
        url: `https://gbc-marketplace.xyz/community/forums/${id}`,
      },
      twitter: {
        card: "summary",
        title: `${post.title} | GBC Forums`,
        description,
      },
    };
  } catch {
    return {
      title: "Forum Post",
      description: "View this post on GBC Forums.",
    };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const preloadedPost = await preloadQuery(api.forums.getPostById, {
    postId: id as Id<"forumPosts">,
  });

  const post = await fetchQuery(api.forums.getPostById, {
    postId: id as Id<"forumPosts">,
  });

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DiscussionForumPosting",
              headline: post.title,
              text: post.content,
              author: {
                "@type": "Person",
                name: post.author?.name || "Unknown",
              },
              datePublished: new Date(post.createdAt).toISOString(),
              interactionStatistic: [
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/LikeAction",
                  userInteractionCount: post.likeCount,
                },
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/CommentAction",
                  userInteractionCount: post.replyCount,
                },
              ],
            }),
          }}
        />
      )}
      <PostContent preloadedPost={preloadedPost} />
    </>
  );
}
