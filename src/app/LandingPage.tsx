"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Camera, FileText, Repeat, Globe2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { InstallAppButton } from "@/components/InstallAppButton";
import { ContactForm } from "@/components/ContactForm";
import { Lang } from "@/lib/receptions/i18n";

const CONTENT: Record<
  Lang,
  {
    heroTitle: string;
    heroSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    demoTitle: string;
    demoSubtitle: string;
    features: { icon: "camera" | "pdf" | "repeat" | "globe"; title: string; body: string }[];
    installTitle: string;
    installSubtitle: string;
    installLabel: string;
    installedLabel: string;
    iosInstructions: string;
    contactTitle: string;
    contactSubtitle: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    sendLabel: string;
    successLabel: string;
    missingFieldsError: string;
    genericError: string;
    terms: string;
    privacy: string;
    rights: string;
  }
> = {
  fr: {
    heroTitle: "ReceptCar — la réception véhicule digitale pour votre garage",
    heroSubtitle:
      "Fiches de réception et dépôt-vente en quelques minutes : photos, dommages, signature client et PDF automatique. Essai gratuit de 30 jours, sans engagement.",
    ctaPrimary: "Essayer gratuitement",
    ctaSecondary: "Se connecter",
    demoTitle: "Voir ReceptCar en vidéo",
    demoSubtitle: "Un aperçu rapide de l'application, en conditions réelles.",
    features: [
      {
        icon: "camera",
        title: "Réception rapide",
        body: "Photos, dommages, kilométrage et signature du client en quelques clics, sur mobile ou tablette.",
      },
      {
        icon: "pdf",
        title: "PDF automatique",
        body: "Un document professionnel généré et envoyé par e-mail instantanément au client.",
      },
      {
        icon: "repeat",
        title: "Dépôt-vente intégré",
        body: "Gérez aussi vos dossiers de dépôt-vente, avec contrat et suivi dédiés.",
      },
      {
        icon: "globe",
        title: "Multi-garage et multi-langue",
        body: "Une équipe, plusieurs garages, dans la langue de chaque client.",
      },
    ],
    installTitle: "Installez ReceptCar sur votre téléphone",
    installSubtitle: "Accédez à l'application comme une app native, en un geste, sur Android et iPhone.",
    installLabel: "Installer l'application",
    installedLabel: "Application installée",
    iosInstructions: "Sur iPhone : appuyez sur Partager, puis « Sur l'écran d'accueil ».",
    contactTitle: "Une question ?",
    contactSubtitle: "Écrivez-nous, nous vous répondons rapidement.",
    nameLabel: "Votre nom",
    emailLabel: "Votre e-mail",
    messageLabel: "Votre message",
    sendLabel: "Envoyer",
    successLabel: "Message envoyé. Merci, nous vous répondons rapidement.",
    missingFieldsError: "Merci de remplir tous les champs.",
    genericError: "Une erreur est survenue, réessayez.",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    rights: "Tous droits réservés.",
  },
  en: {
    heroTitle: "ReceptCar — the digital vehicle check-in system for your garage",
    heroSubtitle:
      "Create handover and consignment forms in just a few minutes: photos, damage details, customer signature and an automatic PDF. 30-day free trial, with no obligation.",
    ctaPrimary: "Try it for free",
    ctaSecondary: "Log in",
    demoTitle: "Watch the ReceptCar video",
    demoSubtitle: "A quick look at the app in real-world conditions.",
    features: [
      {
        icon: "camera",
        title: "Fast vehicle check-in",
        body: "Photos, damage reports, mileage and the customer's signature in just a few clicks, on a mobile or tablet.",
      },
      {
        icon: "pdf",
        title: "Automatic PDF",
        body: "A professional document generated and emailed to the client instantly.",
      },
      {
        icon: "repeat",
        title: "Integrated consignment shop",
        body: "You can also manage your consignment sales, with dedicated contracts and tracking.",
      },
      {
        icon: "globe",
        title: "Multi-garage and multilingual",
        body: "One team, several garages, in each customer's own language.",
      },
    ],
    installTitle: "Install ReceptCar on your phone",
    installSubtitle: "Access the app just like a native app, with a single tap, on Android and iPhone.",
    installLabel: "Install the app",
    installedLabel: "App installed",
    iosInstructions: "On an iPhone: tap Share, then 'To Home Screen'.",
    contactTitle: "Any questions?",
    contactSubtitle: "Please get in touch – we'll reply promptly.",
    nameLabel: "Your name",
    emailLabel: "Your email address",
    messageLabel: "Your message",
    sendLabel: "Send",
    successLabel: "Message sent. Thank you; we'll get back to you shortly.",
    missingFieldsError: "Please complete all the fields.",
    genericError: "An error has occurred. Please try again.",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    rights: "All rights reserved.",
  },
  es: {
    heroTitle: "ReceptCar: el sistema digital de recepción de vehículos para tu taller",
    heroSubtitle:
      "Fichas de recepción y venta en consignación en unos minutos: fotos, daños, firma del cliente y PDF automático. Prueba gratuita de 30 días, sin compromiso.",
    ctaPrimary: "Probarlo gratis",
    ctaSecondary: "Iniciar sesión",
    demoTitle: "Ver el vídeo de ReceptCar",
    demoSubtitle: "Una breve visión general de la aplicación, en condiciones reales.",
    features: [
      {
        icon: "camera",
        title: "Recepción rápida",
        body: "Fotos, daños, kilometraje y firma del cliente en unos pocos clics, desde el móvil o la tableta.",
      },
      {
        icon: "pdf",
        title: "PDF automático",
        body: "Un documento profesional generado y enviado por correo electrónico al cliente de forma inmediata.",
      },
      {
        icon: "repeat",
        title: "Venta en consignación integrada",
        body: "Gestiona también tus expedientes de venta en consignación, con contrato y seguimiento específicos.",
      },
      {
        icon: "globe",
        title: "Varios talleres y varios idiomas",
        body: "Un equipo, varios talleres, en el idioma de cada cliente.",
      },
    ],
    installTitle: "Instala ReceptCar en tu móvil",
    installSubtitle: "Accede a la aplicación como si fuera una aplicación nativa, con un solo gesto, tanto en Android como en iPhone.",
    installLabel: "Instalar la aplicación",
    installedLabel: "Aplicación instalada",
    iosInstructions: "En el iPhone: pulsa «Compartir» y, a continuación, «En la pantalla de inicio».",
    contactTitle: "¿Alguna pregunta?",
    contactSubtitle: "Escríbenos, te responderemos enseguida.",
    nameLabel: "Tu nombre",
    emailLabel: "Tu correo electrónico",
    messageLabel: "Tu mensaje",
    sendLabel: "Enviar",
    successLabel: "Mensaje enviado. Gracias, te responderemos en breve.",
    missingFieldsError: "Por favor, rellena todos los campos.",
    genericError: "Se ha producido un error. Inténtalo de nuevo.",
    terms: "Condiciones de uso",
    privacy: "Política de privacidad",
    rights: "Todos los derechos reservados.",
  },
  pt: {
    heroTitle: "ReceptCar — o sistema digital de receção de veículos para a sua oficina",
    heroSubtitle:
      "Fichas de receção e consignação em poucos minutos: fotografias, danos, assinatura do cliente e PDF automático. Teste gratuito de 30 dias, sem compromisso.",
    ctaPrimary: "Experimentar gratuitamente",
    ctaSecondary: "Iniciar sessão",
    demoTitle: "Veja o vídeo do ReceptCar",
    demoSubtitle: "Uma visão geral rápida da aplicação, em condições reais.",
    features: [
      {
        icon: "camera",
        title: "Receção rápida",
        body: "Fotografias, danos, quilometragem e assinatura do cliente com apenas alguns cliques, no telemóvel ou no tablet.",
      },
      {
        icon: "pdf",
        title: "PDF automático",
        body: "Um documento profissional gerado e enviado por e-mail instantaneamente ao cliente.",
      },
      {
        icon: "repeat",
        title: "Venda em consignação integrada",
        body: "Faça também a gestão dos seus processos de consignação, com contrato e acompanhamento específicos.",
      },
      {
        icon: "globe",
        title: "Compatível com várias garagens e vários idiomas",
        body: "Uma equipa, várias oficinas, na língua de cada cliente.",
      },
    ],
    installTitle: "Instale o ReceptCar no seu telemóvel",
    installSubtitle: "Aceda à aplicação como se fosse uma aplicação nativa, com um simples toque, no Android e no iPhone.",
    installLabel: "Instalar a aplicação",
    installedLabel: "Aplicação instalada",
    iosInstructions: "No iPhone: toque em «Partilhar» e, em seguida, em «No ecrã inicial».",
    contactTitle: "Tem alguma pergunta?",
    contactSubtitle: "Escreva-nos, responderemos rapidamente.",
    nameLabel: "O seu nome",
    emailLabel: "O seu e-mail",
    messageLabel: "A sua mensagem",
    sendLabel: "Enviar",
    successLabel: "Mensagem enviada. Obrigado, responderemos em breve.",
    missingFieldsError: "Por favor, preencha todos os campos.",
    genericError: "Ocorreu um erro. Por favor, tente novamente.",
    terms: "Condições de utilização",
    privacy: "Política de Privacidade",
    rights: "Todos os direitos reservados.",
  },
  de: {
    heroTitle: "ReceptCar – die digitale Fahrzeugannahme für Ihre Werkstatt",
    heroSubtitle:
      "Annahme- und Kommissionsformulare in wenigen Minuten: Fotos, Schäden, Unterschrift des Kunden und automatische PDF-Erstellung. 30 Tage kostenlos und unverbindlich testen.",
    ctaPrimary: "Kostenlos testen",
    ctaSecondary: "Anmelden",
    demoTitle: "Sehen Sie sich das Video zu ReceptCar an",
    demoSubtitle: "Ein kurzer Einblick in die Anwendung unter realen Bedingungen.",
    features: [
      {
        icon: "camera",
        title: "Schnelle Fahrzeugannahme",
        body: "Fotos, Schäden, Kilometerstand und Unterschrift des Kunden mit wenigen Klicks – auf dem Smartphone oder Tablet.",
      },
      {
        icon: "pdf",
        title: "Automatische PDF-Erstellung",
        body: "Ein professionelles Dokument, das erstellt und sofort per E-Mail an den Kunden gesendet wird.",
      },
      {
        icon: "repeat",
        title: "Integrierter Kommissionsverkauf",
        body: "Verwalten Sie auch Ihre Kommissionsverkäufe mit einem eigenen Vertrag und einer speziellen Nachverfolgung.",
      },
      {
        icon: "globe",
        title: "Für mehrere Garagen und mehrere Sprachen",
        body: "Ein Team, mehrere Werkstätten – in der Sprache jedes Kunden.",
      },
    ],
    installTitle: "Installieren Sie ReceptCar auf Ihrem Smartphone",
    installSubtitle: "Rufen Sie die Anwendung wie eine native App mit nur einem Fingertipp auf Android- und iPhone-Geräten auf.",
    installLabel: "Die App installieren",
    installedLabel: "App installiert",
    iosInstructions: "Auf dem iPhone: Tippen Sie auf „Teilen“ und anschließend auf „Auf dem Startbildschirm“.",
    contactTitle: "Hast du eine Frage?",
    contactSubtitle: "Schreiben Sie uns, wir antworten Ihnen umgehend.",
    nameLabel: "Ihr Name",
    emailLabel: "Ihre E-Mail-Adresse",
    messageLabel: "Ihre Nachricht",
    sendLabel: "Senden",
    successLabel: "Nachricht gesendet. Vielen Dank, wir melden uns umgehend bei Ihnen.",
    missingFieldsError: "Bitte füllen Sie alle Felder aus.",
    genericError: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzerklärung",
    rights: "Alle Rechte vorbehalten.",
  },
  it: {
    heroTitle: "ReceptCar — il sistema digitale di registrazione dei veicoli per la tua officina",
    heroSubtitle:
      "Schede di presa in consegna e vendita in conto deposito in pochi minuti: foto, danni, firma del cliente e PDF generato automaticamente. Prova gratuita di 30 giorni, senza impegno.",
    ctaPrimary: "Prova gratis",
    ctaSecondary: "Accedi",
    demoTitle: "Guarda il video su ReceptCar",
    demoSubtitle: "Una rapida panoramica dell'applicazione, in condizioni reali.",
    features: [
      {
        icon: "camera",
        title: "Accettazione rapida",
        body: "Foto, danni, chilometraggio e firma del cliente in pochi clic, su cellulare o tablet.",
      },
      {
        icon: "pdf",
        title: "PDF automatico",
        body: "Un documento professionale generato e inviato immediatamente via e-mail al cliente.",
      },
      {
        icon: "repeat",
        title: "Vendita in conto deposito integrata",
        body: "Gestisci anche le tue pratiche di vendita in conto deposito, con contratto e monitoraggio dedicati.",
      },
      {
        icon: "globe",
        title: "Multigarage e multilingue",
        body: "Un unico team, diverse officine, nella lingua di ogni cliente.",
      },
    ],
    installTitle: "Installa ReceptCar sul tuo telefono",
    installSubtitle: "Accedi all'applicazione come se fosse un'app nativa, con un solo gesto, su Android e iPhone.",
    installLabel: "Installare l'applicazione",
    installedLabel: "Applicazione installata",
    iosInstructions: "Su iPhone: tocca Condividi, quindi \"Sulla schermata Home\".",
    contactTitle: "Hai qualche domanda?",
    contactSubtitle: "Scriveteci, vi risponderemo al più presto.",
    nameLabel: "Il tuo nome",
    emailLabel: "La tua e-mail",
    messageLabel: "Il tuo messaggio",
    sendLabel: "Invia",
    successLabel: "Messaggio inviato. Grazie, le risponderemo al più presto.",
    missingFieldsError: "Si prega di compilare tutti i campi.",
    genericError: "Si è verificato un errore, riprovare.",
    terms: "Condizioni d'uso",
    privacy: "Informativa sulla privacy",
    rights: "Tutti i diritti riservati.",
  },
  sq: {
    heroTitle: "ReceptCar — sistemi dixhital i regjistrimit të automjeteve për garazhin tuaj",
    heroSubtitle:
      "Krijoni formularë për dorëzim dhe dërgesë në vetëm disa minuta: foto, detaje të dëmtimit, nënshkrimi i klientit dhe një PDF automatik. Provë falas 30-ditore, pa asnjë detyrim.",
    ctaPrimary: "Provoje falas",
    ctaSecondary: "Hyni",
    demoTitle: "Shiko videon e ReceptCar",
    demoSubtitle: "Një vështrim i shpejtë i aplikacionit në kushte reale.",
    features: [
      {
        icon: "camera",
        title: "Pranim i shpejtë",
        body: "Foto, raporte dëmtimesh, kilometrazhi dhe nënshkrimi i klientit me vetëm disa klikime, në celular ose tabletë.",
      },
      {
        icon: "pdf",
        title: "PDF automatik",
        body: "Një dokument profesional i gjeneruar dhe i dërguar me email klientit menjëherë.",
      },
      {
        icon: "repeat",
        title: "Dyqan i integruar i mallrave me komision",
        body: "Ju gjithashtu mund të menaxhoni shitjet me komision, me kontrata të dedikuara dhe gjurmim.",
      },
      {
        icon: "globe",
        title: "Me garazh të shumëfishtë dhe shumëgjuhësh",
        body: "Një ekip, disa garazhe, në gjuhën e çdo klienti.",
      },
    ],
    installTitle: "Instaloni ReceptCar në telefonin tuaj",
    installSubtitle: "Hapni aplikacionin ashtu si një aplikacion vendas, me një prekje të vetme, në Android dhe iPhone.",
    installLabel: "Instaloni aplikacionin",
    installedLabel: "Aplikacioni është instaluar",
    iosInstructions: "Në një iPhone: prek Ndaj, pastaj 'Në ekranin kryesor'.",
    contactTitle: "A keni ndonjë pyetje?",
    contactSubtitle: "Ju lutemi na kontaktoni – do t'ju përgjigjemi menjëherë.",
    nameLabel: "Emri yt",
    emailLabel: "Adresa juaj e emailit",
    messageLabel: "Mesazhi juaj",
    sendLabel: "Dërgo",
    successLabel: "Mesazhi u dërgua. Faleminderit; do t'ju kontaktojmë së shpejti.",
    missingFieldsError: "Ju lutem plotësoni të gjitha fushat.",
    genericError: "Ka ndodhur një gabim. Ju lutemi provoni përsëri.",
    terms: "Kushtet e Përdorimit",
    privacy: "Politika e Privatësisë",
    rights: "Të gjitha të drejtat e rezervuara.",
  },
  el: {
    heroTitle: "ReceptCar — η ψηφιακή υπηρεσία παραλαβής οχημάτων για το συνεργείο σας",
    heroSubtitle:
      "Φόρμες παραλαβής και πώλησης σε λίγα λεπτά: φωτογραφίες, ζημιές, υπογραφή πελάτη και αυτόματη δημιουργία αρχείου PDF. Δωρεάν δοκιμή 30 ημερών, χωρίς δέσμευση.",
    ctaPrimary: "Δοκιμάστε το δωρεάν",
    ctaSecondary: "Σύνδεση",
    demoTitle: "Δείτε το ReceptCar σε βίντεο",
    demoSubtitle: "Μια γρήγορη επισκόπηση της εφαρμογής, σε πραγματικές συνθήκες.",
    features: [
      {
        icon: "camera",
        title: "Γρήγορη παραλαβή",
        body: "Φωτογραφίες, ζημιές, χιλιόμετρα και υπογραφή του πελάτη με λίγα κλικ, από κινητό ή tablet.",
      },
      {
        icon: "pdf",
        title: "Αυτόματη δημιουργία PDF",
        body: "Ένα επαγγελματικό έγγραφο που δημιουργείται και αποστέλλεται αμέσως μέσω ηλεκτρονικού ταχυδρομείου στον πελάτη.",
      },
      {
        icon: "repeat",
        title: "Ενσωματωμένο κατάστημα πώλησης με προμήθεια",
        body: "Διαχειριστείτε επίσης τις υποθέσεις σας με πώληση σε προμήθεια, με ειδικό συμβόλαιο και παρακολούθηση.",
      },
      {
        icon: "globe",
        title: "Πολλαπλά γκαράζ και πολλές γλώσσες",
        body: "Μια ομάδα, πολλά συνεργεία, στη γλώσσα του κάθε πελάτη.",
      },
    ],
    installTitle: "Εγκαταστήστε το ReceptCar στο κινητό σας",
    installSubtitle: "Αποκτήστε πρόσβαση στην εφαρμογή σαν να ήταν εγγενής εφαρμογή, με μία κίνηση, σε Android και iPhone.",
    installLabel: "Εγκατάσταση της εφαρμογής",
    installedLabel: "Εγκατεστημένη εφαρμογή",
    iosInstructions: "Στο iPhone: πατήστε «Κοινή χρήση» και, στη συνέχεια, «Στην αρχική οθόνη».",
    contactTitle: "Έχετε κάποια ερώτηση;",
    contactSubtitle: "Γράψτε μας, θα σας απαντήσουμε άμεσα.",
    nameLabel: "Το όνομά σας",
    emailLabel: "Το email σας",
    messageLabel: "Το μήνυμά σας",
    sendLabel: "Αποστολή",
    successLabel: "Το μήνυμα απεστάλη. Ευχαριστούμε, θα σας απαντήσουμε σύντομα.",
    missingFieldsError: "Παρακαλούμε συμπληρώστε όλα τα πεδία.",
    genericError: "Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.",
    terms: "Όροι χρήσης",
    privacy: "Πολιτική απορρήτου",
    rights: "Όλα τα δικαιώματα διατηρούνται.",
  },
  ru: {
    heroTitle: "ReceptCar — цифровая система регистрации автомобилей для вашего автосервиса",
    heroSubtitle:
      "Оформление приёма и комиссионной продажи за считанные минуты: фотографии, описание повреждений, подпись клиента и автоматическое создание PDF-файла. Бесплатная 30-дневная пробная версия без каких-либо обязательств.",
    ctaPrimary: "Попробовать бесплатно",
    ctaSecondary: "Войти",
    demoTitle: "Посмотреть видео о ReceptCar",
    demoSubtitle: "Краткий обзор приложения в реальных условиях.",
    features: [
      {
        icon: "camera",
        title: "Быстрый приём",
        body: "Фотографии, повреждения, пробег и подпись клиента — всего за несколько кликов на мобильном телефоне или планшете.",
      },
      {
        icon: "pdf",
        title: "Автоматическое создание PDF-файлов",
        body: "Профессиональный документ, сгенерированный и мгновенно отправленный клиенту по электронной почте.",
      },
      {
        icon: "repeat",
        title: "Встроенная комиссионная торговля",
        body: "Управляйте также своими делами по комиссионной продаже с помощью специальных договоров и системы отслеживания.",
      },
      {
        icon: "globe",
        title: "Многофункциональный гараж и поддержка нескольких языков",
        body: "Одна команда, несколько автосервисов — на языке каждого клиента.",
      },
    ],
    installTitle: "Установите приложение ReceptCar на свой телефон",
    installSubtitle: "Запускайте приложение как нативное приложение одним движением на Android и iPhone.",
    installLabel: "Установить приложение",
    installedLabel: "Приложение установлено",
    iosInstructions: "На iPhone: нажмите «Поделиться», а затем «На главный экран».",
    contactTitle: "Есть вопросы?",
    contactSubtitle: "Напишите нам — мы быстро ответим.",
    nameLabel: "Ваше имя",
    emailLabel: "Ваш адрес электронной почты",
    messageLabel: "Ваше сообщение",
    sendLabel: "Отправить",
    successLabel: "Сообщение отправлено. Спасибо, мы ответим вам в ближайшее время.",
    missingFieldsError: "Пожалуйста, заполните все поля.",
    genericError: "Произошла ошибка. Попробуйте ещё раз.",
    terms: "Условия использования",
    privacy: "Политика конфиденциальности",
    rights: "Все права защищены.",
  },
};

