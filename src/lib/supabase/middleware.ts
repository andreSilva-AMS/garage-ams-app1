import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes accessibles sans être connecté.
const PUBLIC_PATHS = ["/login", "/signup", "/join"];

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
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
