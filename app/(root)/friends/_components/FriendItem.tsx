"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

type Props = {
  id: Id<"users">;
  username: string;
  imageUrl: string;
};

const FriendItem = ({ id, username, imageUrl }: Props) => {
  const router = useRouter();
  const { mutate: startConversation, pending } = useMutationState(
    api.conversations.startDM
  );

  const handleStartConversation = async () => {
    try {
      console.log("Starting conversation with friend:", id);
      const conversationId = await startConversation({ friendId: id });
      console.log("Conversation created with ID:", conversationId);

      if (conversationId) {
        toast.success("Conversation started!");
        router.push(`/conversations/${conversationId}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to start conversation");
      }
    }
  };

  return (
    <Card className="p-3 w-full flex items-center justify-between hover:bg-secondary/50 transition-colors flex-row">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{username}</p>
        </div>
      </div>

      <Button
        onClick={handleStartConversation}
        disabled={pending}
        size="sm"
        variant="ghost"
        className="flex-shrink-0 ml-2"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    </Card>
  );
};

export default FriendItem;
