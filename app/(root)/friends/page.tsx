"use client";

import ConversationFallback from "@/components/shared/conversations/ConversationFallback";
import ItemList from "@/components/shared/item-list/ItemList";
import React from "react";
import AddFriendDialog from "./_components/AddFriendDialog";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Request from "./_components/Request";
import FriendItem from "./_components/FriendItem";

const FriendsPage = () => {
  const friends = useQuery(api.friends.get);
  const requests = useQuery(api.requests.get);

  return (
    <>
      <ItemList title="Friends" action={<AddFriendDialog />}>
        {friends ? (
          friends.length === 0 ? (
            <p className="w-full h-full flex items-center justify-center text-muted-foreground">
              No friends yet. Add some friends to start chatting!
            </p>
          ) : (
            friends.map((friend) => (
              <FriendItem
                key={friend._id}
                id={friend._id}
                username={friend.username}
                imageUrl={friend.imageUrl}
              />
            ))
          )
        ) : (
          <Loader2 className="h-8 w-8 animate-spin" />
        )}
      </ItemList>

      {/* Friend Requests Sidebar */}
      <div className="hidden lg:block w-80 border-l">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Friend Requests</h2>
          <p className="text-sm text-muted-foreground">
            Manage your incoming requests
          </p>
        </div>
        <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {requests ? (
            requests.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No pending requests
              </p>
            ) : (
              requests.map(({ request, sender }) => (
                <Request
                  key={request._id}
                  id={request._id}
                  imageUrl={sender.imageUrl}
                  username={sender.username}
                  email={sender.email}
                />
              ))
            )
          ) : (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
