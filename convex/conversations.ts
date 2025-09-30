import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { Id } from "./_generated/dataModel";
import type { QueryCtx, MutationCtx } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });
    if (!currentUser) {
      throw new ConvexError("User not Found");
    }

    const conversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    const conversations = await Promise.all(
      conversationMemberships?.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);

        if (!conversation) {
          throw new ConvexError("Conversation could not be Found");
        }
        return conversation;
      })
    );

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation, index) => {
        const allConversationMemberships = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation?._id)
          )
          .collect();

        const lastMessage = await getLastMessageDetails({
          ctx,
          id: conversation.lastMessageId,
        });

        const lastSeenMessage = conversationMemberships[index].lastSeenMessage
          ? await ctx.db.get(conversationMemberships[index].lastSeenMessage!)
          : null;

        const lastSeenMessageTime = lastSeenMessage
          ? lastSeenMessage._creationTime
          : -1;

        const unseenMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .filter((q) => q.gt(q.field("_creationTime"), lastSeenMessageTime))
          .filter((q) => q.neq(q.field("senderId"), currentUser._id))
          .collect();

        if (conversation.isGroup) {
          return {
            conversation,
            lastMessage,
            unseenCount: unseenMessages.length,
          };
        } else {
          const otherMembership = allConversationMemberships.filter(
            (membership) => membership.memberId !== currentUser._id
          )[0];

          const otherMember = await ctx.db.get(otherMembership.memberId);

          return {
            conversation,
            otherMember,
            lastMessage,
            unseenCount: unseenMessages.length,
          };
        }
      })
    );

    return conversationsWithDetails;
  },
});

export const startDM = mutation({
  args: {
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });
    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    // Check if friendship exists
    const friendship1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
      .collect();

    const friendship2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
      .collect();

    const existingFriendship = [...friendship1, ...friendship2].find(
      (friendship) =>
        friendship.user1 === args.friendId || friendship.user2 === args.friendId
    );

    if (!existingFriendship) {
      throw new ConvexError("You are not friends with this user");
    }

    // Check if conversation already exists - MORE ROBUST CHECK
    const currentUserMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    for (const membership of currentUserMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (conversation && !conversation.isGroup) {
        // Get all members of this conversation
        const allMembers = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();

        // Check if the friend is also a member
        const friendIsMember = allMembers.some(
          (m) => m.memberId === args.friendId
        );
        if (friendIsMember) {
          console.log("Found existing conversation:", conversation._id);
          return conversation._id;
        }
      }
    }

    console.log(
      "Creating new conversation between:",
      currentUser._id,
      "and",
      args.friendId
    );

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
    });

    // Create memberships
    await ctx.db.insert("conversationMembers", {
      conversationId,
      memberId: currentUser._id,
    });

    await ctx.db.insert("conversationMembers", {
      conversationId,
      memberId: args.friendId,
    });

    console.log("Created conversation:", conversationId);
    return conversationId;
  },
});

const getLastMessageDetails = async ({
  ctx,
  id,
}: {
  ctx: QueryCtx | MutationCtx;
  id: Id<"messages"> | undefined;
}) => {
  if (!id) return null;

  const message = await ctx.db.get(id);
  if (!message) return null;

  const sender = await ctx.db.get(message.senderId);
  if (!sender) return null;

  const content = getMessageContent(
    message.type,
    message.content as unknown as string
  );
  return {
    content,
    sender: sender.username,
  };
};

const getMessageContent = (type: string, content: string) => {
  switch (type) {
    case "text":
      return content;
    default:
      return "[Non-text]";
  }
};

export const createGroup = mutation({
  args: {
    name: v.string(),
    members: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    console.log("=== CREATE GROUP MUTATION CALLED ===");
    console.log("User identity:", identity.subject);
    console.log("Group name:", args.name);
    console.log("Members:", args.members);

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      console.log("User not found");
      throw new ConvexError("User not found");
    }

    if (!args.members || args.members.length === 0) {
      console.log("No members provided");
      throw new ConvexError("You must select at least one member");
    }

    // Verify all member IDs exist
    for (const memberId of args.members) {
      const member = await ctx.db.get(memberId);
      if (!member) {
        console.log("Invalid member ID:", memberId);
        throw new ConvexError(`Invalid member ID: ${memberId}`);
      }
      console.log("Member found:", member.username);
    }

    // Create group conversation
    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
      lastMessageId: undefined,
    });

    console.log("Conversation created:", conversationId);

    // Add creator
    await ctx.db.insert("conversationMembers", {
      conversationId,
      memberId: currentUser._id,
    });

    // Add other members
    for (const memberId of args.members) {
      await ctx.db.insert("conversationMembers", {
        conversationId,
        memberId,
      });
    }

    console.log("All members added to conversation");
    console.log("=== CREATE GROUP COMPLETED ===");

    return conversationId;
  },
});
