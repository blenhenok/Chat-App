import "./globals.css";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import ConvexClientProvider from "@/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster richColors/>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
