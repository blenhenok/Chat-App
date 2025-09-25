// app/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ChatApp</h1>

        {isSignedIn ? (
          <div>
            <p className="text-lg mb-4">Hello, {user.firstName}!</p>
            <Button asChild>
              <Link href="/conversations">Go to Conversations</Link>
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-lg mb-4">Please sign in to continue</p>
            <Button asChild variant="outline">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
