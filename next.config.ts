import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          
{
    key: "Strict-Transport-Security",
  value: "max-age=31536000; includeSubDomains; preload"
},
          {
            key: "Content-Security-Policy",
            value: [
              // Only your own origin by default
              "default-src 'self'",
              // Your own JS + inline scripts Next.js needs + Supabase auth scripts
              "script-src 'self' 'unsafe-inline' ",
              // Your own styles + Google Fonts styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Google Fonts files
              "font-src 'self' https://fonts.gstatic.com",
              // Images from your own site + Supabase storage (avatars etc)
              "img-src 'self' data: blob: https://*.supabase.co https://www.google.com https://www.gstatic.com",

              // API calls: Supabase + Neon
"connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://*.neon.tech https://api.web3forms.com",
              // No iframes allowed
              "frame-src 'none'",
              
              // No plugins (Flash etc)
              "object-src 'none'",
              // Prevents base tag hijacking
              "base-uri 'self'",
              // All forms must submit to your own origin
              "form-action 'self'",
              // Upgrade any accidental HTTP to HTTPS
              "frame-ancestors 'none'",
              "manifest-src 'self'",
              
              
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;