// app/(root)/conversations/[conversationId]/page.tsx
"use client";

import ConversationContainer from "@/components/shared/conversations/ConversationContainer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Header from "./_components/Header";
import Body from "./_components/body/Body";
import ChatInput from "./_components/input/ChatInput";
import RemoveFriendDialog from "./_components/dialogs/RemoveFriendDialog";
import DeleteGroupDialog from "./_components/dialogs/DeleteGroupDialog";
import LeaveGroupDialog from "./_components/dialogs/LeaveGroupDialog";
import { useState, useEffect } from "react"; // ← ADD useEffect
import React from "react";
import { useRouter } from "next/navigation"; // ← ADD useRouter

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default function ConversationPage({ params }: Props) {
  const router = useRouter(); // ← ADD router
  const { conversationId } = React.use(params);
  const convexId = conversationId as Id<"conversations">;

  const conversation = useQuery(api.conversation.get, { id: convexId });

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);

  // ← ADD THIS useEffect TO HANDLE REDIRECT
  useEffect(() => {
    if (conversation === null) {
      console.log("Conversation not found, redirecting to conversations list");
      // Use setTimeout to avoid navigation during render
      const timer = setTimeout(() => {
        router.push("/conversations");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [conversation, router]);

  if (conversation === undefined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (conversation === null) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            Redirecting to conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ConversationContainer>
      {/* FIX: Use conversation._id instead of conversationId to ensure we're using the valid ID */}
      <DeleteGroupDialog
        conversationId={conversation._id}
        open={deleteGroupDialogOpen}
        setOpen={setDeleteGroupDialogOpen}
      />
      <LeaveGroupDialog
        conversationId={conversation._id}
        open={leaveGroupDialogOpen}
        setOpen={setLeaveGroupDialogOpen}
      />
      <RemoveFriendDialog
        conversationId={conversation._id}
        open={removeFriendDialogOpen}
        setOpen={setRemoveFriendDialogOpen}
      />

      <Header
        imageUrl={
          conversation.isGroup ? undefined : conversation.otherMember?.imageUrl
        }
        name={
          (conversation.isGroup
            ? conversation.name
            : conversation.otherMember?.username) || ""
        }
        options={
          conversation.isGroup
            ? [
                {
                  label: "Leave Group",
                  destructive: false,
                  onClick: () => setLeaveGroupDialogOpen(true),
                },
                {
                  label: "Delete Group",
                  destructive: true,
                  onClick: () => setDeleteGroupDialogOpen(true),
                },
              ]
            : [
                {
                  label: "Remove Friend",
                  destructive: false,
                  onClick: () => setRemoveFriendDialogOpen(true),
                },
              ]
        }
      />
      <Body
        members={
          conversation.isGroup
            ? conversation.otherMembers
              ? conversation.otherMembers
              : []
            : conversation.otherMember
              ? [conversation.otherMember]
              : []
        }
      />
      <ChatInput />
    </ConversationContainer>
  );
}
