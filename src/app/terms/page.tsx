"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Lang } from "@/lib/receptions/i18n";

const CONTENT: Record<
  Lang,
  { title: string; updated: string; sections: { h: string; p: string }[] }
> = {
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : 21 octobre 2026",
    sections: [
      {
        h: "1. Objet",
        p: "ReceptCar (« le Service ») est une application en ligne permettant aux garages automobiles de créer des fiches de réception de véhicule (informations client, photos, dommages constatés, signature) et de générer un document PDF associé. Le Service est édité par André Da Silva, raison individuelle, Route du Stand 41, 1163 Étoy (Suisse), ci-après « l'Éditeur ».",
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
        p: "Les présentes conditions sont régies par le droit suisse. Le for juridictionnel exclusif est celui des tribunaux ordinaires du canton de Vaud (Suisse).",
      },
      {
        h: "10. Contact",
        p: "Pour toute question relative aux présentes conditions : info@receptcar.com.",
      },
    ],
  },
  en: {
    title: "Terms of Use",
    updated: "Last updated: October 21, 2026",
    sections: [
      {
        h: "1. Purpose",
        p: "ReceptCar (\"the Service\") is an online application allowing car garages to create vehicle reception forms (customer information, photos, noted damage, signature) and generate an associated PDF document. The Service is published by André Da Silva, sole proprietorship, Route du Stand 41, 1163 Étoy, Switzerland, hereinafter \"the Publisher\".",
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
        p: "These terms are governed by Swiss law. Exclusive jurisdiction lies with the ordinary courts of the Canton of Vaud, Switzerland.",
      },
      {
        h: "10. Contact",
        p: "For any question regarding these terms: info@receptcar.com.",
      },
    ],
  },
  es: {
    title: "Condiciones de uso",
    updated: "Última actualización: 21 de octubre de 2026",
    sections: [
      {
        h: "1. Objeto",
        p: "ReceptCar («el Servicio») es una aplicación en línea que permite a los talleres de automóviles crear fichas de recepción de vehículos (información del cliente, fotos, daños constatados, firma) y generar un documento PDF asociado. El Servicio está editado por André Da Silva, empresa individual, Route du Stand 41, 1163 Étoy (Suiza), en adelante «el Editor».",
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
        p: "Las presentes condiciones se rigen por el derecho suizo. El fuero exclusivo es el de los tribunales ordinarios del cantón de Vaud (Suiza).",
      },
      {
        h: "10. Contacto",
        p: "Para cualquier pregunta relativa a estas condiciones: info@receptcar.com.",
      },
    ],
  },
  pt: {
    title: "Termos de utilização",
    updated: "Última atualização: 21 de outubro de 2026",
    sections: [
      {
        h: "1. Objeto",
        p: "O ReceptCar («o Serviço») é uma aplicação em linha que permite às oficinas automóveis criar fichas de receção de veículos (informações do cliente, fotos, danos constatados, assinatura) e gerar um documento PDF associado. O Serviço é publicado por André Da Silva, empresa em nome individual, Route du Stand 41, 1163 Étoy (Suíça), doravante «o Editor».",
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
        p: "As presentes condições regem-se pelo direito suíço. O foro exclusivo é o dos tribunais ordinários do cantão de Vaud (Suíça).",
      },
      {
        h: "10. Contacto",
        p: "Para qualquer questão relativa a estas condições: info@receptcar.com.",
      },
    ],
  },
  de: {
    title: "Nutzungsbedingungen",
    updated: "Letzte Aktualisierung: 21. Oktober 2026",
    sections: [
      {
        h: "1. Gegenstand",
        p: "ReceptCar („der Dienst\") ist eine Online-Anwendung, mit der Autowerkstätten Fahrzeug-Annahmeprotokolle (Kundendaten, Fotos, festgestellte Schäden, Unterschrift) erstellen und ein zugehöriges PDF-Dokument generieren können. Der Dienst wird herausgegeben von André Da Silva, Einzelunternehmen, Route du Stand 41, 1163 Étoy (Schweiz), nachfolgend „der Anbieter\".",
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
        p: "Diese Bedingungen unterliegen schweizerischem Recht. Ausschließlicher Gerichtsstand sind die ordentlichen Gerichte des Kantons Waadt (Schweiz).",
      },
      {
        h: "10. Kontakt",
        p: "Für Fragen zu diesen Bedingungen: info@receptcar.com.",
      },
    ],
  },
  it: {
    title: "Termini di utilizzo",
    updated: "Ultimo aggiornamento: 21 ottobre 2026",
    sections: [
      {
        h: "1. Oggetto",
        p: "ReceptCar («il Servizio») è un'applicazione online che consente alle officine di creare schede di accettazione veicolo (informazioni cliente, foto, danni riscontrati, firma) e di generare un documento PDF associato. Il Servizio è pubblicato da André Da Silva, ditta individuale, Route du Stand 41, 1163 Étoy (Svizzera), di seguito «l'Editore».",
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
        p: "Le presenti condizioni sono disciplinate dal diritto svizzero. Il foro esclusivo è quello dei tribunali ordinari del Canton Vaud (Svizzera).",
      },
      {
        h: "10. Contatto",
        p: "Per qualsiasi domanda relativa alle presenti condizioni: info@receptcar.com.",
      },
    ],
  },
  sq: {
    title: "Kushtet e Përdorimit",
    updated: "Përditësimi i fundit: 21 tetor 2026",
    sections: [
      {
        h: "1. Qëllimi",
        p: "ReceptCar ('Shërbimi') është një aplikacion online që u mundëson punëtorive të riparimit të automjeteve të krijojnë formularë pranimi për automjetet (të dhënat e klientit, fotografitë, dëmtimet e vërejtura, nënshkrimi) dhe të gjenerojnë një dokument PDF të lidhur. Shërbimi publikohet nga André Da Silva, pronësi individuale, Route du Stand 41, 1163 Étoy (Zvicër), më poshtë 'Botuesi'.",
      },
      {
        h: "2. Pranimi",
        p: "Përdorimi i Shërbimit nënkupton pranimin e plotë dhe pa kushte të këtyre kushteve dhe rregullave nga personi që krijon llogarinë ('Klienti') dhe nga përdoruesit që ata ftojnë në garazhin e tyre.",
      },
      {
        h: "3. Llogaria dhe qasja",
        p: "Klienti është përgjegjës për ruajtjen konfidenciale të të dhënave të tij të hyrjes dhe për përdorimin e Shërbimit nga llogaritë që ai krijon ose fton (pronar, mekanik, recepcion). Çdo garazh përbën një hapësirë të veçantë: asnjë garazh tjetër nuk ka akses në të dhënat e një garazhi të caktuar.",
      },
      {
        h: "4. Provë falas dhe abonim",
        p: "Një provë falas 30-ditore ofrohet kur krijoni një llogari, pa asnjë detyrim. Në fund të periudhës së provës, qasja në veçoritë e pritjes pezullohet derisa të merret një abonim me pagesë. Abonimi është mujor (ose vjetor nëse merret si i tillë), pa afat minimal kontraktual, dhe mund të anulohet në çdo kohë; anulimi hyn në fuqi në fund të periudhës për të cilën është paguar tashmë. Tarifa e zbatueshme varet nga vendi i faturimit i deklaruar nga garazhi.",
      },
      {
        h: "5. Të dhënat dhe përmbajtja",
        p: "Klienti mbetet pronar i vetëm i të dhënave që ai fut në Shërbim (informacione të klientit, foto, dokumente). Botuesi vepron si përpunues i të dhënave në kuptimin e GDPR/nLPD për përpunimin e këtyre të dhënave në emër të Klientit — shih politikën e privatësisë për detaje të mëtejshme.",
      },
      {
        h: "6. Ruajtja dhe fshirja",
        p: "Formularët e dorëzimit (dhe skedarët e lidhur) ruhen për periudhën e zgjedhur nga garazhi (30 ditë si parazgjedhje, 12 muaj si opsion), pas së cilës fshihen automatikisht dhe përhershëm, përfshirë fotot dhe dokumentin PDF.",
      },
      {
        h: "7. Disponueshmëria dhe përgjegjësia",
        p: "Botuesi do të ndërmarrë masa të arsyeshme për të siguruar disponueshmërinë dhe sigurinë e Shërbimit, pa garantuar disponueshmëri të pandërprerë. Në masën që lejohet nga ligji, përgjegjësia e Botuesit kufizohet në dëmet e drejtpërdrejta dhe është e kapur në shumën që Klienti ka paguar gjatë dymbëdhjetë muajve të fundit.",
      },
      {
        h: "8. Përfundimi",
        p: "Klienti mund të anulojë abonimin e tij në çdo kohë përmes aplikacionit. Botuesi mund të pezulloj ose ndërpresë aksesin në rast të mos pagesës ose përdorimit në kundërshtim me këto kushte dhe rregulla, pas njoftimit.",
      },
      {
        h: "9. Ligji i zbatueshëm",
        p: "Këto kushte dhe rregulla rregullohen nga ligji zvicëran. Gjykata kompetente ekskluzive është ajo e gjykatave të zakonshme të kantonit Vaud (Zvicër).",
      },
      {
        h: "10. Kontakt",
        p: "Nëse keni ndonjë pyetje në lidhje me këto kushte dhe rregulla, ju lutemi na kontaktoni në: info@receptcar.com.",
      },
    ],
  },
  el: {
    title: "Όροι χρήσης",
    updated: "Τελευταία ενημέρωση: 21 Οκτωβρίου 2026",
    sections: [
      {
        h: "1. Αντικείμενο",
        p: "Το ReceptCar («η Υπηρεσία») είναι μια διαδικτυακή εφαρμογή που επιτρέπει στα συνεργεία αυτοκινήτων να δημιουργούν δελτία παραλαβής οχημάτων (πληροφορίες πελάτη, φωτογραφίες, διαπιστωμένες ζημιές, υπογραφή) και να εκδίδουν το αντίστοιχο έγγραφο σε μορφή PDF. Η Υπηρεσία παρέχεται από τον André Da Silva, ατομική επιχείρηση, Route du Stand 41, 1163 Étoy (Ελβετία), εφεξής «ο Παροχέας».",
      },
      {
        h: "2. Αποδοχή",
        p: "Η χρήση της Υπηρεσίας συνεπάγεται την πλήρη και ανεπιφύλακτη αποδοχή των παρόντων όρων από το πρόσωπο που δημιουργεί τον λογαριασμό («ο Πελάτης») και από τους χρήστες που προσκαλεί στο γκαράζ του.",
      },
      {
        h: "3. Λογαριασμός και πρόσβαση",
        p: "Ο Πελάτης είναι υπεύθυνος για την εμπιστευτικότητα των στοιχείων σύνδεσής του και για τη χρήση της Υπηρεσίας από τους λογαριασμούς που δημιουργεί ή προσκαλεί (ιδιοκτήτης, μηχανικός, υποδοχή). Κάθε συνεργείο αποτελεί έναν αυτόνομο χώρο: τα δεδομένα ενός συνεργείου δεν είναι προσβάσιμα σε κανένα άλλο συνεργείο.",
      },
      {
        h: "4. Δωρεάν δοκιμή και συνδρομή",
        p: "Κατά τη δημιουργία του λογαριασμού προσφέρεται δωρεάν δοκιμαστική περίοδος 30 ημερών, χωρίς καμία δέσμευση. Μετά τη λήξη της δοκιμαστικής περιόδου, η πρόσβαση στις λειτουργίες λήψης αναστέλλεται έως ότου συνάψει κανείς συνδρομή επί πληρωμή. Η συνδρομή είναι μηνιαία (ή ετήσια, αν έχει επιλεγεί ως τέτοια), χωρίς δέσμευση διάρκειας, και μπορεί να καταγγελθεί ανά πάσα στιγμή· η καταγγελία τίθεται σε ισχύ στο τέλος της περιόδου που έχει ήδη πληρωθεί. Η ισχύουσα τιμή εξαρτάται από τη χώρα τιμολόγησης που έχει δηλώσει το συνεργείο.",
      },
      {
        h: "5. Δεδομένα και περιεχόμενο",
        p: "Ο Πελάτης παραμένει ο μοναδικός ιδιοκτήτης των δεδομένων που εισάγει στην Υπηρεσία (πληροφορίες πελάτη, φωτογραφίες, έγγραφα). Ο Διαχειριστής ενεργεί ως εκτελών την επεξεργασία κατά την έννοια του ΓΚΠΔ / του nLPD για την επεξεργασία αυτών των δεδομένων για λογαριασμό του Πελάτη — βλ. την πολιτική απορρήτου για λεπτομέρειες.",
      },
      {
        h: "6. Διατήρηση και διαγραφή",
        p: "Τα δελτία παραλαβής (και τα σχετικά αρχεία) διατηρούνται για το χρονικό διάστημα που επιλέγει το συνεργείο (30 ημέρες από προεπιλογή, 12 μήνες προαιρετικά) και στη συνέχεια διαγράφονται αυτόματα και οριστικά, συμπεριλαμβανομένων των φωτογραφιών και του αρχείου PDF.",
      },
      {
        h: "7. Διαθεσιμότητα και ευθύνη",
        p: "Ο Εκδότης καταβάλλει εύλογες προσπάθειες για να διασφαλίσει τη διαθεσιμότητα και την ασφάλεια της Υπηρεσίας, χωρίς όμως να εγγυάται τη συνεχή διαθεσιμότητα. Στα όρια που επιτρέπει ο νόμος, η ευθύνη του Εκδότη περιορίζεται στις άμεσες ζημίες και δεν υπερβαίνει το ποσό που κατέβαλε ο Πελάτης κατά τη διάρκεια των τελευταίων δώδεκα μηνών.",
      },
      {
        h: "8. Καταγγελία",
        p: "Ο Πελάτης μπορεί να καταγγείλει τη συνδρομή του ανά πάσα στιγμή μέσω της εφαρμογής. Ο Εκδότης μπορεί να αναστείλει ή να καταγγείλει την πρόσβαση σε περίπτωση μη πληρωμής ή χρήσης που αντιβαίνει στους παρόντες όρους, κατόπιν ειδοποίησης.",
      },
      {
        h: "9. Εφαρμοστέο δίκαιο",
        p: "Οι παρόντες όροι διέπονται από το ελβετικό δίκαιο. Αποκλειστικά αρμόδια είναι τα τακτικά δικαστήρια του Καντονιού Vaud (Ελβετία).",
      },
      {
        h: "10. Επικοινωνία",
        p: "Για οποιαδήποτε ερώτηση σχετικά με τους παρόντες όρους: info@receptcar.com.",
      },
    ],
  },
  ru: {
    title: "Условия использования",
    updated: "Последнее обновление: 21 октября 2026 г.",
    sections: [
      {
        h: "1. Предмет",
        p: "ReceptCar («Сервис») — это онлайн-приложение, позволяющее автосервисам создавать протоколы приема автомобилей (данные о клиенте, фотографии, зафиксированные повреждения, подпись) и формировать соответствующий документ в формате PDF. Сервис предоставляется André Da Silva (индивидуальное предприятие), Route du Stand 41, 1163 Étoy (Швейцария), далее именуемым «Оператор».",
      },
      {
        h: "2. Согласие",
        p: "Использование Сервиса подразумевает полное и безоговорочное принятие настоящих условий лицом, создающим учетную запись («Клиент»), а также пользователями, которых он приглашает в свою автомастерскую.",
      },
      {
        h: "3. Учетная запись и доступ",
        p: "Клиент несет ответственность за конфиденциальность своих учетных данных, а также за использование Сервиса учетными записями, которые он создает или приглашает (владелец, механик, приемщик). Каждая автомастерская представляет собой изолированное пространство: данные одной автомастерской недоступны для других автомастерских.",
      },
      {
        h: "4. Бесплатная пробная версия и подписка",
        p: "При создании учетной записи предлагается 30-дневная бесплатная пробная версия без каких-либо обязательств. По истечении пробного периода доступ к функциям приема заказов приостанавливается до тех пор, пока не будет оформлена платная подписка. Подписка оформляется на месяц (или на год, если она оформлена именно так), без обязательств по сроку действия и может быть расторгнута в любой момент; расторжение вступает в силу по окончании уже оплаченного периода. Применяемый тариф зависит от страны выставления счета, указанной автосервисом.",
      },
      {
        h: "5. Данные и контент",
        p: "Клиент остается единственным владельцем данных, которые он вводит в Сервис (клиентская информация, фотографии, документы). Издатель выступает в качестве субподрядчика в понимании Общего регламента по защите данных (RGPD) / нового закона о защите данных (nLPD) при обработке этих данных от имени Клиента — подробности см. в Политике конфиденциальности.",
      },
      {
        h: "6. Сохранение и удаление",
        p: "Акты приемки (и связанные с ними файлы) хранятся в течение срока, выбранного автосервисом (по умолчанию — 30 дней, по выбору — 12 месяцев), после чего автоматически и без возможности восстановления удаляются, включая фотографии и документ в формате PDF.",
      },
      {
        h: "7. Доступность и ответственность",
        p: "Издатель принимает разумные меры для обеспечения доступности и безопасности Сервиса, не гарантируя при этом его непрерывную доступность. В пределах, допускаемых законом, ответственность Издателя ограничивается прямыми убытками и не может превышать сумму, уплаченную Клиентом за последние двенадцать месяцев.",
      },
      {
        h: "8. Расторжение договора",
        p: "Клиент может отменить подписку в любое время через приложение. Издатель вправе приостановить или прекратить доступ в случае неуплаты или использования, противоречащего настоящим условиям, после направления соответствующего уведомления.",
      },
      {
        h: "9. Применимое право",
        p: "Настоящие условия регулируются законодательством Швейцарии. Исключительной юрисдикцией обладают обычные суды кантона Во (Швейцария).",
      },
      {
        h: "10. Контакты",
        p: "По любым вопросам, касающимся настоящих условий: info@receptcar.com.",
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

      <div className="flex flex-col gap-6">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-1 text-base font-semibold">{s.h}</h2>
            <p className="text-sm text-neutral-700">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex gap-4 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <Link href="/privacy" className="underline">
          {{
            fr: "Politique de confidentialité",
            en: "Privacy Policy",
            es: "Política de privacidad",
            pt: "Política de privacidade",
            de: "Datenschutzrichtlinie",
            it: "Informativa sulla privacy",
            sq: "Politika e Privatësisë",
            el: "Πολιτική απορρήτου",
            ru: "Политика конфиденциальности",
          }[lang]}
        </Link>
        <Link href="/cookies" className="underline">
          {{
            fr: "Cookies",
            en: "Cookies",
            es: "Cookies",
            pt: "Cookies",
            de: "Cookies",
            it: "Cookie",
            sq: "Cookies",
            el: "Cookies",
            ru: "Файлы cookie",
          }[lang]}
        </Link>
      </div>
    </main>
  );
}
