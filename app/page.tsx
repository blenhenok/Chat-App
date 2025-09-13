import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <SignedOut>
        <h1 className="text-2xl font-bold mb-4">Welcome to the App</h1>
        <p className="mb-4">You are currently signed out</p>
        <SignInButton mode="modal">
          <Button className="bg-blue-500 hover:bg-blue-600">
            Sign In for Testing
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <h1 className="text-2xl font-bold mb-4">Welcome! You Signed In</h1>
        <Button>hello</Button>
        <div className="mt-4">
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
