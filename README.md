# Garage AMS — Fondations multi-garage (Phase 1)

Application web multi-garage. Cette Phase 1 met en place uniquement les
fondations : création de compte, connexion, et séparation stricte des
données entre garages. Les modules Réception et Véhicules de prêt arrivent
en Phase 2 et 3.

## Pile technique

- **Next.js** (React) — l'application web
- **Supabase** — base de données PostgreSQL + authentification + stockage de fichiers
- **Vercel** — hébergement

## 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) et créer un compte gratuit.
2. Cliquer sur **New project**.
3. Choisir une région **Europe** (ex. `eu-central-1 — Frankfurt`) — c'est la
   décision « où sont hébergées les données » que nous avons validée ensemble.
4. Noter le mot de passe de base de données généré (à garder en lieu sûr, on
   ne s'en sert pas au quotidien mais il peut servir en cas de dépannage).
5. Une fois le projet créé, aller dans **Project Settings > API**. Vous y
   trouverez deux valeurs à copier :
   - `Project URL`
   - `anon public` key

## 2. Configurer les variables d'environnement

Dans ce projet, dupliquez `.env.local.example` en `.env.local` :

```bash
cp .env.local.example .env.local
```

Puis collez-y les deux valeurs récupérées à l'étape précédente :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

`.env.local` n'est jamais envoyé sur GitHub (il est dans `.gitignore`) : ces
clés restent privées à votre machine/déploiement.

## 3. Créer les tables et les règles de sécurité

1. Dans le tableau de bord Supabase, ouvrir **SQL Editor > New query**.
2. Ouvrir le fichier `supabase/migrations/0001_fondations_multi_garage.sql`
   de ce projet, copier tout son contenu, le coller dans l'éditeur SQL.
3. Cliquer sur **Run**.

Cela crée :

- la table `garages` (un enregistrement par client de la plateforme),
- la table `profiles` (les utilisateurs, chacun rattaché à un `garage_id`),
- les règles de sécurité (**Row Level Security**) qui garantissent qu'un
  garage ne peut jamais lire les données d'un autre garage — appliqué au
  niveau de la base de données elle-même, pas seulement dans le code de
  l'application.

## 4. (Recommandé pour tester facilement) Désactiver la confirmation par e-mail

Par défaut, Supabase envoie un e-mail de confirmation à chaque inscription.
Pour tester rapidement en local sans avoir à cliquer sur des e-mails à
chaque fois :

1. **Authentication > Sign In / Providers > Email**
2. Désactiver **Confirm email**

Vous pourrez le réactiver avant l'ouverture au public (Phase 6 — conformité
& lancement).

## 5. Lancer l'application en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) : vous serez redirigé
vers la page de connexion.

- **Créer un compte** → crée à la fois votre garage et votre compte
  propriétaire (« owner »).
- Une fois connecté, le tableau de bord affiche le nom de votre garage et
  votre équipe. Créez un deuxième compte avec un e-mail différent et un
  nom de garage différent : vous constaterez qu'aucun des deux comptes ne
  voit les données de l'autre. C'est la preuve que l'isolation multi-garage
  fonctionne.

## 6. Déployer sur Vercel

1. Créer un dépôt GitHub pour ce projet et y pousser le code.
2. Aller sur [vercel.com](https://vercel.com), créer un compte, cliquer sur
   **Add New Project**, sélectionner ce dépôt GitHub.
3. Dans les réglages du projet Vercel, ajouter les deux variables
   d'environnement (les mêmes que dans `.env.local`) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Cliquer sur **Deploy**.

Vous obtenez une URL publique (ex. `votreprojet.vercel.app`). Un nom de
domaine personnalisé (ex. `www.garage-ams.ch`) pourra être branché plus
tard, sans rien changer au code.

## Ce que fait cette Phase 1 (et ce qu'elle ne fait pas encore)

Fait :

- Création de compte = création automatique d'un garage
- Connexion / déconnexion
- Isolation stricte des données par garage (au niveau base de données, via
  Row Level Security)
- Rôles de base (`owner`, `mechanic`, `reception`) déjà présents dans le
  modèle de données, prêts pour la Phase 4 (personnalisation)

Pas encore fait (volontairement, ce sera dans les phases suivantes) :

- Inviter des collègues dans son garage (aujourd'hui, un signup = un
  nouveau garage)
- Modules Réception et Véhicules de prêt (Phases 2 et 3)
- Facturation Stripe (Phase 5)

## Structure du projet

```
src/
  app/
    login/          Page de connexion
    signup/         Page d'inscription (crée le garage + le compte propriétaire)
    dashboard/       Page protégée : garage courant + équipe
  lib/supabase/
    client.ts        Connexion à Supabase depuis le navigateur
    server.ts         Connexion à Supabase depuis le serveur (pages, actions)
    middleware.ts      Rafraîchit la session à chaque requête
    profile.ts          Filet de sécurité pour finaliser une inscription
  proxy.ts             Protège les pages : redirige vers /login si non connecté
supabase/migrations/
  0001_fondations_multi_garage.sql   Schéma de base de données + sécurité
```
