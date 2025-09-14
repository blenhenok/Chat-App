import ConversationFallback from "@/components/shared/conversations/ConversationFallback";
import ItemList from "@/components/shared/item-list/ItemList";
import React from "react";

const FriendsPage = () => {
  return (
    <>
      <ItemList title="Friends">Friend List would go here</ItemList>
      <ConversationFallback />
    </>
  );
};

export default FriendsPage;
