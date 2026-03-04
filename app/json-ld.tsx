export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "GBC Marketplace",
          url: "https://gbc-marketplace.xyz",
          description:
            "Buy and sell with fellow George Brown College students",
        }),
      }}
    />
  );
}
