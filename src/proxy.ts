import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // "/api" est exclu : les routes API (ex. le webhook Stripe, appelé sans
    // session utilisateur) gèrent leur propre autorisation individuellement,
    // plutôt que d'être redirigées vers la page de connexion comme une page.
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
