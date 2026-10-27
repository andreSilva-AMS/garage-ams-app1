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
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 21 octobre 2026",
    sections: [
      {
        h: "1. Qui traite vos données",
        p: "ReceptCar est édité par André Da Silva, raison individuelle, Route du Stand 41, 1163 Étoy (Suisse), contact : info@receptcar.com. Pour les données saisies par les garages clients (informations de leurs propres clients), l'Éditeur agit comme sous-traitant au sens du RGPD (Règlement UE 2016/679) et de la nLPD suisse ; le garage reste responsable de traitement vis-à-vis de ses propres clients.",
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
        p: "Les données sont hébergées et traitées par Supabase (base de données et stockage de fichiers) et Vercel (hébergement de l'application), ainsi que par les prestataires d'envoi d'e-mail et de paiement utilisés par le Service (Resend, Stripe). Les serveurs de Supabase sont situés en Irlande (UE) et ceux de Vercel à Francfort (Allemagne).",
      },
      {
        h: "7. Droits des personnes",
        p: "Toute personne concernée (client final d'un garage ou utilisateur du Service) peut exercer ses droits d'accès, de rectification, d'effacement et d'opposition auprès du garage concerné (responsable de traitement pour ses propres clients) ou auprès de l'Éditeur pour les données de compte, à l'adresse info@receptcar.com.",
      },
      {
        h: "8. Sécurité",
        p: "Le Service applique des mesures techniques de sécurité : isolement strict des données entre garages (contrôle d'accès appliqué au niveau de la base de données), stockage des fichiers dans un espace privé avec accès temporaire limité dans le temps, chiffrement des communications (HTTPS).",
      },
      {
        h: "9. Contact",
        p: "Pour toute question relative à cette politique ou pour exercer vos droits : info@receptcar.com.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: October 21, 2026",
    sections: [
      {
        h: "1. Who processes your data",
        p: "ReceptCar is published by André Da Silva, sole proprietorship, Route du Stand 41, 1163 Étoy, Switzerland, contact: info@receptcar.com. For data entered by client garages (information about their own customers), the Publisher acts as a data processor under the GDPR (EU Regulation 2016/679) and the Swiss nFADP; the garage remains the data controller towards its own customers.",
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
        p: "Data is hosted and processed by Supabase (database and file storage) and Vercel (application hosting), as well as the e-mail and payment providers used by the Service (Resend, Stripe). Supabase's servers are located in Ireland (EU) and Vercel's in Frankfurt (Germany).",
      },
      {
        h: "7. Data subject rights",
        p: "Any data subject (a garage's end customer or a Service user) may exercise their rights of access, rectification, erasure and objection with the relevant garage (data controller for its own customers) or with the Publisher for account data, at info@receptcar.com.",
      },
      {
        h: "8. Security",
        p: "The Service applies technical security measures: strict data isolation between garages (access control enforced at the database level), file storage in a private space with time-limited access, encrypted communications (HTTPS).",
      },
      {
        h: "9. Contact",
        p: "For any question about this policy or to exercise your rights: info@receptcar.com.",
      },
    ],
  },
  es: {
    title: "Política de privacidad",
    updated: "Última actualización: 21 de octubre de 2026",
    sections: [
      {
        h: "1. Quién trata sus datos",
        p: "ReceptCar está editado por André Da Silva, empresa individual, Route du Stand 41, 1163 Étoy (Suiza), contacto: info@receptcar.com. Para los datos introducidos por los talleres clientes (información de sus propios clientes), el Editor actúa como encargado del tratamiento en el sentido del RGPD (Reglamento UE 2016/679); el taller sigue siendo responsable del tratamiento frente a sus propios clientes.",
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
        p: "Los datos se alojan y tratan mediante Supabase (base de datos y almacenamiento de archivos) y Vercel (alojamiento de la aplicación), así como los proveedores de envío de correo electrónico y de pago utilizados por el Servicio (Resend, Stripe). Los servidores de Supabase están ubicados en Irlanda (UE) y los de Vercel en Fráncfort (Alemania).",
      },
      {
        h: "7. Derechos de las personas",
        p: "Toda persona interesada (cliente final de un taller o usuario del Servicio) puede ejercer sus derechos de acceso, rectificación, supresión y oposición ante el taller correspondiente (responsable del tratamiento para sus propios clientes) o ante el Editor para los datos de la cuenta, en info@receptcar.com.",
      },
      {
        h: "8. Seguridad",
        p: "El Servicio aplica medidas técnicas de seguridad: aislamiento estricto de los datos entre talleres (control de acceso aplicado a nivel de la base de datos), almacenamiento de archivos en un espacio privado con acceso temporal limitado en el tiempo, cifrado de las comunicaciones (HTTPS).",
      },
      {
        h: "9. Contacto",
        p: "Para cualquier pregunta relativa a esta política o para ejercer sus derechos: info@receptcar.com.",
      },
    ],
  },
  pt: {
    title: "Política de privacidade",
    updated: "Última atualização: 21 de outubro de 2026",
    sections: [
      {
        h: "1. Quem trata os seus dados",
        p: "O ReceptCar é publicado por André Da Silva, empresa em nome individual, Route du Stand 41, 1163 Étoy (Suíça), contacto: info@receptcar.com. Para os dados introduzidos pelas oficinas clientes (informações dos seus próprios clientes), o Editor atua como subcontratante na aceção do RGPD; a oficina continua a ser responsável pelo tratamento perante os seus próprios clientes.",
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
        p: "Os dados são alojados e tratados pela Supabase (base de dados e armazenamento de ficheiros) e pela Vercel (alojamento da aplicação), bem como pelos prestadores de envio de e-mail e de pagamento utilizados pelo Serviço (Resend, Stripe). Os servidores da Supabase estão localizados na Irlanda (UE) e os da Vercel em Frankfurt (Alemanha).",
      },
      {
        h: "7. Direitos dos titulares",
        p: "Qualquer titular dos dados (cliente final de uma oficina ou utilizador do Serviço) pode exercer os seus direitos de acesso, retificação, apagamento e oposição junto da oficina em causa (responsável pelo tratamento para os seus próprios clientes) ou junto do Editor para os dados da conta, em info@receptcar.com.",
      },
      {
        h: "8. Segurança",
        p: "O Serviço aplica medidas técnicas de segurança: isolamento estrito dos dados entre oficinas (controlo de acesso aplicado ao nível da base de dados), armazenamento de ficheiros num espaço privado com acesso temporário limitado no tempo, encriptação das comunicações (HTTPS).",
      },
      {
        h: "9. Contacto",
        p: "Para qualquer questão relativa a esta política ou para exercer os seus direitos: info@receptcar.com.",
      },
    ],
  },
  de: {
    title: "Datenschutzrichtlinie",
    updated: "Letzte Aktualisierung: 21. Oktober 2026",
    sections: [
      {
        h: "1. Wer Ihre Daten verarbeitet",
        p: "ReceptCar wird herausgegeben von André Da Silva, Einzelunternehmen, Route du Stand 41, 1163 Étoy (Schweiz), Kontakt: info@receptcar.com. Für Daten, die von den Kunden-Werkstätten eingegeben werden (Informationen über deren eigene Kunden), handelt der Anbieter als Auftragsverarbeiter im Sinne der DSGVO (EU-Verordnung 2016/679) und des revDSG; die Werkstatt bleibt gegenüber ihren eigenen Kunden für die Verarbeitung verantwortlich.",
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
        p: "Die Daten werden von Supabase (Datenbank und Dateispeicherung) und Vercel (Hosting der Anwendung) sowie von den vom Dienst genutzten E-Mail- und Zahlungsanbietern (Resend, Stripe) gehostet und verarbeitet. Die Server von Supabase befinden sich in Irland (EU), die von Vercel in Frankfurt (Deutschland).",
      },
      {
        h: "7. Rechte der betroffenen Personen",
        p: "Jede betroffene Person (Endkunde einer Werkstatt oder Nutzer des Dienstes) kann ihre Rechte auf Auskunft, Berichtigung, Löschung und Widerspruch bei der betreffenden Werkstatt (Verantwortliche für ihre eigenen Kunden) oder für Kontodaten beim Anbieter unter info@receptcar.com geltend machen.",
      },
      {
        h: "8. Sicherheit",
        p: "Der Dienst wendet technische Sicherheitsmaßnahmen an: strikte Datentrennung zwischen Werkstätten (Zugriffskontrolle auf Datenbankebene), Speicherung von Dateien in einem privaten Bereich mit zeitlich begrenztem Zugriff, verschlüsselte Kommunikation (HTTPS).",
      },
      {
        h: "9. Kontakt",
        p: "Für Fragen zu dieser Richtlinie oder zur Ausübung Ihrer Rechte: info@receptcar.com.",
      },
    ],
  },
  it: {
    title: "Informativa sulla privacy",
    updated: "Ultimo aggiornamento: 21 ottobre 2026",
    sections: [
      {
        h: "1. Chi tratta i vostri dati",
        p: "ReceptCar è pubblicato da André Da Silva, ditta individuale, Route du Stand 41, 1163 Étoy (Svizzera), contatto: info@receptcar.com. Per i dati inseriti dalle officine clienti (informazioni dei loro propri clienti), l'Editore agisce come responsabile del trattamento ai sensi del GDPR (Regolamento UE 2016/679); l'officina rimane titolare del trattamento nei confronti dei propri clienti.",
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
        p: "I dati sono ospitati e trattati da Supabase (database e archiviazione file) e Vercel (hosting dell'applicazione), nonché dai fornitori di invio e-mail e di pagamento utilizzati dal Servizio (Resend, Stripe). I server di Supabase si trovano in Irlanda (UE) e quelli di Vercel a Francoforte (Germania).",
      },
      {
        h: "7. Diritti degli interessati",
        p: "Ogni interessato (cliente finale di un'officina o utente del Servizio) può esercitare i propri diritti di accesso, rettifica, cancellazione e opposizione presso l'officina interessata (titolare del trattamento per i propri clienti) o presso l'Editore per i dati dell'account, all'indirizzo info@receptcar.com.",
      },
      {
        h: "8. Sicurezza",
        p: "Il Servizio applica misure tecniche di sicurezza: rigoroso isolamento dei dati tra officine (controllo degli accessi applicato a livello di database), archiviazione dei file in uno spazio privato con accesso temporaneo limitato nel tempo, comunicazioni cifrate (HTTPS).",
      },
      {
        h: "9. Contatto",
        p: "Per qualsiasi domanda relativa alla presente informativa o per esercitare i propri diritti: info@receptcar.com.",
      },
    ],
  },
  sq: {
    title: "Politika e Privatësisë",
    updated: "Përditësimi i fundit: 21 tetor 2026",
    sections: [
      {
        h: "1. Kush përpunon të dhënat tuaja",
        p: "ReceptCar publikohet nga André Da Silva, pronësi individuale, Route du Stand 41, 1163 Étoy (Zvicër), kontakt: info@receptcar.com. Sa i përket të dhënave të futura nga garazhet e klientëve (informacion që lidhet me klientët e tyre), Botuesi vepron si përpunues i të dhënave në kuptim të GDPR (Rregullorja e BE-së 2016/679) dhe nLPD-së zvicerane; garazhi mbetet kontrollues i të dhënave në lidhje me klientët e tij.",
      },
      {
        h: "2. Të dhënat e mbledhura",
        p: "Llogaria e garazhit: emri, adresa, numri i telefonit, adresa e emailit, gjuha, logoja. Llogaritë e përdoruesit: emri, adresa e emailit, roli. Formularët e pranimit të automjetit: emri, numri i telefonit, adresa e emailit e klientit përfundimtar, numri i regjistrimit, kilometrazhi, fotot e automjetit, foto e dokumentit të regjistrimit (certifikata e regjistrimit të automjetit), nënshkrimi me dorë, dëmtimet dhe punët e shënuara — këto informacione, veçanërisht fotoja e dokumentit të regjistrimit, përbëjnë të dhëna personale në kuptimin e GDPR/nLPD.",
      },
      {
        h: "3. Qëllimet",
        p: "Këto të dhëna përpunohen për qëllimet e mëposhtme: për të ofruar shërbimin e mbledhjes së automjetit (raport të përbashkët mbi gjendjen e automjetit), për të gjeneruar dhe dërguar dokumentin PDF tek klienti përfundimtar, për të menaxhuar llogaritë dhe abonimet, dhe për të siguruar sigurinë e shërbimit.",
      },
      {
        h: "4. Baza ligjore",
        p: "Zbatimi i kontratës midis garazhit dhe klientit të tij përfundimtar (raporti i dorëzimit), interesi legjitim i garazhit (mbrojtja në rast mosmarrëveshjeje), dhe, për Botuesin, zbatimi i kontratës së lidhur me garazhin.",
      },
      {
        h: "5. Konservimi",
        p: "Regjistrimet e shërbimit (dhe skedarët e lidhur, përfshirë fotot dhe PDF-të) ruhen për periudhën e zgjedhur nga çdo garazh (30 ditë si parazgjedhje, 12 muaj si opsion), pas së cilës fshihen automatikisht dhe përhershëm. Të dhënat e llogarisë ruhen për sa kohë llogaria mbetet aktive.",
      },
      {
        h: "6. Pritësit dhe nënkontraktorët",
        p: "Të dhënat hostosen dhe përpunohen nga Supabase (bazë të dhënash dhe ruajtje skedarësh) dhe Vercel (hosting i aplikacionit), si dhe nga ofruesit e shërbimeve të dërgimit të postës elektronike dhe pagesave të përdorura nga Shërbimi (Resend, Stripe). Serverat e Supabase ndodhen në Irlandë (BE) dhe ata të Vercel në Frankfurt (Gjermani).",
      },
      {
        h: "7. Të drejtat individuale",
        p: "Çdo subjekt i të dhënave (klienti përfundimtar i garazhit ose përdoruesi i Shërbimit) mund të ushtrojë të drejtat e tij/saj të qasjes, korrigjimit, fshirjes dhe kundërshtimit duke kontaktuar garazhin në fjalë (i cili vepron si kontrollues i të dhënave për klientët e tij) ose Botuesin për të dhënat e llogarisë, në info@receptcar.com.",
      },
      {
        h: "8. Siguria",
        p: "Shërbimi zbaton masa teknike të sigurisë: izolim të rreptë të të dhënave midis garazheve (kontroll i aksesit në nivelin e bazës së të dhënave), ruajtje të skedarëve në një hapësirë private me akses të përkohshëm, të kufizuar në kohë, dhe enkriptim të komunikimeve (HTTPS).",
      },
      {
        h: "9. Kontakt",
        p: "Nëse keni ndonjë pyetje në lidhje me këtë politikë ose dëshironi të ushtroni të drejtat tuaja, ju lutemi na kontaktoni në: info@receptcar.com.",
      },
    ],
  },
  el: {
    title: "Πολιτική απορρήτου",
    updated: "Τελευταία ενημέρωση: 21 Οκτωβρίου 2026",
    sections: [
      {
        h: "1. Ποιος επεξεργάζεται τα δεδομένα σας",
        p: "Το ReceptCar εκδίδεται από τον André Da Silva, ατομική επιχείρηση, Route du Stand 41, 1163 Étoy (Ελβετία), επικοινωνία: info@receptcar.com. Όσον αφορά τα δεδομένα που καταχωρούν τα συνεργεία-πελάτες (πληροφορίες σχετικά με τους δικούς τους πελάτες), ο Εκδότης ενεργεί ως εκτελών την επεξεργασία κατά την έννοια του ΓΚΠΔ (Κανονισμός ΕΕ 2016/679) και του ελβετικού νόμου περί προστασίας δεδομένων (nLPD)· το συνεργείο παραμένει υπεύθυνο για την επεξεργασία έναντι των δικών του πελατών.",
      },
      {
        h: "2. Συλλεγόμενα δεδομένα",
        p: "Λογαριασμός συνεργείου: όνομα, διεύθυνση, τηλέφωνο, e-mail, γλώσσα, λογότυπο. Λογαριασμοί χρηστών: όνομα, e-mail, ρόλος. Φύλλα παραλαβής: όνομα, τηλέφωνο, e-mail του τελικού πελάτη, αριθμός κυκλοφορίας, χιλιόμετρα, φωτογραφίες του οχήματος, φωτογραφία του πιστοποιητικού κυκλοφορίας (κάρτα κυκλοφορίας), χειρόγραφη υπογραφή, διαπιστωμένες ζημιές και εργασίες — αυτές οι πληροφορίες, ιδίως η φωτογραφία του πιστοποιητικού κυκλοφορίας, αποτελούν προσωπικά δεδομένα κατά την έννοια του ΓΚΠΔ/του nLPD.",
      },
      {
        h: "3. Σκοποί",
        p: "Τα δεδομένα αυτά υποβάλλονται σε επεξεργασία με σκοπό: την παροχή της υπηρεσίας παραλαβής οχήματος (αμφισβητούμενη κατάσταση του οχήματος), τη δημιουργία και αποστολή του εγγράφου PDF στον τελικό πελάτη, τη διαχείριση λογαριασμών και συνδρομών, καθώς και τη διασφάλιση της ασφάλειας της υπηρεσίας.",
      },
      {
        h: "4. Νομική βάση",
        p: "Εκτέλεση της σύμβασης που έχει συναφθεί μεταξύ του συνεργείου και του τελικού πελάτη του (πρακτικό παράδοσης), έννομο συμφέρον του συνεργείου (προστασία σε περίπτωση διαφοράς) και, όσον αφορά τον Εκδότη, εκτέλεση της σύμβασης που έχει συναφθεί με το συνεργείο.",
      },
      {
        h: "5. Διατήρηση",
        p: "Τα δελτία παραλαβής (και τα σχετικά αρχεία, συμπεριλαμβανομένων φωτογραφιών και αρχείων PDF) διατηρούνται για το χρονικό διάστημα που επιλέγει κάθε συνεργείο (30 ημέρες από προεπιλογή, 12 μήνες προαιρετικά) και στη συνέχεια διαγράφονται αυτόματα και οριστικά. Τα δεδομένα του λογαριασμού διατηρούνται για όσο διάστημα ο λογαριασμός παραμένει ενεργός.",
      },
      {
        h: "6. Φιλοξενία και εξωτερικοί συνεργάτες",
        p: "Τα δεδομένα φιλοξενούνται και υποβάλλονται σε επεξεργασία από την Supabase (βάση δεδομένων και αποθήκευση αρχείων) και την Vercel (φιλοξενία της εφαρμογής), καθώς και από τους πάροχους υπηρεσιών αποστολής ηλεκτρονικού ταχυδρομείου και πληρωμών που χρησιμοποιεί η Υπηρεσία (Resend, Stripe). Οι διακομιστές της Supabase βρίσκονται στην Ιρλανδία (ΕΕ) και της Vercel στη Φρανκφούρτη (Γερμανία).",
      },
      {
        h: "7. Δικαιώματα των ατόμων",
        p: "Κάθε ενδιαφερόμενο πρόσωπο (τελικός πελάτης ενός συνεργείου ή χρήστης της Υπηρεσίας) μπορεί να ασκήσει τα δικαιώματά του όσον αφορά την πρόσβαση, τη διόρθωση, τη διαγραφή και την αντίρρηση, απευθυνόμενο στο σχετικό συνεργείο (υπεύθυνο επεξεργασίας για τους δικούς του πελάτες) ή στον Εκδότη για τα δεδομένα του λογαριασμού, στη διεύθυνση info@receptcar.com.",
      },
      {
        h: "8. Ασφάλεια",
        p: "Η Υπηρεσία εφαρμόζει τεχνικά μέτρα ασφαλείας: αυστηρό διαχωρισμό των δεδομένων μεταξύ συνεργείων (έλεγχος πρόσβασης σε επίπεδο βάσης δεδομένων), αποθήκευση αρχείων σε ιδιωτικό χώρο με προσωρινή πρόσβαση περιορισμένη χρονικά, κρυπτογράφηση των επικοινωνιών (HTTPS).",
      },
      {
        h: "9. Επικοινωνία",
        p: "Για οποιαδήποτε ερώτηση σχετικά με την παρούσα πολιτική ή για να ασκήσετε τα δικαιώματά σας: info@receptcar.com.",
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    updated: "Последнее обновление: 21 октября 2026 г.",
    sections: [
      {
        h: "1. Кто обрабатывает ваши данные",
        p: "Издателем ReceptCar является André Da Silva (индивидуальное предприятие), Route du Stand 41, 1163 Étoy (Швейцария), контакт: info@receptcar.com. В отношении данных, вводимых автосервисами-клиентами (информация об их собственных клиентах), издатель выступает в качестве обработчика данных в понимании Общего регламента по защите данных (Регламент ЕС 2016/679) и швейцарского закона о защите данных (nLPD); автосервис остается ответственным за обработку данных в отношении своих собственных клиентов.",
      },
      {
        h: "2. Собранные данные",
        p: "Учетная запись автосервиса: название, адрес, телефон, электронная почта, язык, логотип. Учетные записи пользователей: имя, электронная почта, роль. Формы приёма: имя, телефон, электронная почта конечного клиента, номерной знак, пробег, фотографии транспортного средства, фотография регистрационного документа (техпаспорт), рукописная подпись, выявленные повреждения и работы — эта информация, в частности фотография регистрационного документа, представляет собой персональные данные в понимании Общего регламента по защите данных (RGPD) и нового закона о защите данных (nLPD).",
      },
      {
        h: "3. Цели",
        p: "Эти данные обрабатываются в следующих целях: предоставление услуги по приему транспортного средства (составление совместного акта об осмотре транспортного средства), формирование и отправка документа в формате PDF конечному клиенту, управление счетами и подписками, обеспечение безопасности услуги.",
      },
      {
        h: "4. Правовая основа",
        p: "Выполнение договора, заключенного между автосервисом и его конечным клиентом (акт приёма), законные интересы автосервиса (защита в случае спора), а также, со стороны издателя, выполнение договора, заключенного с автосервисом.",
      },
      {
        h: "5. Сохранение",
        p: "Акты приемки (и сопутствующие файлы, включая фотографии и PDF-файл) хранятся в течение срока, выбранного каждой автомастерской (по умолчанию — 30 дней, по выбору — 12 месяцев), после чего автоматически и окончательно удаляются. Данные учетной записи хранятся до тех пор, пока учетная запись остается активной.",
      },
      {
        h: "6. Хостинг и субподрядчики",
        p: "Данные хранятся и обрабатываются компаниями Supabase (база данных и хранилище файлов) и Vercel (хостинг приложения), а также поставщиками услуг рассылки электронной почты и обработки платежей, используемыми Сервисом (Resend, Stripe). Серверы Supabase расположены в Ирландии (ЕС), а серверы Vercel — во Франкфурте (Германия).",
      },
      {
        h: "7. Права человека",
        p: "Любое заинтересованное лицо (конечный клиент автосервиса или пользователь Сервиса) может реализовать свои права на доступ, исправление, удаление и возражение, обратившись в соответствующий автосервис (ответственный за обработку данных своих клиентов) или к Издателю в отношении данных учетной записи по адресу info@receptcar.com.",
      },
      {
        h: "8. Безопасность",
        p: "Служба применяет технические меры безопасности: строгое разделение данных между автосервисами (контроль доступа на уровне базы данных), хранение файлов в закрытом пространстве с временным доступом, ограниченным по времени, шифрование передачи данных (HTTPS).",
      },
      {
        h: "9. Контакты",
        p: "По любым вопросам, касающимся данной политики, или для реализации ваших прав: info@receptcar.com.",
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

      <div className="flex flex-col gap-6">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-1 text-base font-semibold">{s.h}</h2>
            <p className="text-sm text-neutral-700">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex gap-4 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <Link href="/terms" className="underline">
          {{
            fr: "Conditions d'utilisation",
            en: "Terms of Use",
            es: "Condiciones de uso",
            pt: "Termos de utilização",
            de: "Nutzungsbedingungen",
            it: "Termini di utilizzo",
            sq: "Kushtet e Përdorimit",
            el: "Όροι χρήσης",
            ru: "Условия использования",
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
