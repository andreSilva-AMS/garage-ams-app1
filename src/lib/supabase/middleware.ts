import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes accessibles sans être connecté.
const PUBLIC_PATHS = ["/login", "/signup", "/join", "/auth", "/forgot-password", "/terms", "/privacy"];

// Parmi les routes publiques, celles qu'un utilisateur déjà connecté doit
// aussi pouvoir consulter (pas de redirection vers /dashboard) : les CGU et
// la politique de confidentialité concernent tout le monde, pas seulement
// les visiteurs non connectés.
const ALWAYS_ACCESSIBLE_PATHS = ["/terms", "/privacy"];

// Déconnexion automatique après 2h d'inactivité (aucune requête
// authentifiée), sans exception ni réglage utilisateur : un seul
// comportement, simple et prévisible (l'ancien système à deux vitesses
// "Rester connecté" cochée/décochée, avec cookie marqueur séparé, était
// source de bugs de session).
const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user: authenticatedUser },
  } = await supabase.auth.getUser();

  let user = authenticatedUser;
  let timedOut = false;

  if (user) {
    const lastActivity = request.cookies.get("sb_last_activity")?.value;
    const now = Date.now();
    if (lastActivity && now - Number(lastActivity) > INACTIVITY_LIMIT_MS) {
      await supabase.auth.signOut();
      user = null;
      timedOut = true;
      // Sans ça, ce cookie périmé reste en place (son maxAge est volontairement
      // long, 30 jours) et toute connexion future — pourtant valide — est
      // immédiatement tuée par ce même test au tour suivant : la personne se
      // reconnecte avec succès, puis se retrouve réexpulsée en moins d'une
      // seconde, en boucle, jusqu'à ce que le cookie expire tout seul.
      supabaseResponse.cookies.delete("sb_last_activity");
    } else {
      // Marqueur d'activité : maxAge volontairement plus long que la fenêtre
      // d'inactivité (2h), pour survivre à une fermeture de navigateur
      // entre-temps et mesurer correctement le temps écoulé.
      supabaseResponse.cookies.set("sb_last_activity", String(now), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }
  }

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (timedOut) url.searchParams.set("timeout", "1");
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  const isAlwaysAccessible = ALWAYS_ACCESSIBLE_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (user && isPublicPath && !isAlwaysAccessible) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return supabaseResponse;
}
