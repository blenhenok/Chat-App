"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Navigation() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="flex items-center justify-between p-2 border-b">
      <Link href="/" className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-xl font-bold">ChatApp</span>
      </Link>

      <div className="flex items-center gap-2">
        {isSignedIn ? (
          <div className="flex items-center gap-4">
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
