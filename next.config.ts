import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Empêche d'afficher le site dans une <iframe> sur un autre domaine
          // (protection contre le "clickjacking").
          { key: "X-Frame-Options", value: "DENY" },
          // Empêche le navigateur de deviner le type d'un fichier autrement
          // qu'à partir de son Content-Type déclaré.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // N'envoie l'URL complète comme referrer qu'aux requêtes internes au
          // site ; seulement l'origine (pas le chemin) vers un autre domaine.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Désactive des API navigateur non utilisées par l'application.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