const ICONS = { camera: Camera, pdf: FileText, repeat: Repeat, globe: Globe2 };

export function LandingPage({ appLocale }: { appLocale: Lang }) {
  const [lang, setLang] = useState<Lang>(appLocale);
  const c = CONTENT[lang];

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-10">
      <div className="mb-10 flex items-center justify-between">
        <Image src="/logo.png" alt="ReceptCar" width={36} height={36} className="rounded-lg" />
        <LanguageSwitcher value={lang} onChange={setLang} />
      </div>

      <section className="text-center">
        <h1 className="mx-auto max-w-xl text-2xl font-semibold text-balance sm:text-3xl">
          {c.heroTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-neutral-600 sm:text-base">
          {c.heroSubtitle}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="btn-primary w-full sm:w-auto">
            {c.ctaPrimary}
          </Link>
          <Link href="/login" className="btn-secondary w-full sm:w-auto">
            {c.ctaSecondary}
          </Link>
        </div>
      </section>

      <section className="mt-16 flex flex-col items-center gap-3 text-center">
        <h2 className="text-lg font-semibold">{c.demoTitle}</h2>
        <p className="max-w-sm text-sm text-neutral-600">{c.demoSubtitle}</p>
        <video
          className="mt-2 w-full max-w-xs rounded-2xl border border-neutral-200 shadow-sm"
          src="/demo.mp4"
          poster="/demo-poster.jpg"
          controls
          playsInline
          preload="metadata"
        />
      </section>

      <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {c.features.map((f) => {
          const Icon = ICONS[f.icon];
          return (
            <div key={f.title} className="rounded-2xl border border-neutral-200 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent-strong">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-sm font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-neutral-600">{f.body}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-16 flex flex-col items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-8 text-center">
        <h2 className="text-lg font-semibold">{c.installTitle}</h2>
        <p className="max-w-sm text-sm text-neutral-600">{c.installSubtitle}</p>
        <div className="mt-2">
          <InstallAppButton
            installLabel={c.installLabel}
            installedLabel={c.installedLabel}
            iosInstructions={c.iosInstructions}
          />
        </div>
      </section>

      <section className="mt-16 flex flex-col items-center gap-3 text-center">
        <h2 className="text-lg font-semibold">{c.contactTitle}</h2>
        <p className="max-w-sm text-sm text-neutral-600">{c.contactSubtitle}</p>
        <div className="mt-2 flex w-full justify-center">
          <ContactForm
            nameLabel={c.nameLabel}
            emailLabel={c.emailLabel}
            messageLabel={c.messageLabel}
            sendLabel={c.sendLabel}
            successLabel={c.successLabel}
            missingFieldsError={c.missingFieldsError}
            genericError={c.genericError}
          />
        </div>
      </section>

      <footer className="mt-16 flex flex-col items-center gap-2 pb-4 text-xs text-neutral-400">
        <div className="flex gap-4">
          <Link href="/terms" className="underline">
            {c.terms}
          </Link>
          <Link href="/privacy" className="underline">
            {c.privacy}
          </Link>
        </div>
        <p>
          ReceptCar · {c.rights}
        </p>
      </footer>
    </main>
  );
}
