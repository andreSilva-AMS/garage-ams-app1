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
  es: {
    title: "Condiciones de uso",
    updated: "Última actualización: a completar antes de la puesta en línea",
    draftNotice:
      "Borrador genérico pendiente de revisión jurídica antes de su uso real. El texto entre corchetes [ ] debe completarse con los datos exactos de la sociedad que explota ReceptCar.",
    sections: [
      {
        h: "1. Objeto",
        p: "ReceptCar («el Servicio») es una aplicación en línea que permite a los talleres de automóviles crear fichas de recepción de vehículos (información del cliente, fotos, daños constatados, firma) y generar un documento PDF asociado. El Servicio está editado por [razón social completa, forma jurídica, domicilio social, número de registro], en adelante «el Editor».",
      },
      {
        h: "2. Aceptación",
        p: "El uso del Servicio implica la aceptación plena de las presentes condiciones por la persona que crea la cuenta («el Cliente») y por los usuarios que invite dentro de su taller.",
      },
      {
        h: "3. Cuenta y acceso",
        p: "El Cliente es responsable de la confidencialidad de sus credenciales y del uso que se haga del Servicio por las cuentas que cree o invite (propietario, mecánico, recepción). Cada taller constituye un espacio aislado: los datos de un taller no son accesibles para ningún otro taller.",
      },
      {
        h: "4. Prueba gratuita y suscripción",
        p: "Se ofrece una prueba gratuita de 30 días al crear la cuenta, sin compromiso. Al finalizar la prueba, el acceso a las funciones de recepción se suspende hasta que se contrate una suscripción de pago. La suscripción es mensual (o anual si se contrata como tal), sin compromiso de permanencia, cancelable en cualquier momento; la cancelación surte efecto al final del período ya pagado. La tarifa aplicable depende del país de facturación declarado por el taller.",
      },
      {
        h: "5. Datos y contenidos",
        p: "El Cliente sigue siendo el único propietario de los datos que introduce en el Servicio (información del cliente, fotos, documentos). El Editor actúa como encargado del tratamiento en el sentido del RGPD para el tratamiento de estos datos por cuenta del Cliente — véase la política de privacidad para más detalles.",
      },
      {
        h: "6. Conservación y eliminación",
        p: "Las fichas de recepción (y los archivos asociados) se conservan durante el período elegido por el taller (30 días por defecto, 12 meses opcional), y después se eliminan automática y definitivamente, incluidas las fotos y el documento PDF.",
      },
      {
        h: "7. Disponibilidad y responsabilidad",
        p: "El Editor emplea medios razonables para garantizar la disponibilidad y seguridad del Servicio, sin garantizar una disponibilidad continua. En la medida permitida por la ley, la responsabilidad del Editor se limita a los daños directos y se limita al importe pagado por el Cliente durante los últimos doce meses.",
      },
      {
        h: "8. Resolución",
        p: "El Cliente puede cancelar su suscripción en cualquier momento desde la aplicación. El Editor puede suspender o resolver el acceso en caso de impago o de uso contrario a las presentes condiciones, previa notificación.",
      },
      {
        h: "9. Ley aplicable",
        p: "Las presentes condiciones se rigen por el derecho suizo. [Por confirmar: fuero jurisdiccional competente.]",
      },
      {
        h: "10. Contacto",
        p: "Para cualquier pregunta relativa a estas condiciones: [dirección de correo electrónico de contacto].",
      },
    ],
  },
  pt: {
    title: "Termos de utilização",
    updated: "Última atualização: a completar antes da entrada em produção",
    draftNotice:
      "Rascunho genérico pendente de revisão jurídica antes de uma utilização real. O texto entre parênteses retos [ ] deve ser completado com os dados exatos da sociedade que explora o ReceptCar.",
    sections: [
      {
        h: "1. Objeto",
        p: "O ReceptCar («o Serviço») é uma aplicação em linha que permite às oficinas automóveis criar fichas de receção de veículos (informações do cliente, fotos, danos constatados, assinatura) e gerar um documento PDF associado. O Serviço é publicado por [razão social completa, forma jurídica, sede social, número de registo], doravante «o Editor».",
      },
      {
        h: "2. Aceitação",
        p: "A utilização do Serviço implica a aceitação plena das presentes condições pela pessoa que cria a conta («o Cliente») e pelos utilizadores que esta convidar dentro da sua oficina.",
      },
      {
        h: "3. Conta e acesso",
        p: "O Cliente é responsável pela confidencialidade das suas credenciais e pela utilização do Serviço pelas contas que criar ou convidar (proprietário, mecânico, receção). Cada oficina constitui um espaço isolado: os dados de uma oficina nunca são acessíveis a outra oficina.",
      },
      {
        h: "4. Período de teste gratuito e subscrição",
        p: "É oferecido um período de teste gratuito de 30 dias na criação da conta, sem compromisso. Após o teste, o acesso às funcionalidades de receção é suspenso enquanto não for contratada uma subscrição paga. A subscrição é mensal (ou anual, se contratada como tal), sem compromisso de duração, cancelável a qualquer momento; o cancelamento produz efeitos no final do período já pago. A tarifa aplicável depende do país de faturação declarado pela oficina.",
      },
      {
        h: "5. Dados e conteúdos",
        p: "O Cliente permanece o único proprietário dos dados que introduz no Serviço (informações do cliente, fotos, documentos). O Editor atua como subcontratante na aceção do RGPD para o tratamento destes dados por conta do Cliente — ver a política de privacidade para mais detalhes.",
      },
      {
        h: "6. Conservação e eliminação",
        p: "As fichas de receção (e ficheiros associados) são conservadas durante o período escolhido pela oficina (30 dias por defeito, 12 meses opcional), sendo depois eliminadas automática e definitivamente, incluindo as fotos e o documento PDF.",
      },
      {
        h: "7. Disponibilidade e responsabilidade",
        p: "O Editor emprega meios razoáveis para assegurar a disponibilidade e a segurança do Serviço, sem garantir uma disponibilidade contínua. Nos limites permitidos por lei, a responsabilidade do Editor limita-se aos danos diretos e ao montante pago pelo Cliente nos últimos doze meses.",
      },
      {
        h: "8. Rescisão",
        p: "O Cliente pode cancelar a sua subscrição a qualquer momento a partir da aplicação. O Editor pode suspender ou rescindir o acesso em caso de não pagamento ou de utilização contrária às presentes condições, após notificação.",
      },
      {
        h: "9. Lei aplicável",
        p: "As presentes condições regem-se pelo direito suíço. [A confirmar: foro jurisdicional competente.]",
      },
      {
        h: "10. Contacto",
        p: "Para qualquer questão relativa a estas condições: [endereço de e-mail de contacto].",
      },
    ],
  },
  de: {
    title: "Nutzungsbedingungen",
    updated: "Letzte Aktualisierung: vor der Veröffentlichung zu ergänzen",
    draftNotice:
      "Generischer Entwurf, der vor der tatsächlichen Nutzung rechtlich geprüft werden muss. Die Angaben in eckigen Klammern [ ] müssen mit den genauen Angaben der Gesellschaft, die ReceptCar betreibt, ergänzt werden.",
    sections: [
      {
        h: "1. Gegenstand",
        p: "ReceptCar („der Dienst\") ist eine Online-Anwendung, mit der Autowerkstätten Fahrzeug-Annahmeprotokolle (Kundendaten, Fotos, festgestellte Schäden, Unterschrift) erstellen und ein zugehöriges PDF-Dokument generieren können. Der Dienst wird herausgegeben von [vollständiger Firmenname, Rechtsform, Sitz, Registernummer], nachfolgend „der Anbieter\".",
      },
      {
        h: "2. Annahme",
        p: "Die Nutzung des Dienstes setzt die vollständige Annahme dieser Bedingungen durch die Person voraus, die das Konto erstellt („der Kunde\"), sowie durch die von ihr innerhalb ihrer Werkstatt eingeladenen Nutzer.",
      },
      {
        h: "3. Konto und Zugang",
        p: "Der Kunde ist verantwortlich für die Vertraulichkeit seiner Zugangsdaten und für die Nutzung des Dienstes durch die von ihm erstellten oder eingeladenen Konten (Inhaber, Mechaniker, Annahme). Jede Werkstatt bildet einen isolierten Bereich: Die Daten einer Werkstatt sind für keine andere Werkstatt zugänglich.",
      },
      {
        h: "4. Kostenlose Testphase und Abonnement",
        p: "Bei der Kontoerstellung wird eine 30-tägige kostenlose Testphase ohne Verpflichtung angeboten. Nach Ablauf der Testphase wird der Zugang zu den Annahmefunktionen gesperrt, bis ein kostenpflichtiges Abonnement abgeschlossen wird. Das Abonnement ist monatlich (oder jährlich, falls so abgeschlossen), ohne Mindestlaufzeit, jederzeit kündbar; die Kündigung wird zum Ende des bereits bezahlten Zeitraums wirksam. Der anwendbare Preis hängt vom von der Werkstatt angegebenen Rechnungsland ab.",
      },
      {
        h: "5. Daten und Inhalte",
        p: "Der Kunde bleibt alleiniger Eigentümer der von ihm in den Dienst eingegebenen Daten (Kundendaten, Fotos, Dokumente). Der Anbieter handelt als Auftragsverarbeiter im Sinne der DSGVO / des revDSG bei der Verarbeitung dieser Daten im Auftrag des Kunden — Einzelheiten siehe Datenschutzrichtlinie.",
      },
      {
        h: "6. Aufbewahrung und Löschung",
        p: "Annahmeprotokolle (und zugehörige Dateien) werden für die von der Werkstatt gewählte Dauer aufbewahrt (standardmäßig 30 Tage, optional 12 Monate) und anschließend automatisch und endgültig gelöscht, einschließlich Fotos und PDF-Dokument.",
      },
      {
        h: "7. Verfügbarkeit und Haftung",
        p: "Der Anbieter setzt angemessene Mittel ein, um die Verfügbarkeit und Sicherheit des Dienstes zu gewährleisten, ohne eine durchgehende Verfügbarkeit zu garantieren. Soweit gesetzlich zulässig, ist die Haftung des Anbieters auf unmittelbare Schäden beschränkt und auf den vom Kunden in den letzten zwölf Monaten gezahlten Betrag begrenzt.",
      },
      {
        h: "8. Kündigung",
        p: "Der Kunde kann sein Abonnement jederzeit über die Anwendung kündigen. Der Anbieter kann den Zugang bei Nichtzahlung oder bei Nutzung entgegen diesen Bedingungen nach vorheriger Ankündigung sperren oder beenden.",
      },
      {
        h: "9. Anwendbares Recht",
        p: "Diese Bedingungen unterliegen schweizerischem Recht. [Zu bestätigen: zuständiger Gerichtsstand.]",
      },
      {
        h: "10. Kontakt",
        p: "Für Fragen zu diesen Bedingungen: [Kontakt-E-Mail-Adresse].",
      },
    ],
  },
  it: {
    title: "Termini di utilizzo",
    updated: "Ultimo aggiornamento: da completare prima della messa online",
    draftNotice:
      "Bozza generica in attesa di revisione legale prima dell'uso reale. Le indicazioni tra parentesi quadre [ ] devono essere completate con i dati esatti della società che gestisce ReceptCar.",
    sections: [
      {
        h: "1. Oggetto",
        p: "ReceptCar («il Servizio») è un'applicazione online che consente alle officine di creare schede di accettazione veicolo (informazioni cliente, foto, danni riscontrati, firma) e di generare un documento PDF associato. Il Servizio è pubblicato da [ragione sociale completa, forma giuridica, sede legale, numero di registrazione], di seguito «l'Editore».",
      },
      {
        h: "2. Accettazione",
        p: "L'utilizzo del Servizio implica l'accettazione piena delle presenti condizioni da parte della persona che crea l'account («il Cliente») e degli utenti da essa invitati all'interno della propria officina.",
      },
      {
        h: "3. Account e accesso",
        p: "Il Cliente è responsabile della riservatezza delle proprie credenziali e dell'uso del Servizio da parte degli account che crea o invita (proprietario, meccanico, reception). Ogni officina costituisce uno spazio isolato: i dati di un'officina non sono mai accessibili a un'altra officina.",
      },
      {
        h: "4. Prova gratuita e abbonamento",
        p: "Alla creazione dell'account viene offerta una prova gratuita di 30 giorni, senza impegno. Al termine della prova, l'accesso alle funzionalità di accettazione viene sospeso finché non viene sottoscritto un abbonamento a pagamento. L'abbonamento è mensile (o annuale se sottoscritto come tale), senza vincolo di durata, disdicibile in qualsiasi momento; la disdetta ha effetto alla fine del periodo già pagato. La tariffa applicabile dipende dal paese di fatturazione dichiarato dall'officina.",
      },
      {
        h: "5. Dati e contenuti",
        p: "Il Cliente rimane l'unico proprietario dei dati che inserisce nel Servizio (informazioni cliente, foto, documenti). L'Editore agisce come responsabile del trattamento ai sensi del GDPR per il trattamento di questi dati per conto del Cliente — vedere l'informativa sulla privacy per i dettagli.",
      },
      {
        h: "6. Conservazione ed eliminazione",
        p: "Le schede di accettazione (e i file associati) sono conservate per il periodo scelto dall'officina (30 giorni per impostazione predefinita, 12 mesi opzionali), poi eliminate automaticamente e definitivamente, comprese le foto e il documento PDF.",
      },
      {
        h: "7. Disponibilità e responsabilità",
        p: "L'Editore impiega mezzi ragionevoli per garantire la disponibilità e la sicurezza del Servizio, senza garantire una disponibilità continua. Nei limiti consentiti dalla legge, la responsabilità dell'Editore è limitata ai danni diretti ed è limitata all'importo pagato dal Cliente negli ultimi dodici mesi.",
      },
      {
        h: "8. Risoluzione",
        p: "Il Cliente può disdire il proprio abbonamento in qualsiasi momento dall'applicazione. L'Editore può sospendere o risolvere l'accesso in caso di mancato pagamento o di utilizzo contrario alle presenti condizioni, previa notifica.",
      },
      {
        h: "9. Legge applicabile",
        p: "Le presenti condizioni sono disciplinate dal diritto svizzero. [Da confermare: foro competente.]",
      },
      {
        h: "10. Contatto",
        p: "Per qualsiasi domanda relativa alle presenti condizioni: [indirizzo e-mail di contatto].",
      },
    ],
  },
};

export default function TermsPage() {
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
