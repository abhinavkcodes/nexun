import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexun",
  description: "AI Resume Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
  <main>
    {children}
  </main>
</body>
    </html>
  );
}