import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes accessibles sans être connecté.
const PUBLIC_PATHS = ["/login", "/signup", "/join", "/auth", "/forgot-password"];

// Déconnexion automatique après une période d'inactivité (aucune requête
// authentifiée). Fenêtre plus courte, avec message explicatif, quand
// "Rester connecté" est décochée (cas d'un appareil partagé) ; fenêtre plus
// longue et silencieuse (pas de message alarmant) quand elle est cochée,
// puisque l'utilisateur s'attend à rester connecté "en permanence".
const INACTIVITY_LIMIT_SESSION_ONLY_MS = 24 * 60 * 60 * 1000;
const INACTIVITY_LIMIT_REMEMBERED_MS = 7 * 24 * 60 * 60 * 1000;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Reflète le choix fait à la connexion ("Rester connecté" décochée) : sans
  // ce cookie marqueur (comportement par défaut, y compris pour toute session
  // déjà ouverte avant ce changement), la session reste persistante comme
  // avant. Seule une valeur explicite "0" bascule sur des cookies de session
  // (effacés à la fermeture du navigateur) — y compris lors du rafraîchissement
  // automatique du jeton ici, sinon il écraserait ce choix avec la valeur par
  // défaut de @supabase/ssr (~400 jours).
  const sessionOnly = request.cookies.get("sb_remember")?.value === "0";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: sessionOnly ? { maxAge: undefined } : undefined,
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
    const inactivityLimit = sessionOnly
      ? INACTIVITY_LIMIT_SESSION_ONLY_MS
      : INACTIVITY_LIMIT_REMEMBERED_MS;
    const lastActivity = request.cookies.get("sb_last_activity")?.value;
    const now = Date.now();
    if (lastActivity && now - Number(lastActivity) > inactivityLimit) {
      await supabase.auth.signOut();
      user = null;
      // Pas de message quand "Rester connecté" était cochée : l'utilisateur
      // s'attend à rester connecté "en permanence", une bannière de sécurité
      // après une longue absence serait plus alarmante qu'utile.
      timedOut = sessionOnly;
    } else {
      // Marqueur d'activité : maxAge volontairement plus long que la plus
      // grande fenêtre (7 jours), pour survivre à une fermeture de
      // navigateur entre-temps et mesurer correctement le temps écoulé.
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

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return supabaseResponse;
}
