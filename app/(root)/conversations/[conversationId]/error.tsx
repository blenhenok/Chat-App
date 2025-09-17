"use client";

import ConversationFallback from "@/components/shared/conversations/ConversationFallback";
import { useRouter } from "next/dist/client/components/navigation";
import { useEffect } from "react";

export default function Error({ error }: { error: Error }) {
    const router = useRouter();
    useEffect(() => {
        router.push("/conversations")
    }, [error, router])
  return <ConversationFallback />;
}