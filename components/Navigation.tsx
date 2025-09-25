"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Navigation() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="flex items-center justify-between p-6 border-b">
      <Link href="/" className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">ChatApp</span>
      </Link>

      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/conversations">Conversations</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/friends">Friends</Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm">Hi, {user?.firstName}</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        ) : (
          <Button asChild variant="outline">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
