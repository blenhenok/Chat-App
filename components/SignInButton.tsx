"use client";

import { useUser, useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react"; // Changed from Google to LogIn

export function SignInButton() {
  const { isSignedIn, user } = useUser();
  const { signIn, isLoaded } = useSignIn();

  const signInWith = (strategy: OAuthStrategy) => {
    if (!isLoaded) return;

    return signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">Welcome, {user.firstName}</span>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signInWith("oauth_google")}
      className="flex items-center gap-2"
      variant="outline"
      disabled={!isLoaded}
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </Button>
  );
}
