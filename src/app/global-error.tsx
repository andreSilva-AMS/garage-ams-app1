"use client";

// Ce fichier remplace TOUT le layout (y compris <html>/<body>) : il ne peut
// pas dépendre du provider next-intl, qui vit dans layout.tsx — c'est
// justement ce que global-error.tsx couvre (une erreur dans le layout
// lui-même). D'où un message statique plutôt que traduit.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body>
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-lg font-medium">Un problème est survenu</h1>
          <p className="text-sm text-neutral-600">
            Quelque chose s&apos;est mal passé. Vérifiez votre connexion et réessayez.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
