import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client "service role" : contourne complètement Row Level Security.
 *
 * À utiliser UNIQUEMENT dans du code strictement serveur, jamais accessible
 * depuis le navigateur (ex. le webhook Stripe, qui n'a pas de session
 * utilisateur mais doit pouvoir mettre à jour n'importe quel garage).
 * Ne jamais importer ce fichier depuis un composant client.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
