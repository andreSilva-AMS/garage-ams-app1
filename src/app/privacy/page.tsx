"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Lang } from "@/lib/receptions/i18n";

const CONTENT: Record<
  Lang,
  { title: string; updated: string; draftNotice: string; sections: { h: string; p: string }[] }
> = {
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
  es: {
    title: "Política de privacidad",
    updated: "Última actualización: a completar antes de la puesta en línea",
    draftNotice:
      "Borrador genérico pendiente de revisión jurídica antes de su uso real. El texto entre corchetes [ ] debe completarse con los datos exactos de la sociedad que explota ReceptCar.",
    sections: [
      {
        h: "1. Quién trata sus datos",
        p: "ReceptCar está editado por [razón social completa, dirección, contacto]. Para los datos introducidos por los talleres clientes (información de sus propios clientes), el Editor actúa como encargado del tratamiento en el sentido del RGPD (Reglamento UE 2016/679); el taller sigue siendo responsable del tratamiento frente a sus propios clientes.",
      },
      {
        h: "2. Datos recopilados",
        p: "Cuenta del taller: nombre, dirección, teléfono, correo electrónico, idioma, logotipo. Cuentas de usuario: nombre, correo electrónico, rol. Fichas de recepción: nombre, teléfono, correo electrónico del cliente final, matrícula, kilometraje, fotos del vehículo, foto del documento de matriculación (permiso de circulación), firma manuscrita, daños y trabajos constatados — esta información, en particular la foto del documento de matriculación, constituye datos personales en el sentido del RGPD.",
      },
      {
        h: "3. Finalidades",
        p: "Estos datos se tratan para: prestar el servicio de recepción de vehículos (constatación contradictoria del estado del vehículo), generar y transmitir el documento PDF al cliente final, gestionar las cuentas y suscripciones, y garantizar la seguridad del servicio.",
      },
      {
        h: "4. Base jurídica",
        p: "Ejecución del contrato celebrado entre el taller y su cliente final (constatación de recepción), interés legítimo del taller (protección en caso de litigio), y para el Editor, ejecución del contrato celebrado con el taller.",
      },
      {
        h: "5. Conservación",
        p: "Las fichas de recepción (y los archivos asociados, incluidas fotos y PDF) se conservan durante el período elegido por cada taller (30 días por defecto, 12 meses opcional), y después se eliminan automática y definitivamente. Los datos de la cuenta se conservan mientras la cuenta esté activa.",
      },
      {
        h: "6. Alojamiento y subencargados",
        p: "Los datos se alojan y tratan mediante Supabase (base de datos y almacenamiento de archivos) y Vercel (alojamiento de la aplicación), así como los proveedores de envío de correo electrónico y de pago utilizados por el Servicio (Resend, Stripe). [Completar con la lista exacta y la ubicación de los servidores en su caso.]",
      },
      {
        h: "7. Derechos de las personas",
        p: "Toda persona interesada (cliente final de un taller o usuario del Servicio) puede ejercer sus derechos de acceso, rectificación, supresión y oposición ante el taller correspondiente (responsable del tratamiento para sus propios clientes) o ante el Editor para los datos de la cuenta, en [dirección de correo electrónico de contacto].",
      },
      {
        h: "8. Seguridad",
        p: "El Servicio aplica medidas técnicas de seguridad: aislamiento estricto de los datos entre talleres (control de acceso aplicado a nivel de la base de datos), almacenamiento de archivos en un espacio privado con acceso temporal limitado en el tiempo, cifrado de las comunicaciones (HTTPS).",
      },
      {
        h: "9. Contacto",
        p: "Para cualquier pregunta relativa a esta política o para ejercer sus derechos: [dirección de correo electrónico de contacto].",
      },
    ],
  },
  pt: {
    title: "Política de privacidade",
    updated: "Última atualização: a completar antes da entrada em produção",
    draftNotice:
      "Rascunho genérico pendente de revisão jurídica antes de uma utilização real. O texto entre parênteses retos [ ] deve ser completado com os dados exatos da sociedade que explora o ReceptCar.",
    sections: [
      {
        h: "1. Quem trata os seus dados",
        p: "O ReceptCar é publicado por [razão social completa, endereço, contacto]. Para os dados introduzidos pelas oficinas clientes (informações dos seus próprios clientes), o Editor atua como subcontratante na aceção do RGPD; a oficina continua a ser responsável pelo tratamento perante os seus próprios clientes.",
      },
      {
        h: "2. Dados recolhidos",
        p: "Conta da oficina: nome, morada, telefone, e-mail, idioma, logótipo. Contas de utilizador: nome, e-mail, função. Fichas de receção: nome, telefone, e-mail do cliente final, matrícula, quilometragem, fotos do veículo, foto do documento do veículo, assinatura manuscrita, danos e trabalhos constatados — estas informações, nomeadamente a foto do documento do veículo, constituem dados pessoais na aceção do RGPD.",
      },
      {
        h: "3. Finalidades",
        p: "Estes dados são tratados para: prestar o serviço de receção de veículos (constatação contraditória do estado do veículo), gerar e transmitir o documento PDF ao cliente final, gerir as contas e subscrições, e garantir a segurança do serviço.",
      },
      {
        h: "4. Base jurídica",
        p: "Execução do contrato celebrado entre a oficina e o seu cliente final (constatação de receção), interesse legítimo da oficina (proteção em caso de litígio), e para o Editor, execução do contrato celebrado com a oficina.",
      },
      {
        h: "5. Conservação",
        p: "As fichas de receção (e os ficheiros associados, incluindo fotos e PDF) são conservadas durante o período escolhido por cada oficina (30 dias por defeito, 12 meses opcional), sendo depois eliminadas automática e definitivamente. Os dados da conta são conservados enquanto a conta estiver ativa.",
      },
      {
        h: "6. Alojamento e subcontratantes",
        p: "Os dados são alojados e tratados pela Supabase (base de dados e armazenamento de ficheiros) e pela Vercel (alojamento da aplicação), bem como pelos prestadores de envio de e-mail e de pagamento utilizados pelo Serviço (Resend, Stripe). [Completar com a lista exata e a localização dos servidores, se aplicável.]",
      },
      {
        h: "7. Direitos dos titulares",
        p: "Qualquer titular dos dados (cliente final de uma oficina ou utilizador do Serviço) pode exercer os seus direitos de acesso, retificação, apagamento e oposição junto da oficina em causa (responsável pelo tratamento para os seus próprios clientes) ou junto do Editor para os dados da conta, em [endereço de e-mail de contacto].",
      },
      {
        h: "8. Segurança",
        p: "O Serviço aplica medidas técnicas de segurança: isolamento estrito dos dados entre oficinas (controlo de acesso aplicado ao nível da base de dados), armazenamento de ficheiros num espaço privado com acesso temporário limitado no tempo, encriptação das comunicações (HTTPS).",
      },
      {
        h: "9. Contacto",
        p: "Para qualquer questão relativa a esta política ou para exercer os seus direitos: [endereço de e-mail de contacto].",
      },
    ],
  },
  de: {
    title: "Datenschutzrichtlinie",
    updated: "Letzte Aktualisierung: vor der Veröffentlichung zu ergänzen",
    draftNotice:
      "Generischer Entwurf, der vor der tatsächlichen Nutzung rechtlich geprüft werden muss. Die Angaben in eckigen Klammern [ ] müssen mit den genauen Angaben der Gesellschaft, die ReceptCar betreibt, ergänzt werden.",
    sections: [
      {
        h: "1. Wer Ihre Daten verarbeitet",
        p: "ReceptCar wird herausgegeben von [vollständiger Firmenname, Adresse, Kontakt]. Für Daten, die von den Kunden-Werkstätten eingegeben werden (Informationen über deren eigene Kunden), handelt der Anbieter als Auftragsverarbeiter im Sinne der DSGVO (EU-Verordnung 2016/679) und des revDSG; die Werkstatt bleibt gegenüber ihren eigenen Kunden für die Verarbeitung verantwortlich.",
      },
      {
        h: "2. Erhobene Daten",
        p: "Werkstattkonto: Name, Adresse, Telefon, E-Mail, Sprache, Logo. Benutzerkonten: Name, E-Mail, Rolle. Annahmeprotokolle: Name, Telefon, E-Mail des Endkunden, Kennzeichen, Kilometerstand, Fahrzeugfotos, Foto des Fahrzeugausweises, handschriftliche Unterschrift, festgestellte Schäden und Arbeiten — diese Informationen, insbesondere das Foto des Fahrzeugausweises, stellen personenbezogene Daten im Sinne der DSGVO dar.",
      },
      {
        h: "3. Zwecke",
        p: "Diese Daten werden verarbeitet, um: den Fahrzeug-Annahmedienst zu erbringen (gemeinsame Feststellung des Fahrzeugzustands), das PDF-Dokument zu erstellen und an den Endkunden zu übermitteln, Konten und Abonnements zu verwalten und die Sicherheit des Dienstes zu gewährleisten.",
      },
      {
        h: "4. Rechtsgrundlage",
        p: "Erfüllung des zwischen der Werkstatt und ihrem Endkunden geschlossenen Vertrags (Annahmeprotokoll), berechtigtes Interesse der Werkstatt (Schutz im Streitfall) und für den Anbieter die Erfüllung des mit der Werkstatt geschlossenen Vertrags.",
      },
      {
        h: "5. Aufbewahrung",
        p: "Annahmeprotokolle (und zugehörige Dateien, einschließlich Fotos und PDF) werden für die von jeder Werkstatt gewählte Dauer aufbewahrt (standardmäßig 30 Tage, optional 12 Monate) und anschließend automatisch und endgültig gelöscht. Kontodaten werden aufbewahrt, solange das Konto aktiv ist.",
      },
      {
        h: "6. Hosting und Auftragsverarbeiter",
        p: "Die Daten werden von Supabase (Datenbank und Dateispeicherung) und Vercel (Hosting der Anwendung) sowie von den vom Dienst genutzten E-Mail- und Zahlungsanbietern (Resend, Stripe) gehostet und verarbeitet. [Bei Bedarf mit der genauen Liste und den Serverstandorten ergänzen.]",
      },
      {
        h: "7. Rechte der betroffenen Personen",
        p: "Jede betroffene Person (Endkunde einer Werkstatt oder Nutzer des Dienstes) kann ihre Rechte auf Auskunft, Berichtigung, Löschung und Widerspruch bei der betreffenden Werkstatt (Verantwortliche für ihre eigenen Kunden) oder für Kontodaten beim Anbieter unter [Kontakt-E-Mail-Adresse] geltend machen.",
      },
      {
        h: "8. Sicherheit",
        p: "Der Dienst wendet technische Sicherheitsmaßnahmen an: strikte Datentrennung zwischen Werkstätten (Zugriffskontrolle auf Datenbankebene), Speicherung von Dateien in einem privaten Bereich mit zeitlich begrenztem Zugriff, verschlüsselte Kommunikation (HTTPS).",
      },
      {
        h: "9. Kontakt",
        p: "Für Fragen zu dieser Richtlinie oder zur Ausübung Ihrer Rechte: [Kontakt-E-Mail-Adresse].",
      },
    ],
  },
  it: {
    title: "Informativa sulla privacy",
    updated: "Ultimo aggiornamento: da completare prima della messa online",
    draftNotice:
      "Bozza generica in attesa di revisione legale prima dell'uso reale. Le indicazioni tra parentesi quadre [ ] devono essere completate con i dati esatti della società che gestisce ReceptCar.",
    sections: [
      {
        h: "1. Chi tratta i vostri dati",
        p: "ReceptCar è pubblicato da [ragione sociale completa, indirizzo, contatto]. Per i dati inseriti dalle officine clienti (informazioni dei loro propri clienti), l'Editore agisce come responsabile del trattamento ai sensi del GDPR (Regolamento UE 2016/679); l'officina rimane titolare del trattamento nei confronti dei propri clienti.",
      },
      {
        h: "2. Dati raccolti",
        p: "Account officina: nome, indirizzo, telefono, e-mail, lingua, logo. Account utente: nome, e-mail, ruolo. Schede di accettazione: nome, telefono, e-mail del cliente finale, targa, chilometraggio, foto del veicolo, foto del documento di circolazione, firma autografa, danni e lavori constatati — queste informazioni, in particolare la foto del documento di circolazione, costituiscono dati personali ai sensi del GDPR.",
      },
      {
        h: "3. Finalità",
        p: "Questi dati sono trattati per: fornire il servizio di accettazione veicolo (constatazione condivisa dello stato del veicolo), generare e trasmettere il documento PDF al cliente finale, gestire gli account e gli abbonamenti, garantire la sicurezza del servizio.",
      },
      {
        h: "4. Base giuridica",
        p: "Esecuzione del contratto concluso tra l'officina e il suo cliente finale (verbale di accettazione), legittimo interesse dell'officina (tutela in caso di controversia), e per l'Editore, esecuzione del contratto concluso con l'officina.",
      },
      {
        h: "5. Conservazione",
        p: "Le schede di accettazione (e i file associati, incluse foto e PDF) sono conservate per il periodo scelto da ciascuna officina (30 giorni per impostazione predefinita, 12 mesi opzionali), quindi eliminate automaticamente e definitivamente. I dati dell'account sono conservati finché l'account resta attivo.",
      },
      {
        h: "6. Hosting e subresponsabili",
        p: "I dati sono ospitati e trattati da Supabase (database e archiviazione file) e Vercel (hosting dell'applicazione), nonché dai fornitori di invio e-mail e di pagamento utilizzati dal Servizio (Resend, Stripe). [Completare con l'elenco esatto e le sedi dei server, se applicabile.]",
      },
      {
        h: "7. Diritti degli interessati",
        p: "Ogni interessato (cliente finale di un'officina o utente del Servizio) può esercitare i propri diritti di accesso, rettifica, cancellazione e opposizione presso l'officina interessata (titolare del trattamento per i propri clienti) o presso l'Editore per i dati dell'account, all'indirizzo [indirizzo e-mail di contatto].",
      },
      {
        h: "8. Sicurezza",
        p: "Il Servizio applica misure tecniche di sicurezza: rigoroso isolamento dei dati tra officine (controllo degli accessi applicato a livello di database), archiviazione dei file in uno spazio privato con accesso temporaneo limitato nel tempo, comunicazioni cifrate (HTTPS).",
      },
      {
        h: "9. Contatto",
        p: "Per qualsiasi domanda relativa alla presente informativa o per esercitare i propri diritti: [indirizzo e-mail di contatto].",
      },
    ],
  },
};

export default function PrivacyPage() {
  const appLocale = useLocale() as Lang;
  const [lang, setLang] = useState<Lang>(appLocale);
  const c = CONTENT[lang];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm underline">
          ReceptCar
        </Link>
        <LanguageSwitcher value={lang} onChange={setLang} />
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
