// app/conversations/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ConversationFallback from "@/components/shared/conversations/ConversationFallback";

const ConversationsPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect to home page if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Show redirect message if not signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Redirecting to home page...</div>
      </div>
    );
  }

  // Show conversations only when authenticated
  return <ConversationFallback />;
};

export default ConversationsPage;
