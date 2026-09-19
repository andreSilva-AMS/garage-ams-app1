import { createBrowserClient } from "@supabase/ssr";

/**
 * Par défaut, la session est conservée ~400 jours (comportement standard de
 * @supabase/ssr), même après fermeture du navigateur. Passer
 * `{ remember: false }` (case "Rester connecté" décochée à la connexion) crée
 * un client à part (`isSingleton: false`, pour ne pas réutiliser une instance
 * mise en cache avec d'autres réglages) dont les cookies expirent à la
 * fermeture du navigateur au lieu d'être persistés.
 */
export function createClient(options?: { remember?: boolean }) {
  if (options?.remember === false) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookieOptions: { maxAge: undefined }, isSingleton: false },
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
