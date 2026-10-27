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
    title: "Cookies",
    updated: "Dernière mise à jour : 27 octobre 2026",
    sections: [
      {
        h: "1. Pourquoi il n'y a pas de bannière de consentement",
        p: "Ce site n'utilise aucun cookie publicitaire, aucun outil de mesure d'audience (type Google Analytics) et aucun pixel de réseau social. Tous les cookies et les données de stockage local décrits ci-dessous sont strictement nécessaires au fonctionnement du Service (connexion, langue, sécurité de session) : ils sont donc exemptés de consentement, aussi bien au sens de la loi fédérale suisse sur la protection des données (nLPD) que du Règlement général européen sur la protection des données (RGPD).",
      },
      {
        h: "sb-*-auth-token",
        p: "Fournisseur : Supabase (hébergement de la base de données et de l'authentification). Finalité : garder votre session ouverte après connexion. Durée : jusqu'à la déconnexion ou l'expiration de la session.",
      },
      {
        h: "sb_last_activity",
        p: "Fournisseur : ReceptCar. Finalité : détecter l'inactivité pour vous déconnecter automatiquement après 2 heures sans activité. Durée de conservation du cookie : jusqu'à 30 jours, renouvelé à chaque action et supprimé à la déconnexion.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Fournisseur : ReceptCar. Finalité : mémoriser la langue que vous avez choisie. Durée : 1 an.",
      },
      {
        h: "Brouillon de fiche de réception",
        p: "Ce n'est techniquement pas un cookie, mais une donnée de stockage local (localStorage) qui reste uniquement sur votre appareil et n'est jamais transmise à nos serveurs. Fournisseur : ReceptCar. Finalité : ne pas perdre une fiche de réception en cours de saisie en cas de fermeture accidentelle de l'onglet. Durée : supprimée automatiquement après 24 heures, ou dès l'envoi de la fiche.",
      },
      {
        h: "Vos choix",
        p: "Aucune action n'est nécessaire de votre part : ces éléments sont indispensables au fonctionnement du Service et ne peuvent pas être désactivés sans empêcher la connexion. Si ce site venait à utiliser un jour des cookies de mesure d'audience ou de publicité, une bannière de consentement serait mise en place avant leur dépôt, conformément à la loi.",
      },
      {
        h: "Contact",
        p: "Pour toute question relative aux cookies : info@receptcar.com.",
      },
    ],
  },
  en: {
    title: "Cookies",
    updated: "Last updated: October 27, 2026",
    sections: [
      {
        h: "1. Why there is no consent banner",
        p: "This website does not use any advertising cookies, audience measurement tools (such as Google Analytics) or social media pixels. All cookies and local storage data described below are strictly necessary for the Service to function (login, language, session security); they are therefore exempt from the requirement for consent, both under the Swiss Federal Data Protection Act (nFADP) and the European General Data Protection Regulation (GDPR).",
      },
      {
        h: "sb-*-auth-token",
        p: "Provider: Supabase (database and authentication hosting). Purpose: to keep your session open after you have logged in. Duration: until you log out or the session expires.",
      },
      {
        h: "sb_last_activity",
        p: "Provider: ReceptCar. Purpose: to detect inactivity and automatically log you out after 2 hours of inactivity. Cookie retention period: up to 30 days; renewed with every action and deleted upon logout.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Provider: ReceptCar. Purpose: to remember the language you have chosen. Duration: 1 year.",
      },
      {
        h: "Draft reception form",
        p: "Technically, this is not a cookie, but a piece of local storage data (localStorage) that remains solely on your device and is never sent to our servers. Provider: ReceptCar. Purpose: to prevent a reception form being lost whilst being filled in should the tab be closed accidentally. Duration: automatically deleted after 24 hours, or as soon as the form is submitted.",
      },
      {
        h: "Your choices",
        p: "No action is required on your part: these elements are essential for the Service to function and cannot be disabled without preventing you from logging in. Should this website ever use cookies for audience measurement or advertising purposes, a consent banner would be displayed before they are set, in accordance with the law.",
      },
      {
        h: "Contact",
        p: "If you have any questions about cookies, please contact: info@receptcar.com.",
      },
    ],
  },
  es: {
    title: "Cookies",
    updated: "Última actualización: 27 de octubre de 2026",
    sections: [
      {
        h: "1. ¿Por qué no hay un banner de consentimiento?",
        p: "Esta página web no utiliza cookies publicitarias, herramientas de medición de audiencia (como Google Analytics) ni píxeles de redes sociales. Todas las cookies y los datos de almacenamiento local que se describen a continuación son estrictamente necesarios para el funcionamiento del Servicio (inicio de sesión, idioma, seguridad de la sesión); por lo tanto, están exentos de consentimiento, tanto en virtud de la Ley federal suiza de protección de datos (nLPD) como del Reglamento General de Protección de Datos (RGPD) de la Unión Europea.",
      },
      {
        h: "sb-*-auth-token",
        p: "Proveedor: Supabase (alojamiento de la base de datos y autenticación). Finalidad: mantener abierta tu sesión tras iniciar sesión. Duración: hasta que te desconectes o hasta que caduque la sesión.",
      },
      {
        h: "sb_last_activity",
        p: "Proveedor: ReceptCar. Finalidad: detectar la inactividad para cerrar la sesión automáticamente tras 2 horas sin actividad. Duración de la cookie: hasta 30 días; se renueva con cada acción y se elimina al cerrar la sesión.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Proveedor: ReceptCar. Finalidad: guardar el idioma que hayas elegido. Duración: 1 año.",
      },
      {
        h: "Borrador de la ficha de recepción",
        p: "Técnicamente no se trata de una cookie, sino de un dato de almacenamiento local (localStorage) que permanece únicamente en tu dispositivo y nunca se transmite a nuestros servidores. Proveedor: ReceptCar. Finalidad: evitar que se pierda una ficha de recepción que se esté rellenando en caso de que se cierre accidentalmente la pestaña. Duración: se elimina automáticamente tras 24 horas, o en cuanto se envía la ficha.",
      },
      {
        h: "Tus opciones",
        p: "No es necesario que realices ninguna acción: estos elementos son imprescindibles para el funcionamiento del Servicio y no pueden desactivarse sin impedir la conexión. Si en algún momento este sitio web llegara a utilizar cookies de medición de audiencia o publicitarias, se mostraría un banner de consentimiento antes de su instalación, de conformidad con la ley.",
      },
      {
        h: "Contacto",
        p: "Para cualquier consulta relacionada con las cookies: info@receptcar.com.",
      },
    ],
  },
  pt: {
    title: "Cookies",
    updated: "Última atualização: 27 de outubro de 2026",
    sections: [
      {
        h: "1. Por que razão não há um banner de consentimento",
        p: "Este site não utiliza cookies publicitários, ferramentas de medição de audiência (como o Google Analytics) nem pixels de redes sociais. Todos os cookies e dados de armazenamento local descritos abaixo são estritamente necessários para o funcionamento do Serviço (início de sessão, idioma, segurança da sessão): estão, portanto, isentos de consentimento, tanto nos termos da Lei Federal Suíça sobre a Proteção de Dados (nLPD) como do Regulamento Geral Europeu sobre a Proteção de Dados (RGPD).",
      },
      {
        h: "sb-*-auth-token",
        p: "Fornecedor: Supabase (alojamento da base de dados e da autenticação). Finalidade: manter a sua sessão ativa após o início de sessão. Duração: até ao fim da sessão ou até que a sessão expire.",
      },
      {
        h: "sb_last_activity",
        p: "Fornecedor: ReceptCar. Finalidade: detetar a inatividade para o desconectar automaticamente após 2 horas sem atividade. Período de validade do cookie: até 30 dias, renovado a cada ação e eliminado ao terminar a sessão.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Fornecedor: ReceptCar. Finalidade: guardar o idioma que escolheu. Duração: 1 ano.",
      },
      {
        h: "Rascunho da ficha de receção",
        p: "Tecnicamente, não se trata de um cookie, mas sim de um dado de armazenamento local (localStorage) que permanece exclusivamente no seu dispositivo e nunca é transmitido aos nossos servidores. Fornecedor: ReceptCar. Finalidade: evitar a perda de um registo de receção em fase de preenchimento, no caso de encerramento acidental do separador. Duração: eliminado automaticamente após 24 horas ou assim que o registo for enviado.",
      },
      {
        h: "As suas escolhas",
        p: "Não é necessária qualquer ação da sua parte: estes elementos são indispensáveis para o funcionamento do Serviço e não podem ser desativados sem impedir a ligação. Caso este site venha a utilizar, no futuro, cookies de medição de audiência ou de publicidade, será apresentado um banner de consentimento antes da sua instalação, em conformidade com a lei.",
      },
      {
        h: "Contacto",
        p: "Para quaisquer questões relacionadas com os cookies: info@receptcar.com.",
      },
    ],
  },
  de: {
    title: "Cookies",
    updated: "Letzte Aktualisierung: 27. Oktober 2026",
    sections: [
      {
        h: "1. Warum gibt es kein Einwilligungsbanner?",
        p: "Diese Website verwendet keine Werbe-Cookies, keine Tools zur Besucheranalyse (wie Google Analytics) und keine Social-Media-Pixel. Alle unten beschriebenen Cookies und lokal gespeicherten Daten sind für den Betrieb des Dienstes unbedingt erforderlich (Anmeldung, Sprache, Sitzungssicherheit): Sie sind daher sowohl im Sinne des Schweizer Bundesgesetzes über den Datenschutz (nDSG) als auch der Europäischen Datenschutz-Grundverordnung (DSGVO) von der Einwilligungspflicht ausgenommen.",
      },
      {
        h: "sb-*-auth-token",
        p: "Anbieter: Supabase (Hosting der Datenbank und der Authentifizierung). Zweck: Ihre Sitzung nach der Anmeldung offen zu halten. Dauer: bis zur Abmeldung oder bis zum Ablauf der Sitzung.",
      },
      {
        h: "sb_last_activity",
        p: "Anbieter: ReceptCar. Zweck: Erkennung von Inaktivität, um Sie nach 2 Stunden ohne Aktivität automatisch abzumelden. Speicherdauer des Cookies: bis zu 30 Tage, wird bei jeder Aktion erneuert und beim Abmelden gelöscht.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Anbieter: ReceptCar. Zweck: Speicherung der von Ihnen gewählten Sprache. Dauer: 1 Jahr.",
      },
      {
        h: "Entwurf eines Annahmeprotokolls",
        p: "Technisch gesehen handelt es sich hierbei nicht um ein Cookie, sondern um lokale Speicherdaten (localStorage), die ausschließlich auf Ihrem Gerät verbleiben und niemals an unsere Server übertragen werden. Anbieter: ReceptCar. Zweck: Verhinderung des Verlusts eines in Bearbeitung befindlichen Annahmeprotokolls im Falle eines versehentlichen Schließens des Tabs. Dauer: Wird nach 24 Stunden oder sobald das Protokoll gesendet wurde automatisch gelöscht.",
      },
      {
        h: "Ihre Auswahl",
        p: "Sie müssen nichts unternehmen: Diese Elemente sind für den Betrieb des Dienstes unerlässlich und können nicht deaktiviert werden, ohne dass die Verbindung unterbrochen wird. Sollte diese Website eines Tages Cookies zur Reichweitenmessung oder zu Werbezwecken verwenden, würde gemäß den gesetzlichen Bestimmungen vor deren Speicherung ein Einwilligungsbanner eingeblendet werden.",
      },
      {
        h: "Kontakt",
        p: "Bei Fragen zu Cookies: info@receptcar.com.",
      },
    ],
  },
  it: {
    title: "Cookie",
    updated: "Ultimo aggiornamento: 27 ottobre 2026",
    sections: [
      {
        h: "1. Perché non c'è il banner di consenso",
        p: "Questo sito non utilizza cookie pubblicitari, strumenti di misurazione dell'audience (come Google Analytics) né pixel dei social network. Tutti i cookie e i dati di archiviazione locale descritti di seguito sono strettamente necessari al funzionamento del Servizio (accesso, lingua, sicurezza della sessione): sono quindi esenti dal consenso, sia ai sensi della legge federale svizzera sulla protezione dei dati (nLPD) che del Regolamento generale europeo sulla protezione dei dati (RGPD).",
      },
      {
        h: "sb-*-auth-token",
        p: "Fornitore: Supabase (hosting del database e dell'autenticazione). Finalità: mantenere aperta la sessione dopo l'accesso. Durata: fino alla disconnessione o alla scadenza della sessione.",
      },
      {
        h: "sb_last_activity",
        p: "Fornitore: ReceptCar. Finalità: rilevare l'inattività per disconnetterti automaticamente dopo 2 ore di inattività. Durata del cookie: fino a 30 giorni, rinnovato ad ogni azione e cancellato al momento della disconnessione.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Fornitore: ReceptCar. Finalità: memorizzare la lingua selezionata. Durata: 1 anno.",
      },
      {
        h: "Bozza della scheda di accettazione",
        p: "Tecnicamente non si tratta di un cookie, ma di un dato di archiviazione locale (localStorage) che rimane esclusivamente sul tuo dispositivo e non viene mai trasmesso ai nostri server. Fornitore: ReceptCar. Finalità: evitare la perdita di una scheda di accettazione in fase di compilazione in caso di chiusura accidentale della scheda del browser. Durata: viene eliminato automaticamente dopo 24 ore o non appena la scheda viene inviata.",
      },
      {
        h: "Le vostre scelte",
        p: "Non è richiesta alcuna azione da parte vostra: questi elementi sono indispensabili per il funzionamento del Servizio e non possono essere disattivati senza impedire la connessione. Qualora questo sito dovesse un giorno utilizzare cookie di misurazione dell'audience o pubblicitari, verrebbe visualizzato un banner di consenso prima del loro inserimento, in conformità con la legge.",
      },
      {
        h: "Contatti",
        p: "Per qualsiasi domanda relativa ai cookie: info@receptcar.com.",
      },
    ],
  },
  sq: {
    title: "Cookies",
    updated: "Përditësimi i fundit: 27 tetor 2026",
    sections: [
      {
        h: "1. Pse nuk ka banderolë për pëlqimin",
        p: "Ky uebsajt nuk përdor asnjë cookie reklame, asnjë mjet matjeje të audiencës (si Google Analytics) apo pikselë të rrjeteve sociale. Të gjitha cookie-t dhe të dhënat e ruajtjes lokale të përshkruara më poshtë janë rreptësisht të nevojshme që Shërbimi të funksionojë (hyrja, gjuha, siguria e sesionit); prandaj ato janë të përjashtuara nga kërkesa për pëlqim, si sipas Ligjit Federal Zviceran për Mbrojtjen e të Dhënave (nLPD), ashtu edhe sipas Rregullores së Përgjithshme Evropiane për Mbrojtjen e të Dhënave (GDPR).",
      },
      {
        h: "sb-*-auth-token",
        p: "Ofruesi: Supabase (mikpritje e bazës së të dhënave dhe e autentifikimit). Qëllimi: të mbajë sesionin tuaj të hapur pasi të keni hyrë. Kohëzgjatja: derisa të dilni ose derisa të skadojë sesioni.",
      },
      {
        h: "sb_last_activity",
        p: "Ofruesi: ReceptCar. Qëllimi: të zbulojë inaktivitetin dhe t'ju ç'kyçë automatikisht pas 2 orësh inaktiviteti. Periudha e ruajtjes së cookie-ve: deri në 30 ditë; rinovohet me çdo veprim dhe fshihet pas ç'kyçjes.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Ofruesi: ReceptCar. Qëllimi: të mbajë mend gjuhën që keni zgjedhur. Kohëzgjatja: 1 vit.",
      },
      {
        h: "Skica e formularit të pranimit",
        p: "Teknikisht, kjo nuk është një cookie, por një copë të dhënash të ruajtjes lokale (localStorage) që mbetet vetëm në pajisjen tuaj dhe nuk dërgohet kurrë në serverët tanë. Ofruesi: ReceptCar. Qëllimi: të parandalohet humbja e formularit të pranimit gjatë plotësimit nëse skeda mbyllet aksidentalisht. Kohëzgjatja: fshihet automatikisht pas 24 orësh, ose sapo formulari të dorëzohet.",
      },
      {
        h: "Zgjedhjet tuaja",
        p: "Nuk kërkohet asnjë veprim nga ana juaj: këto elementë janë thelbësorë për funksionimin e Shërbimit dhe nuk mund të çaktivizohen pa ju penguar të hyni. Nëse ky uebsajt ndonjëherë do të përdorë cookie-t për matjen e audiencës ose për qëllime reklamuese, do të shfaqet një banderolë pëlqimi përpara se ato të vendosen, në përputhje me ligjin.",
      },
      {
        h: "Kontaktoni",
        p: "Nëse keni ndonjë pyetje rreth cookies, ju lutemi kontaktoni: info@receptcar.com.",
      },
    ],
  },
  el: {
    title: "Cookies",
    updated: "Τελευταία ενημέρωση: 27 Οκτωβρίου 2026",
    sections: [
      {
        h: "1. Γιατί δεν υπάρχει banner συγκατάθεσης",
        p: "Αυτός ο ιστότοπος δεν χρησιμοποιεί διαφημιστικά cookies, εργαλεία μέτρησης επισκεψιμότητας (όπως το Google Analytics) ούτε pixel κοινωνικών δικτύων. Όλα τα cookies και τα δεδομένα τοπικής αποθήκευσης που περιγράφονται παρακάτω είναι απολύτως απαραίτητα για τη λειτουργία της Υπηρεσίας (σύνδεση, γλώσσα, ασφάλεια περιόδου σύνδεσης): ως εκ τούτου, εξαιρούνται από την υποχρέωση συγκατάθεσης, τόσο σύμφωνα με τον ελβετικό ομοσπονδιακό νόμο περί προστασίας δεδομένων (nLPD) όσο και σύμφωνα με τον Γενικό Κανονισμό για την Προστασία Δεδομένων της ΕΕ (GDPR).",
      },
      {
        h: "sb-*-auth-token",
        p: "Πάροχος: Supabase (φιλοξενία της βάσης δεδομένων και της διαδικασίας ελέγχου ταυτότητας). Σκοπός: να διατηρείται ανοιχτή η συνεδρία σας μετά τη σύνδεση. Διάρκεια: έως την αποσύνδεση ή τη λήξη της συνεδρίας.",
      },
      {
        h: "sb_last_activity",
        p: "Πάροχος: ReceptCar. Σκοπός: να ανιχνεύει την αδράνεια και να σας αποσυνδέει αυτόματα μετά από 2 ώρες χωρίς δραστηριότητα. Διάρκεια αποθήκευσης του cookie: έως 30 ημέρες, ανανεώνεται με κάθε ενέργεια και διαγράφεται κατά την αποσύνδεση.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Πάροχος: ReceptCar. Σκοπός: αποθήκευση της γλώσσας που έχετε επιλέξει. Διάρκεια: 1 έτος.",
      },
      {
        h: "Πρόχειρο δελτίου παραλαβής",
        p: "Τεχνικά, δεν πρόκειται για cookie, αλλά για δεδομένα τοπικής αποθήκευσης (localStorage) που παραμένουν αποκλειστικά στη συσκευή σας και δεν μεταδίδονται ποτέ στους διακομιστές μας. Πάροχος: ReceptCar. Σκοπός: να μην χαθεί ένα δελτίο παραλαβής που βρίσκεται σε διαδικασία συμπλήρωσης σε περίπτωση τυχαίου κλεισίματος της καρτέλας. Διάρκεια: διαγράφεται αυτόματα μετά από 24 ώρες ή μόλις αποσταλεί το δελτίο.",
      },
      {
        h: "Οι επιλογές σας",
        p: "Δεν απαιτείται καμία ενέργεια από την πλευρά σας: τα στοιχεία αυτά είναι απαραίτητα για τη λειτουργία της Υπηρεσίας και δεν μπορούν να απενεργοποιηθούν χωρίς να εμποδιστεί η σύνδεση. Εάν ο ιστότοπος αυτός χρησιμοποιήσει κάποια στιγμή cookies μέτρησης επισκεψιμότητας ή διαφήμισης, θα εμφανιστεί ένα banner συγκατάθεσης πριν από την αποθήκευσή τους, σύμφωνα με τη νομοθεσία.",
      },
      {
        h: "Επικοινωνία",
        p: "Για οποιαδήποτε ερώτηση σχετικά με τα cookies: info@receptcar.com.",
      },
    ],
  },
  ru: {
    title: "Файлы cookie",
    updated: "Последнее обновление: 27 октября 2026 г.",
    sections: [
      {
        h: "1. Почему нет баннера с запросом согласия",
        p: "Данный сайт не использует рекламные файлы cookie, инструменты для измерения посещаемости (такие как Google Analytics) и пиксели социальных сетей. Все файлы cookie и данные локального хранилища, описанные ниже, являются строго необходимыми для функционирования Сервиса (авторизация, язык, безопасность сеанса): поэтому они не требуют согласия ни в соответствии с Федеральным законом Швейцарии о защите данных (nLPD), ни в соответствии с Общим регламентом по защите данных ЕС (GDPR).",
      },
      {
        h: "sb-*-auth-token",
        p: "Поставщик: Supabase (хостинг базы данных и аутентификации). Цель: поддержание открытой сессии после входа в систему. Срок хранения: до выхода из системы или истечения срока действия сессии.",
      },
      {
        h: "sb_last_activity",
        p: "Поставщик: ReceptCar. Цель: определение отсутствия активности для автоматического выхода из системы по истечении 2 часов бездействия. Срок хранения файла cookie: до 30 дней; обновляется при каждом действии и удаляется при выходе из системы.",
      },
      {
        h: "NEXT_LOCALE",
        p: "Поставщик: ReceptCar. Цель: сохранение выбранного вами языка. Срок хранения: 1 год.",
      },
      {
        h: "Черновик акта приёмки",
        p: "Технически это не файл cookie, а данные локального хранилища (localStorage), которые остаются исключительно на вашем устройстве и никогда не передаются на наши серверы. Поставщик: ReceptCar. Цель: предотвратить потерю заполняемого акта приёмки при случайном закрытии вкладки. Срок хранения: удаляется автоматически через 24 часа или сразу после отправки акта.",
      },
      {
        h: "Ваш выбор",
        p: "От вас не требуется никаких действий: эти элементы необходимы для работы Сервиса и не могут быть отключены без нарушения возможности подключения. Если в будущем на этом сайте начнут использоваться файлы cookie для анализа посещаемости или рекламы, в соответствии с законодательством перед их размещением будет отображаться баннер с запросом согласия.",
      },
      {
        h: "Контакты",
        p: "По всем вопросам, касающимся файлов cookie: info@receptcar.com.",
      },
    ],
  },
};

export default function CookiesPage() {
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
      </div>
    </main>
  );
}
