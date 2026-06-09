export default function Navbar() {
  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #E8E8E4",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 48px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          {/* Swirl icon approximation */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#111",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 3C8 3 5 4.5 5 8C5 11 7.5 12.5 10 12.5C12.5 12.5 14 11 14 9C14 7 12.5 6 11 6C9.5 6 8.5 7 8.5 8.5C8.5 10 9.5 11 11 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>Resumio</span>
        </a>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {[["Features","#"],["Resume","/dashboard"],["Pricing","#"],["FAQs","#"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 14, fontWeight: 500, color: "#555", textDecoration: "none" }}>{label}</a>
          ))}
        </div>

        {/* Right CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/login" style={{ fontSize: 14, fontWeight: 500, color: "#444", textDecoration: "none", padding: "8px 14px" }}>
            Sign In
          </a>
          <a href="/dashboard" style={{
            border: "1.5px solid #C5C5BF",
            background: "#fff",
            color: "#111",
            fontSize: 13.5, fontWeight: 600,
            padding: "8px 18px", borderRadius: 8,
            textDecoration: "none",
          }}>
            Create My Resume
          </a>
        </div>
      </div>
    </nav>
  );
}