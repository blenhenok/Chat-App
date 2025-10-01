import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const get = query({
  args: {
    id: v.id("conversations"),
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
      throw new ConvexError("User not Found");
    }

    // FIX: Return null if conversation doesn't exist instead of throwing
    const conversation = await ctx.db.get(args.id);
    if (!conversation) {
      return null; // ✅ Graceful handling - conversation was deleted
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", conversation._id)
      )
      .unique();

    // FIX: Return null if user is not a member instead of throwing
    if (!membership) {
      return null; // ✅ Graceful handling - user not a member
    }

    const allConversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
      .collect();

    if (!conversation.isGroup) {
      const otherMembership = allConversationMemberships.filter(
        (membership) => membership.memberId !== currentUser._id
      )[0];

      // FIX: Handle case where other member doesn't exist
      if (!otherMembership) {
        return null;
      }

      const otherMemberDetails = await ctx.db.get(otherMembership.memberId);

      return {
        ...conversation,
        otherMember: {
          ...otherMemberDetails,
          lastSeenMessageId: otherMembership.lastSeenMessage,
        },
        otherMembers: null,
      };
    } else {
      const otherMembers = await Promise.all(
        allConversationMemberships
          .filter((membership) => membership.memberId !== currentUser._id)
          .map(async (membership) => {
            const member = await ctx.db.get(membership.memberId);
            if (!member) {
              return null;
            }

            return {
              _id: member._id,
              username: member.username,
              imageUrl: member.imageUrl,
            };
          })
      ).then((members) => members.filter(Boolean)); // Filter out null values

      return { ...conversation, otherMembers, otherMember: null };
    }
  },
});

export const createGroup = mutation({
  args: {
    members: v.array(v.id("users")),
    name: v.string(),
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
      throw new ConvexError("User not Found");
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
    });

    await Promise.all(
      [...args.members, currentUser._id].map(async (memberId) => {
        await ctx.db.insert("conversationMembers", {
          conversationId,
          memberId,
        });
      })
    );
  },
});

export const deleteGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
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
      throw new ConvexError("User not Found");
    }

    try {
      // First, check if conversation exists
      const conversation = await ctx.db.get(args.conversationId);
      if (!conversation) {
        console.log("Conversation already deleted");
        return { success: true, message: "Conversation already deleted" };
      }

      // Verify it's actually a group conversation
      if (!conversation.isGroup) {
        throw new ConvexError("This is not a group conversation");
      }

      // Check if user is a member (and has permission to delete)
      const userMembership = await ctx.db
        .query("conversationMembers")
        .withIndex("by_memberId_conversationId", (q) =>
          q
            .eq("memberId", currentUser._id)
            .eq("conversationId", args.conversationId)
        )
        .unique();

      if (!userMembership) {
        throw new ConvexError("You are not a member of this group");
      }

      // Get all memberships
      const memberships = await ctx.db
        .query("conversationMembers")
        .withIndex("by_conversationId", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .collect();

      // Get all messages
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .collect();

      // Delete everything - order matters!
      const deletionPromises = [];

      // Delete messages
      messages.forEach((message) => {
        deletionPromises.push(ctx.db.delete(message._id));
      });

      // Delete memberships
      memberships.forEach((membership) => {
        deletionPromises.push(ctx.db.delete(membership._id));
      });

      // Delete conversation
      deletionPromises.push(ctx.db.delete(args.conversationId));

      // Wait for all deletions to complete
      await Promise.all(deletionPromises);

      console.log("Group deleted successfully:", args.conversationId);
      return {
        success: true,
        message: "Group deleted successfully",
        deletedMessages: messages.length,
        deletedMemberships: memberships.length,
      };
    } catch (error) {
      console.error("Error in deleteGroup:", error);

      if (error instanceof ConvexError) {
        throw error; // Re-throw our custom errors
      }

      throw new ConvexError("Failed to delete group due to technical error");
    }
  },
});

export const leaveGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
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
      throw new ConvexError("User not Found");
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      console.log("Conversation not found during leave attempt");
      return; // Conversation already deleted
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q
          .eq("memberId", currentUser._id)
          .eq("conversationId", args.conversationId)
      )
      .unique();

    if (!membership) {
      // User is already not a member
      console.log("User already not a member of this group");
      return;
    }

    // Get current member count before leaving
    const allMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Delete user's membership
    await ctx.db.delete(membership._id);

    // If this was the last member, delete the entire group
    if (allMemberships.length === 1) {
      console.log("Last member left, deleting group:", args.conversationId);
      await ctx.db.delete(args.conversationId);

      // Also clean up any remaining messages
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .collect();

      await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));
    }

    console.log("User left group successfully");
  },
});

export const markRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages")
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
      throw new ConvexError("User not Found");
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this Group");
    }
    
    const lastMessage = await ctx.db.get(args.messageId);

    await ctx.db.patch(membership._id, {
      lastSeenMessage: lastMessage ? lastMessage._id : undefined,
    });

  },
});