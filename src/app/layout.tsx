import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Nexun — AI Resume Analyzer",
  description:
    "Analyze your resume with AI-powered ATS scoring and recruiter insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
        <body>
          <Navbar />
          {children}
        </body>
      </html>
  );
}