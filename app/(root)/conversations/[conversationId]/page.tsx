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
import { useState } from "react";
import React from "react";

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default function ConversationPage({ params }: Props) {
  // Use React.use() to unwrap the params promise (Next.js 15 recommended)
  const { conversationId } = React.use(params);

  // Convert string ID to Convex ID format
  const convexId = conversationId as Id<"conversations">;

  const conversation = useQuery(api.conversation.get, { id: convexId });

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);

  if (conversation === undefined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (conversation === null) {
    return (
      <p className="w-full h-full flex items-center justify-center">
        Conversation not Found
      </p>
    );
  }

  return (
    <ConversationContainer>
      <DeleteGroupDialog
        conversationId={conversationId as Id<"conversations">}
        open={deleteGroupDialogOpen}
        setOpen={setDeleteGroupDialogOpen}
      />
      <LeaveGroupDialog
        conversationId={conversationId as Id<"conversations">}
        open={leaveGroupDialogOpen}
        setOpen={setLeaveGroupDialogOpen}
      />
      <RemoveFriendDialog
        conversationId={conversationId as Id<"conversations">}
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
