"use client";

import { useState } from "react";
import Link from "next/link";

const CONTENT = {
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : à compléter lors de la mise en ligne",
    draftNotice:
      "Brouillon générique en attente de relecture juridique avant mise en ligne réelle. Les mentions entre crochets [ ] doivent être complétées avec les informations exactes de la société exploitant ReceptCar.",
    sections: [
      {
        h: "1. Objet",
        p: "ReceptCar (« le Service ») est une application en ligne permettant aux garages automobiles de créer des fiches de réception de véhicule (informations client, photos, dommages constatés, signature) et de générer un document PDF associé. Le Service est édité par [raison sociale complète, forme juridique, siège social, numéro d'immatriculation], ci-après « l'Éditeur ».",
      },
      {
        h: "2. Acceptation",
        p: "L'utilisation du Service implique l'acceptation pleine et entière des présentes conditions par la personne qui crée le compte (« le Client ») et par les utilisateurs qu'elle invite au sein de son garage.",
      },
      {
        h: "3. Compte et accès",
        p: "Le Client est responsable de la confidentialité de ses identifiants et de l'usage fait du Service par les comptes qu'il crée ou invite (propriétaire, mécanicien, réception). Chaque garage constitue un espace isolé : les données d'un garage ne sont accessibles à aucun autre garage.",
      },
      {
        h: "4. Essai gratuit et abonnement",
        p: "Un essai gratuit de 30 jours est proposé à la création du compte, sans engagement. À l'issue de l'essai, l'accès aux fonctionnalités de réception est suspendu tant qu'un abonnement payant n'est pas souscrit. L'abonnement est mensuel (ou annuel si souscrit comme tel), sans engagement de durée, résiliable à tout moment ; la résiliation prend effet à la fin de la période déjà payée. Le tarif applicable dépend du pays de facturation déclaré par le garage.",
      },
      {
        h: "5. Données et contenus",
        p: "Le Client reste seul propriétaire des données qu'il saisit dans le Service (informations client, photos, documents). L'Éditeur agit comme sous-traitant au sens du RGPD / de la nLPD pour le traitement de ces données pour le compte du Client — voir la politique de confidentialité pour le détail.",
      },
      {
        h: "6. Conservation et suppression",
        p: "Les fiches de réception (et fichiers associés) sont conservées pendant la durée choisie par le garage (30 jours par défaut, 12 mois en option), puis supprimées automatiquement et définitivement, y compris les photos et le document PDF.",
      },
      {
        h: "7. Disponibilité et responsabilité",
        p: "L'Éditeur met en œuvre des moyens raisonnables pour assurer la disponibilité et la sécurité du Service, sans garantie de disponibilité continue. Dans les limites permises par la loi, la responsabilité de l'Éditeur est limitée aux dommages directs et plafonnée au montant payé par le Client au cours des douze derniers mois.",
      },
      {
        h: "8. Résiliation",
        p: "Le Client peut résilier son abonnement à tout moment depuis l'application. L'Éditeur peut suspendre ou résilier l'accès en cas de non-paiement ou d'usage contraire aux présentes conditions, après notification.",
      },
      {
        h: "9. Droit applicable",
        p: "Les présentes conditions sont régies par le droit suisse. [À confirmer : for juridictionnel compétent.]",
      },
      {
        h: "10. Contact",
        p: "Pour toute question relative aux présentes conditions : [adresse e-mail de contact].",
      },
    ],
  },
  en: {
    title: "Terms of Use",
    updated: "Last updated: to be completed before going live",
    draftNotice:
      "Generic draft pending legal review before real-world use. Text in brackets [ ] must be completed with the exact details of the company operating ReceptCar.",
    sections: [
      {
        h: "1. Purpose",
        p: "ReceptCar (\"the Service\") is an online application allowing car garages to create vehicle reception forms (customer information, photos, noted damage, signature) and generate an associated PDF document. The Service is published by [full legal name, legal form, registered office, registration number], hereinafter \"the Publisher\".",
      },
      {
        h: "2. Acceptance",
        p: "Using the Service implies full acceptance of these terms by the person creating the account (\"the Customer\") and by the users they invite within their garage.",
      },
      {
        h: "3. Account and access",
        p: "The Customer is responsible for the confidentiality of their credentials and for the use of the Service by the accounts they create or invite (owner, mechanic, reception). Each garage is an isolated space: one garage's data is never accessible to another garage.",
      },
      {
        h: "4. Free trial and subscription",
        p: "A 30-day free trial is offered when the account is created, with no commitment. After the trial, access to reception features is suspended until a paid subscription is taken out. The subscription is monthly (or annual if subscribed as such), with no minimum term, cancellable at any time; cancellation takes effect at the end of the already-paid period. The applicable price depends on the billing country declared by the garage.",
      },
      {
        h: "5. Data and content",
        p: "The Customer remains the sole owner of the data they enter into the Service (customer information, photos, documents). The Publisher acts as a data processor under the GDPR / Swiss nFADP for the processing of this data on the Customer's behalf — see the privacy policy for details.",
      },
      {
        h: "6. Retention and deletion",
        p: "Reception forms (and associated files) are kept for the period chosen by the garage (30 days by default, 12 months optional), then automatically and permanently deleted, including photos and the PDF document.",
      },
      {
        h: "7. Availability and liability",
        p: "The Publisher uses reasonable efforts to ensure the Service's availability and security, without guaranteeing continuous availability. To the extent permitted by law, the Publisher's liability is limited to direct damages and capped at the amount paid by the Customer over the past twelve months.",
      },
      {
        h: "8. Termination",
        p: "The Customer may cancel their subscription at any time from the application. The Publisher may suspend or terminate access in case of non-payment or use contrary to these terms, after notice.",
      },
      {
        h: "9. Governing law",
        p: "These terms are governed by Swiss law. [To confirm: competent jurisdiction.]",
      },
      {
        h: "10. Contact",
        p: "For any question regarding these terms: [contact e-mail address].",
      },
    ],
  },
};

export default function TermsPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const c = CONTENT[lang];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm underline">
          ReceptCar
        </Link>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setLang("fr")}
            className={lang === "fr" ? "font-semibold underline" : "text-neutral-500"}
          >
            FR
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={lang === "en" ? "font-semibold underline" : "text-neutral-500"}
          >
            EN
          </button>
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-semibold">{c.title}</h1>
      <p className="mb-6 text-xs text-neutral-400">{c.updated}</p>

      <p className="mb-8 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{c.draftNotice}</p>

      <div className="flex flex-col gap-6">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-1 text-base font-semibold">{s.h}</h2>
            <p className="text-sm text-neutral-700">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
