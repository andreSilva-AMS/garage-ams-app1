"use client";

import { useState } from "react";
import Link from "next/link";

const CONTENT = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : à compléter lors de la mise en ligne",
    draftNotice:
      "Brouillon générique en attente de relecture juridique avant mise en ligne réelle. Les mentions entre crochets [ ] doivent être complétées avec les informations exactes de la société exploitant ReceptCar.",
    sections: [
      {
        h: "1. Qui traite vos données",
        p: "ReceptCar est édité par [raison sociale complète, adresse, contact]. Pour les données saisies par les garages clients (informations de leurs propres clients), l'Éditeur agit comme sous-traitant au sens du RGPD (Règlement UE 2016/679) et de la nLPD suisse ; le garage reste responsable de traitement vis-à-vis de ses propres clients.",
      },
      {
        h: "2. Données collectées",
        p: "Compte garage : nom, adresse, téléphone, e-mail, langue, logo. Comptes utilisateurs : nom, e-mail, rôle. Fiches de réception : nom, téléphone, e-mail du client final, plaque d'immatriculation, kilométrage, photos du véhicule, photo du document d'immatriculation (carte grise), signature manuscrite, dommages et travaux constatés — ces informations, notamment la photo du document d'immatriculation, constituent des données personnelles au sens du RGPD/de la nLPD.",
      },
      {
        h: "3. Finalités",
        p: "Ces données sont traitées pour : fournir le service de réception véhicule (constat contradictoire de l'état du véhicule), générer et transmettre le document PDF au client final, gérer les comptes et abonnements, assurer la sécurité du service.",
      },
      {
        h: "4. Base légale",
        p: "Exécution du contrat conclu entre le garage et son client final (constat de réception), intérêt légitime du garage (protection en cas de litige), et pour l'Éditeur, exécution du contrat conclu avec le garage.",
      },
      {
        h: "5. Conservation",
        p: "Les fiches de réception (et fichiers associés, y compris photos et PDF) sont conservées pendant la durée choisie par chaque garage (30 jours par défaut, 12 mois en option), puis supprimées automatiquement et définitivement. Les données de compte sont conservées tant que le compte est actif.",
      },
      {
        h: "6. Hébergement et sous-traitants",
        p: "Les données sont hébergées et traitées par Supabase (base de données et stockage de fichiers) et Vercel (hébergement de l'application), ainsi que par les prestataires d'envoi d'e-mail et de paiement utilisés par le Service (Resend, Stripe). [Compléter avec la liste exacte et les localisations des serveurs le cas échéant.]",
      },
      {
        h: "7. Droits des personnes",
        p: "Toute personne concernée (client final d'un garage ou utilisateur du Service) peut exercer ses droits d'accès, de rectification, d'effacement et d'opposition auprès du garage concerné (responsable de traitement pour ses propres clients) ou auprès de l'Éditeur pour les données de compte, à l'adresse [e-mail de contact].",
      },
      {
        h: "8. Sécurité",
        p: "Le Service applique des mesures techniques de sécurité : isolement strict des données entre garages (contrôle d'accès appliqué au niveau de la base de données), stockage des fichiers dans un espace privé avec accès temporaire limité dans le temps, chiffrement des communications (HTTPS).",
      },
      {
        h: "9. Contact",
        p: "Pour toute question relative à cette politique ou pour exercer vos droits : [adresse e-mail de contact].",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: to be completed before going live",
    draftNotice:
      "Generic draft pending legal review before real-world use. Text in brackets [ ] must be completed with the exact details of the company operating ReceptCar.",
    sections: [
      {
        h: "1. Who processes your data",
        p: "ReceptCar is published by [full legal name, address, contact]. For data entered by client garages (information about their own customers), the Publisher acts as a data processor under the GDPR (EU Regulation 2016/679) and the Swiss nFADP; the garage remains the data controller towards its own customers.",
      },
      {
        h: "2. Data collected",
        p: "Garage account: name, address, phone, e-mail, language, logo. User accounts: name, e-mail, role. Reception forms: end customer's name, phone, e-mail, license plate, mileage, vehicle photos, photo of the registration document, handwritten signature, noted damage and requested work — this information, in particular the photo of the registration document, constitutes personal data under the GDPR/nFADP.",
      },
      {
        h: "3. Purposes",
        p: "This data is processed to: provide the vehicle reception service (joint assessment of the vehicle's condition), generate and send the PDF document to the end customer, manage accounts and subscriptions, and ensure the security of the service.",
      },
      {
        h: "4. Legal basis",
        p: "Performance of the contract between the garage and its end customer (reception record), legitimate interest of the garage (protection in case of dispute), and for the Publisher, performance of the contract with the garage.",
      },
      {
        h: "5. Retention",
        p: "Reception forms (and associated files, including photos and PDF) are kept for the period chosen by each garage (30 days by default, 12 months optional), then automatically and permanently deleted. Account data is kept for as long as the account is active.",
      },
      {
        h: "6. Hosting and subprocessors",
        p: "Data is hosted and processed by Supabase (database and file storage) and Vercel (application hosting), as well as the e-mail and payment providers used by the Service (Resend, Stripe). [Complete with the exact list and server locations if applicable.]",
      },
      {
        h: "7. Data subject rights",
        p: "Any data subject (a garage's end customer or a Service user) may exercise their rights of access, rectification, erasure and objection with the relevant garage (data controller for its own customers) or with the Publisher for account data, at [contact e-mail address].",
      },
      {
        h: "8. Security",
        p: "The Service applies technical security measures: strict data isolation between garages (access control enforced at the database level), file storage in a private space with time-limited access, encrypted communications (HTTPS).",
      },
      {
        h: "9. Contact",
        p: "For any question about this policy or to exercise your rights: [contact e-mail address].",
      },
    ],
  },
};

export default function PrivacyPage() {
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
