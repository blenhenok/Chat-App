import ConversationFallback from "@/components/shared/conversations/ConversationFallback";
import ItemList from "@/components/shared/item-list/ItemList";
import React from "react";
import AddFriendDialog from "./_components/AddFriendDialog";

const FriendsPage = () => {
  return (
    <>
      <ItemList title="Friends" action={<AddFriendDialog/>}>Friend List would go here</ItemList>
      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
