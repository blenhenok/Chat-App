import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "lucide-react"; // Remove Link from here
import Link from "next/link"; // Add separate import for Next.js Link
import React from "react";

type Props = {
  id: Id<"conversations">;
  imageUrl: string;
  username: string;
  lastMessageSender?: string;
  lastMessageContent?: string;
  unseenCount: number;
};

const DMConversationItem = ({
  id,
  imageUrl,
  username,
  lastMessageSender,
  lastMessageContent,
  unseenCount,
}: Props) => {
  return (
    <Link href={`/conversations/${id}`} className="w-full">
      <Card className="p-2 flex flex-row items-center justify-between hover:bg-secondary/50 transition-colors">
        <div className="flex flex-row items-center gap-4 truncate">
          <Avatar>
            <AvatarImage src={imageUrl} />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col truncate flex-1 min-w-0">
            <h4 className="truncate font-medium">{username}</h4>
            {lastMessageSender && lastMessageContent ? (
              <span className="text-sm text-muted-foreground flex truncate">
                <p className="font-semibold truncate">
                  {lastMessageSender}:&nbsp;
                </p>
                <p className="truncate flex-1">{lastMessageContent}</p>
              </span>
            ) : (
              <p className="text-sm text-muted-foreground truncate">
                Start the Conversation
              </p>
            )}
          </div>
        </div>
        {unseenCount > 0 ? <Badge>{unseenCount}</Badge> : null}
      </Card>
    </Link>
  );
};

export default DMConversationItem;
