"use client";

import ItemList from "@/components/shared/item-list/ItemList";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import React from "react";
import DMConversationItem from "./_components/DMConversationItem";
import CreateGroupDialog from "./_components/CreateGroupDialog";
import GroupConversationItem from "./_components/GroupConversationItem";

type Props = React.PropsWithChildren<object>;

const ConversationsLayout = ({ children }: Props) => {
  const conversations = useQuery(api.conversations.get);

  // Add debugging
  console.log("=== CONVERSATIONS DEBUG ===");
  console.log("Conversations data:", conversations);
  console.log("Number of conversations:", conversations?.length);
  if (conversations) {
    conversations.forEach((conv, index) => {
      console.log(`Conversation ${index}:`, {
        id: conv.conversation._id,
        isGroup: conv.conversation.isGroup,
        name: conv.conversation.name,
        otherMember: conv.otherMember,
        lastMessage: conv.lastMessage,
      });
    });
  }

  return (
    <>
      <ItemList title="Conversations" action={<CreateGroupDialog />}>
        {conversations ? (
          conversations.length === 0 ? (
            <p className="h-full w-full flex items-center justify-center text-muted-foreground">
              No conversations yet. Start a conversation with a friend!
            </p>
          ) : (
            conversations.map((conversationData) => {
              console.log(
                "Rendering conversation:",
                conversationData.conversation._id
              );
              return conversationData.conversation.isGroup ? (
                <GroupConversationItem
                  key={conversationData.conversation._id}
                  id={conversationData.conversation._id}
                  name={conversationData.conversation.name || ""}
                  lastMessageSender={conversationData.lastMessage?.sender}
                  lastMessageContent={conversationData.lastMessage?.content}
                  unseenCount={conversationData.unseenCount}
                />
              ) : (
                <DMConversationItem
                  key={conversationData.conversation._id}
                  id={conversationData.conversation._id}
                  username={
                    conversationData.otherMember?.username || "Unknown User"
                  }
                  imageUrl={conversationData.otherMember?.imageUrl || ""}
                  lastMessageSender={conversationData.lastMessage?.sender}
                  lastMessageContent={conversationData.lastMessage?.content}
                  unseenCount={conversationData.unseenCount}
                />
              );
            })
          )
        ) : (
          <div className="flex justify-center w-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </ItemList>
      {children}
    </>
  );
};

export default ConversationsLayout;
