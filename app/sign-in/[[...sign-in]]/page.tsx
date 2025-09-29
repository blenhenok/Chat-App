import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        routing="path"
        path="/sign-in"
        redirectUrl="/conversations"
        appearance={{
          elements: {
            footer: {
              display: "none", 
            },
          },
        }}
      />
    </div>
  );
}
