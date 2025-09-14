import "./globals.css";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import ConvexClientProvider from "@/providers/ConvexClientProvider";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
