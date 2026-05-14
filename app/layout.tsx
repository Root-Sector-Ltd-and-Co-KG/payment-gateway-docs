import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.payment-gateway.app"),
  title: {
    default: "payment-gateway.app Docs",
    template: "%s | payment-gateway.app Docs",
  },
  description:
    "Documentation for deploying, operating, and integrating payment-gateway.app.",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
