const SITE_URL = String(
  process.env.NEXT_PUBLIC_SITE_URL || "https://hcs-th.vercel.app",
).replace(/\/+$/, "");

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",

        allow: ["/", "/en/", "/th/"],

        disallow: ["/admin", "/admin/", "/api", "/api/", "/_next/"],
      },
    ],

    sitemap: `${SITE_URL}/sitemap.xml`,

    host: SITE_URL,
  };
}
