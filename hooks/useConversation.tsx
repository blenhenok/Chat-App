"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

export const useConversation = () => {
  const params = useParams();

  const conversationId = useMemo(() => {
    if (!params?.conversationId) return "";

    
    return params.conversationId as string;
  }, [params?.conversationId]);

  const isActive = useMemo(() => !!conversationId, [conversationId]);

  return { conversationId, isActive };
};
