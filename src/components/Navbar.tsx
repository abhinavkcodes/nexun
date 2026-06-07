import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-6 p-4 border-b">
      <Link href="/">Home</Link>
      <Link href="/upload">Upload</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/analysis">Analysis</Link>
    </nav>
  );
}