export type Lang = "fr" | "en" | "es" | "pt" | "de" | "it" | "sq" | "el" | "ru";

export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "pt", label: "🇵🇹 Português" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "sq", label: "🇦🇱 Shqip" },
  { value: "el", label: "🇬🇷 Ελληνικά" },
  { value: "ru", label: "🇷🇺 Русский" },
];

interface Dict {
  docTitle: string;
  clientVehicle: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  plate: string;
  mileage: string;
  km: string;
  workRequested: string;
  vehicleState: string;
  damageNoted: string;
  cardGrey: string;
  signature: string;
  consent: string;
  signedOn: string;
  none: string;
  extraPhotosTitle: string;
  photoLabels: { front: string; back: string; left: string; right: string };
  receptionNumberLabel: string;
  noDamage: string;
  fuelLevelLabel: string;
  fuelLevels: { empty: string; quarter: string; half: string; three_quarter: string; full: string };
  dashboardPhotoLabel: string;
  emailSubject: (plate: string, garageName: string) => string;
  emailBody: (
    name: string,
    brandModel: string,
    plate: string,
    garageName: string,
    garageAddress: string,
  ) => string;
}

export const I18N: Record<Lang, Dict> = {
  fr: {
    docTitle: "Fiche de réception véhicule",
    clientVehicle: "Client & véhicule",
    name: "Nom du client",
    phone: "Téléphone",
    email: "E-mail",
    vehicle: "Véhicule",
    plate: "Plaque",
    mileage: "Kilométrage",
    km: "km",
    workRequested: "Travaux demandés",
    vehicleState: "État du véhicule à l'arrivée",
    damageNoted: "Dommages constatés à la réception",
    cardGrey: "Carte grise",
    signature: "Signature du client",
    consent:
      "Le client certifie l'exactitude des informations ci-dessus, accepte l'état du véhicule tel que constaté et documenté par photos lors de la réception, et consent au traitement de ses données personnelles (dont la photo du document d'immatriculation) pour les besoins de cette prestation.",
    signedOn: "Signé le",
    none: "—",
    extraPhotosTitle: "Photos supplémentaires",
    photoLabels: { front: "Avant", back: "Arrière", left: "Côté gauche", right: "Côté droit" },
    receptionNumberLabel: "Fiche n°",
    noDamage: "Aucun dommage constaté",
    fuelLevelLabel: "Niveau de carburant",
    fuelLevels: { empty: "Vide", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Plein" },
    dashboardPhotoLabel: "Tableau de bord",
    emailSubject: (p, g) => `Fiche de réception — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Bonjour ${name},\n\nVeuillez trouver ci-joint la fiche de réception de votre véhicule (${bm || ""} — ${p}), avec les photos prises à l'arrivée et les travaux convenus.\n\n${g}\n${addr}`,
  },
  en: {
    docTitle: "Vehicle reception form",
    clientVehicle: "Client & vehicle",
    name: "Client name",
    phone: "Phone",
    email: "E-mail",
    vehicle: "Vehicle",
    plate: "Plate",
    mileage: "Mileage",
    km: "km",
    workRequested: "Requested work",
    vehicleState: "Vehicle condition on arrival",
    damageNoted: "Damage noted at reception",
    cardGrey: "Registration document",
    signature: "Client signature",
    consent:
      "The client certifies the accuracy of the above information, accepts the condition of the vehicle as noted and documented by photos upon reception, and consents to the processing of their personal data (including the photo of the registration document) for the purposes of this service.",
    signedOn: "Signed on",
    none: "—",
    extraPhotosTitle: "Additional photos",
    photoLabels: { front: "Front", back: "Back", left: "Left side", right: "Right side" },
    receptionNumberLabel: "Form No.",
    noDamage: "No damage noted",
    fuelLevelLabel: "Fuel level",
    fuelLevels: { empty: "Empty", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Full" },
    dashboardPhotoLabel: "Dashboard",
    emailSubject: (p, g) => `Reception form — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Hello ${name},\n\nPlease find attached the reception form for your vehicle (${bm || ""} — ${p}), including the photos taken on arrival and the agreed work.\n\n${g}\n${addr}`,
  },
  es: {
    docTitle: "Ficha de recepción del vehículo",
    clientVehicle: "Cliente y vehículo",
    name: "Nombre del cliente",
    phone: "Teléfono",
    email: "Correo electrónico",
    vehicle: "Vehículo",
    plate: "Matrícula",
    mileage: "Kilometraje",
    km: "km",
    workRequested: "Trabajos solicitados",
    vehicleState: "Estado del vehículo a la llegada",
    damageNoted: "Daños constatados en la recepción",
    cardGrey: "Permiso de circulación",
    signature: "Firma del cliente",
    consent:
      "El cliente certifica la exactitud de la información anterior, acepta el estado del vehículo tal como se constató y documentó mediante fotos en la recepción, y consiente el tratamiento de sus datos personales (incluida la foto del permiso de circulación) para los fines de esta prestación.",
    signedOn: "Firmado el",
    none: "—",
    extraPhotosTitle: "Fotos adicionales",
    photoLabels: { front: "Delantera", back: "Trasera", left: "Lado izquierdo", right: "Lado derecho" },
    receptionNumberLabel: "Ficha n.º",
    noDamage: "Sin daños constatados",
    fuelLevelLabel: "Nivel de combustible",
    fuelLevels: { empty: "Vacío", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Lleno" },
    dashboardPhotoLabel: "Salpicadero",
    emailSubject: (p, g) => `Ficha de recepción — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Hola ${name},\n\nAdjunto encontrará la ficha de recepción de su vehículo (${bm || ""} — ${p}), con las fotos tomadas a la llegada y los trabajos acordados.\n\n${g}\n${addr}`,
  },
  pt: {
    docTitle: "Ficha de receção do veículo",
    clientVehicle: "Cliente e veículo",
    name: "Nome do cliente",
    phone: "Telefone",
    email: "E-mail",
    vehicle: "Veículo",
    plate: "Matrícula",
    mileage: "Quilometragem",
    km: "km",
    workRequested: "Trabalhos solicitados",
    vehicleState: "Estado do veículo à chegada",
    damageNoted: "Danos constatados na receção",
    cardGrey: "Documento do veículo",
    signature: "Assinatura do cliente",
    consent:
      "O cliente certifica a exatidão das informações acima, aceita o estado do veículo tal como constatado e documentado por fotos na receção, e consente o tratamento dos seus dados pessoais (incluindo a foto do documento do veículo) para os fins desta prestação.",
    signedOn: "Assinado em",
    none: "—",
    extraPhotosTitle: "Fotos adicionais",
    photoLabels: { front: "Frente", back: "Traseira", left: "Lado esquerdo", right: "Lado direito" },
    receptionNumberLabel: "Ficha n.º",
    noDamage: "Nenhum dano constatado",
    fuelLevelLabel: "Nível de combustível",
    fuelLevels: { empty: "Vazio", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Cheio" },
    dashboardPhotoLabel: "Painel de instrumentos",
    emailSubject: (p, g) => `Ficha de receção — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Olá ${name},\n\nSegue em anexo a ficha de receção do seu veículo (${bm || ""} — ${p}), com as fotos tiradas à chegada e os trabalhos combinados.\n\n${g}\n${addr}`,
  },
  de: {
    docTitle: "Fahrzeug-Annahmeprotokoll",
    clientVehicle: "Kunde & Fahrzeug",
    name: "Name des Kunden",
    phone: "Telefon",
    email: "E-Mail",
    vehicle: "Fahrzeug",
    plate: "Kennzeichen",
    mileage: "Kilometerstand",
    km: "km",
    workRequested: "Gewünschte Arbeiten",
    vehicleState: "Fahrzeugzustand bei Ankunft",
    damageNoted: "Bei der Annahme festgestellte Schäden",
    cardGrey: "Fahrzeugausweis",
    signature: "Unterschrift des Kunden",
    consent:
      "Der Kunde bestätigt die Richtigkeit der obigen Angaben, akzeptiert den bei der Annahme festgestellten und mittels Fotos dokumentierten Zustand des Fahrzeugs und willigt in die Verarbeitung seiner personenbezogenen Daten (einschließlich des Fotos des Fahrzeugausweises) für die Zwecke dieser Dienstleistung ein.",
    signedOn: "Unterschrieben am",
    none: "—",
    extraPhotosTitle: "Zusätzliche Fotos",
    photoLabels: { front: "Vorne", back: "Hinten", left: "Linke Seite", right: "Rechte Seite" },
    receptionNumberLabel: "Protokoll Nr.",
    noDamage: "Keine Schäden festgestellt",
    fuelLevelLabel: "Tankfüllstand",
    fuelLevels: { empty: "Leer", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Voll" },
    dashboardPhotoLabel: "Armaturenbrett",
    emailSubject: (p, g) => `Annahmeprotokoll — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Guten Tag ${name},\n\nAnbei erhalten Sie das Annahmeprotokoll für Ihr Fahrzeug (${bm || ""} — ${p}) mit den bei der Ankunft aufgenommenen Fotos und den vereinbarten Arbeiten.\n\n${g}\n${addr}`,
  },
  it: {
    docTitle: "Scheda di accettazione veicolo",
    clientVehicle: "Cliente e veicolo",
    name: "Nome del cliente",
    phone: "Telefono",
    email: "E-mail",
    vehicle: "Veicolo",
    plate: "Targa",
    mileage: "Chilometraggio",
    km: "km",
    workRequested: "Interventi richiesti",
    vehicleState: "Stato del veicolo all'arrivo",
    damageNoted: "Danni riscontrati all'accettazione",
    cardGrey: "Libretto di circolazione",
    signature: "Firma del cliente",
    consent:
      "Il cliente certifica l'esattezza delle informazioni sopra riportate, accetta lo stato del veicolo così come constatato e documentato con foto al momento dell'accettazione, e acconsente al trattamento dei propri dati personali (compresa la foto del documento del veicolo) per le finalità di questa prestazione.",
    signedOn: "Firmato il",
    none: "—",
    extraPhotosTitle: "Foto aggiuntive",
    photoLabels: { front: "Anteriore", back: "Posteriore", left: "Lato sinistro", right: "Lato destro" },
    receptionNumberLabel: "Scheda n.",
    noDamage: "Nessun danno riscontrato",
    fuelLevelLabel: "Livello carburante",
    fuelLevels: { empty: "Vuoto", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Pieno" },
    dashboardPhotoLabel: "Cruscotto",
    emailSubject: (p, g) => `Scheda di accettazione — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Gentile ${name},\n\nIn allegato trova la scheda di accettazione del suo veicolo (${bm || ""} — ${p}), con le foto scattate all'arrivo e gli interventi concordati.\n\n${g}\n${addr}`,
  },
  sq: {
    docTitle: "Formular i dorëzimit të automjetit",
    clientVehicle: "Klienti & automjeti",
    name: "Emri i klientit",
    phone: "Telefon",
    email: "Email",
    vehicle: "Automjet",
    plate: "Targa",
    mileage: "Distanca e përshkuar",
    km: "kilometër",
    workRequested: "Puna e kërkuar",
    vehicleState: "Gjendja e mjetit në mbërritje",
    damageNoted: "Është vërejtur dëmtim gjatë dorëzimit",
    cardGrey: "Certifikata e regjistrimit të mjetit",
    signature: "Nënshkrimi i klientit",
    consent:
      "Klienti vërteton se informacioni i mësipërm është i saktë, pranon gjendjen e mjetit ashtu siç është vërejtur dhe dokumentuar me fotografi në kohën e dorëzimit, dhe pajtohet me përpunimin e të dhënave të tij personale (përfshirë një fotografi të dokumentit të regjistrimit) për qëllimet e këtij shërbimi.",
    signedOn: "U lidha",
    none: "—",
    extraPhotosTitle: "Foto shtesë",
    photoLabels: { front: "Përpara", back: "Prapa", left: "Ana e majtë", right: "Ana e djathtë" },
    receptionNumberLabel: "Fletë Nr.",
    noDamage: "Nuk u gjet asnjë dëmtim",
    fuelLevelLabel: "Niveli i karburantit",
    fuelLevels: { empty: "Bosh", quarter: "një e katërta", half: "një e gjysmë", three_quarter: "tre e katërta", full: "E plotë" },
    dashboardPhotoLabel: "Paneli i instrumenteve",
    emailSubject: (p, g) => `Formulari i pranimit — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Përshëndetje ${name},\n\nJu bashkëngjit raporti i dorëzimit të automjetit tuaj (${bm || ""} — ${p}), duke përfshirë fotografitë e bëra gjatë ardhjes dhe punën e dakorduar.\n\n${g}\n${addr}`,
  },
  el: {
    docTitle: "Δελτίο παραλαβής οχήματος",
    clientVehicle: "Πελάτης & όχημα",
    name: "Όνομα πελάτη",
    phone: "Τηλέφωνο",
    email: "Email",
    vehicle: "Όχημα",
    plate: "Πινακίδα",
    mileage: "Χιλιόμετρα",
    km: "χλμ.",
    workRequested: "Ζητούμενες εργασίες",
    vehicleState: "Κατάσταση του οχήματος κατά την άφιξη",
    damageNoted: "Ζημιές που διαπιστώθηκαν κατά την παραλαβή",
    cardGrey: "Άδεια κυκλοφορίας",
    signature: "Υπογραφή του πελάτη",
    consent:
      "Ο πελάτης βεβαιώνει την ακρίβεια των ανωτέρω πληροφοριών, αποδέχεται την κατάσταση του οχήματος όπως διαπιστώθηκε και τεκμηριώθηκε με φωτογραφίες κατά την παραλαβή, και συναινεί στην επεξεργασία των προσωπικών του δεδομένων (συμπεριλαμβανομένης της φωτογραφίας του πιστοποιητικού κυκλοφορίας) για τις ανάγκες της παρούσας υπηρεσίας.",
    signedOn: "Υπογράφηκε στις",
    none: "—",
    extraPhotosTitle: "Πρόσθετες φωτογραφίες",
    photoLabels: { front: "Μπροστά", back: "Πίσω", left: "Αριστερή πλευρά", right: "Δεξιά πλευρά" },
    receptionNumberLabel: "Φύλλο αριθ.",
    noDamage: "Δεν διαπιστώθηκαν ζημιές",
    fuelLevelLabel: "Επίπεδο καυσίμου",
    fuelLevels: { empty: "Κενό", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Πλήρης" },
    dashboardPhotoLabel: "Πίνακας ελέγχου",
    emailSubject: (p, g) => `Δελτίο παραλαβής — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Γεια σας ${name},\n\nΣας αποστέλλουμε συνημμένα το δελτίο παραλαβής του οχήματός σας (${bm || ""} — ${p}), μαζί με τις φωτογραφίες που τραβήχτηκαν κατά την άφιξη και τις εργασίες που συμφωνήθηκαν.\n\n${g}\n${addr}`,
  },
  ru: {
    docTitle: "Акт приемки транспортного средства",
    clientVehicle: "Клиент и автомобиль",
    name: "Имя клиента",
    phone: "Телефон",
    email: "Электронная почта",
    vehicle: "Автомобиль",
    plate: "Номерной знак",
    mileage: "Пробег",
    km: "км",
    workRequested: "Требуемые работы",
    vehicleState: "Состояние автомобиля по прибытии",
    damageNoted: "Повреждения, выявленные при приемке",
    cardGrey: "Техпаспорт",
    signature: "Подпись клиента",
    consent:
      "Клиент подтверждает достоверность приведенной выше информации, принимает состояние транспортного средства в том виде, в каком оно было зафиксировано и задокументировано с помощью фотографий при приеме, а также дает согласие на обработку своих персональных данных (включая фотографию регистрационного документа) для целей оказания данной услуги.",
    signedOn: "Подписано",
    none: "—",
    extraPhotosTitle: "Дополнительные фотографии",
    photoLabels: { front: "Спереди", back: "Сзади", left: "Левая сторона", right: "Правая сторона" },
    receptionNumberLabel: "Форма №",
    noDamage: "Повреждений не обнаружено",
    fuelLevelLabel: "Уровень топлива",
    fuelLevels: { empty: "Пустота", quarter: "1/4", half: "1/2", three_quarter: "3/4", full: "Полный" },
    dashboardPhotoLabel: "Панель управления",
    emailSubject: (p, g) => `Акт приемки — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Здравствуйте, ${name},\n\nВ приложении вы найдёте акт приёма-передачи вашего автомобиля (${bm || ""} — ${p}) с фотографиями, сделанными при поступлении, и перечнем согласованных работ.\n\n${g}\n${addr}`,
  },
};

interface Tag {
  fr: string;
  en: string;
  es: string;
  pt: string;
  de: string;
  it: string;
  sq: string;
  el: string;
  ru: string;
}

function tr(tag: string, map: Record<string, Tag>, lang: Lang): string {
  return map[tag]?.[lang] ?? tag;
}

export const WORK_TAG_TR: Record<string, Tag> = {
  Vidange: { fr: "Vidange", en: "Oil change", es: "Cambio de aceite", pt: "Mudança de óleo", de: "Ölwechsel", it: "Cambio olio", sq: "Ndryshimi i vajit", el: "Αποστράγγιση", ru: "Слив" },
  Freins: { fr: "Freins", en: "Brakes", es: "Frenos", pt: "Travões", de: "Bremsen", it: "Freni", sq: "Frenat", el: "Φρένα", ru: "Тормоза" },
  Pneus: { fr: "Pneus", en: "Tires", es: "Neumáticos", pt: "Pneus", de: "Reifen", it: "Pneumatici", sq: "Gomat", el: "Ελαστικά", ru: "Шины" },
  "Contrôle technique": {
    fr: "Contrôle technique",
    en: "Technical inspection",
    es: "Inspección técnica",
    pt: "Inspeção técnica",
    de: "Fahrzeugprüfung",
    it: "Revisione tecnica",
    sq: "Testi MOT",
    el: "Τεχνικός έλεγχος",
    ru: "Технический осмотр",
  },
  Climatisation: { fr: "Climatisation", en: "Air conditioning", es: "Aire acondicionado", pt: "Ar condicionado", de: "Klimaanlage", it: "Climatizzazione", sq: "Kondicionimi i ajrit", el: "Κλιματισμός", ru: "Кондиционирование воздуха" },
  "Diagnostic panne": {
    fr: "Diagnostic panne",
    en: "Fault diagnosis",
    es: "Diagnóstico de avería",
    pt: "Diagnóstico de avaria",
    de: "Fehlerdiagnose",
    it: "Diagnosi guasto",
    sq: "Diagnostika e defekteve",
    el: "Διάγνωση βλάβης",
    ru: "Диагностика неисправностей",
  },
  Révision: { fr: "Révision", en: "Service", es: "Revisión", pt: "Revisão", de: "Wartung", it: "Tagliando", sq: "Rishikim", el: "Αναθεώρηση", ru: "Пересмотр" },
  "Courroie de distribution": {
    fr: "Courroie de distribution",
    en: "Timing belt",
    es: "Correa de distribución",
    pt: "Correia de distribuição",
    de: "Zahnriemen",
    it: "Cinghia di distribuzione",
    sq: "Kordon kohor",
    el: "Ιμάντας χρονισμού",
    ru: "Ремень ГРМ",
  },
  Embrayage: { fr: "Embrayage", en: "Clutch", es: "Embrague", pt: "Embraiagem", de: "Kupplung", it: "Frizione", sq: "Kllapa", el: "Συμπλέκτης", ru: "Сцепление" },
  Alternateur: { fr: "Alternateur", en: "Alternator", es: "Alternador", pt: "Alternador", de: "Lichtmaschine", it: "Alternatore", sq: "Alternator", el: "Εναλλάκτης", ru: "Генератор переменного тока" },
  Démarreur: { fr: "Démarreur", en: "Starter motor", es: "Motor de arranque", pt: "Motor de arranque", de: "Anlasser", it: "Motorino d'avviamento", sq: "Motori i ndezjes", el: "Μίζα", ru: "Стартер" },
  "Balai d'essuie-glace": {
    fr: "Balai d'essuie-glace",
    en: "Wiper blade",
    es: "Escobilla limpiaparabrisas",
    pt: "Palheta do limpa-vidros",
    de: "Scheibenwischer",
    it: "Spazzola tergicristallo",
    sq: "Fletë e fshirësit të xhamit të përparmë",
    el: "Σκούπα υαλοκαθαριστήρα",
    ru: "Щетка стеклоочистителя",
  },
  "Pare-brise à remplacer": {
    fr: "Pare-brise à remplacer",
    en: "Windshield replacement",
    es: "Sustitución de parabrisas",
    pt: "Substituição do para-brisas",
    de: "Windschutzscheibe ersetzen",
    it: "Sostituzione parabrezza",
    sq: "Xhami i përparmë do të zëvendësohet",
    el: "Αντικατάσταση παρμπρίζ",
    ru: "Необходимо заменить лобовое стекло",
  },
};

export const WORK_TAGS = Object.keys(WORK_TAG_TR);

export function trWorkTag(tag: string, lang: Lang): string {
  return tr(tag, WORK_TAG_TR, lang);
}

const POSITIONS: Tag[] = [
  { fr: "avant droite", en: "front right", es: "delantera derecha", pt: "dianteira direita", de: "vorne rechts", it: "anteriore destra", sq: "para djathtas", el: "μπροστά δεξιά", ru: "правый передний" },
  { fr: "avant gauche", en: "front left", es: "delantera izquierda", pt: "dianteira esquerda", de: "vorne links", it: "anteriore sinistra", sq: "para majtas", el: "μπροστά αριστερά", ru: "переднее левое" },
  { fr: "arrière droite", en: "rear right", es: "trasera derecha", pt: "traseira direita", de: "hinten rechts", it: "posteriore destra", sq: "pas djathtas", el: "πίσω δεξιά", ru: "сзади справа" },
  { fr: "arrière gauche", en: "rear left", es: "trasera izquierda", pt: "traseira esquerda", de: "hinten links", it: "posteriore sinistra", sq: "pas majtas", el: "πίσω αριστερά", ru: "левый задний" },
  { fr: "latéral droite", en: "right side", es: "lateral derecho", pt: "lateral direito", de: "rechte Seite", it: "lato destro", sq: "anash djathtas", el: "δεξιά πλευρά", ru: "правая сторона" },
  { fr: "latéral gauche", en: "left side", es: "lateral izquierdo", pt: "lateral esquerdo", de: "linke Seite", it: "lato sinistro", sq: "anash majtas", el: "αριστερή πλευρά", ru: "левая сторона" },
];

const RIM_POSITIONS = POSITIONS.slice(0, 4);

interface DamageCategory {
  title: string;
  fr: string;
  en: string;
  es: string;
  pt: string;
  de: string;
  it: string;
  sq: string;
  el: string;
  ru: string;
  positions: Tag[];
}

const DAMAGE_CATEGORIES: DamageCategory[] = [
  { title: "Accidenté", fr: "Accidenté", en: "Collision damage", es: "Accidentado", pt: "Acidentado", de: "Unfallschaden", it: "Incidentato", sq: "I lënduar", el: "Τραυματισμένος", ru: "Пострадавший", positions: POSITIONS },
  { title: "Rayures", fr: "Rayé", en: "Scratched", es: "Rayado", pt: "Riscado", de: "Verkratzt", it: "Graffiato", sq: "Me vija", el: "Ριγέ", ru: "В полоску", positions: POSITIONS },
  {
    title: "Peinture",
    fr: "Peinture défectueuse",
    en: "Paint defect",
    es: "Pintura defectuosa",
    pt: "Pintura defeituosa",
    de: "Lackschaden",
    it: "Vernice danneggiata",
    sq: "Punim boje i defektshëm",
    el: "Ελαττωματική βαφή",
    ru: "Некачественная покраска",
    positions: POSITIONS,
  },
  { title: "Jantes", fr: "Jante rayée", en: "Scratched rim", es: "Llanta rayada", pt: "Jante riscada", de: "Verkratzte Felge", it: "Cerchio graffiato", sq: "Fare e gërvishtur", el: "Γρατσουνισμένη ζάντα", ru: "Поцарапанный диск", positions: RIM_POSITIONS },
];

const DAMAGE_EXTRA: Omit<DamageCategory, "positions">[] = [
  { title: "Autres", fr: "Rétroviseur cassé", en: "Broken mirror", es: "Retrovisor roto", pt: "Espelho retrovisor partido", de: "Spiegel gebrochen", it: "Specchietto rotto", sq: "Pasqyrë anësore e thyer", el: "Σπασμένος καθρέφτης", ru: "Сломанное зеркало заднего вида" },
  {
    title: "Autres",
    fr: "Pare-choc(s) abîmé(s)",
    en: "Damaged bumper(s)",
    es: "Parachoques dañado(s)",
    pt: "Para-choques danificado(s)",
    de: "Stoßstange(n) beschädigt",
    it: "Paraurti danneggiato/i",
    sq: "Parakolpi/ët e dëmtuar",
    el: "Κατεστραμμένος προφυλακτήρας (ή προφυλακτήρες)",
    ru: "Повреждённый(ые) бампер(ы)",
  },
  { title: "Autres", fr: "Pneus défectueux", en: "Defective tires", es: "Neumáticos defectuosos", pt: "Pneus com defeito", de: "Reifen defekt", it: "Pneumatici difettosi", sq: "Gomat e defektshme", el: "Ελαττωματικά ελαστικά", ru: "Неисправные шины" },
  {
    title: "Autres",
    fr: "Ampoule(s) défectueuse(s)",
    en: "Faulty bulb(s)",
    es: "Bombilla(s) defectuosa(s)",
    pt: "Lâmpada(s) com defeito",
    de: "Lampe(n) defekt",
    it: "Lampadina/e difettosa/e",
    sq: "Lampë/a e prishur",
    el: "Ελαττωματική(ές) λάμπα(ες)",
    ru: "Неисправная(ые) лампочка(и)",
  },
  { title: "Autres", fr: "Pare-brise cassé", en: "Cracked windshield", es: "Parabrisas roto", pt: "Para-brisas rachado", de: "Windschutzscheibe gesprungen", it: "Parabrezza incrinato", sq: "Xham i thyer", el: "Σπασμένο παρμπρίζ", ru: "Разбитое лобовое стекло" },
  { title: "Intérieur", fr: "Intérieur propre", en: "Interior clean", es: "Interior limpio", pt: "Interior limpo", de: "Innenraum sauber", it: "Interni puliti", sq: "Brendshëm i pastër", el: "Καθαρό εσωτερικό", ru: "Чистый салон" },
  { title: "Intérieur", fr: "Intérieur sale", en: "Interior dirty", es: "Interior sucio", pt: "Interior sujo", de: "Innenraum schmutzig", it: "Interni sporchi", sq: "Brendshëm i ndotur", el: "Βρώμικο εσωτερικό", ru: "Грязный салон" },
];

export const DAMAGE_TAG_TR: Record<string, Tag> = {};
export const DAMAGE_GROUPS: Record<string, string[]> = {};

function addDamageTag(title: string, entry: Tag) {
  DAMAGE_TAG_TR[entry.fr] = entry;
  (DAMAGE_GROUPS[title] ??= []).push(entry.fr);
}

DAMAGE_CATEGORIES.forEach((cat) => {
  cat.positions.forEach((p) => {
    addDamageTag(cat.title, {
      fr: `${cat.fr} (${p.fr})`,
      en: `${cat.en} (${p.en})`,
      es: `${cat.es} (${p.es})`,
      pt: `${cat.pt} (${p.pt})`,
      de: `${cat.de} (${p.de})`,
      it: `${cat.it} (${p.it})`,
      sq: `${cat.sq} (${p.sq})`,
      el: `${cat.el} (${p.el})`,
      ru: `${cat.ru} (${p.ru})`,
    });
  });
});

DAMAGE_EXTRA.forEach((d) => addDamageTag(d.title, d));

export function trDamageTag(tag: string, lang: Lang): string {
  return tr(tag, DAMAGE_TAG_TR, lang);
}

/** Titres des catégories de dommages (utilisés comme intitulés de section dans le formulaire). */
export const CATEGORY_TITLE_TR: Record<string, Tag> = {
  Accidenté: { fr: "Accidenté", en: "Collision", es: "Accidentes", pt: "Acidentes", de: "Unfallschäden", it: "Incidenti", sq: "I lënduar", el: "Τραυματισμένος", ru: "Пострадавший" },
  Rayures: { fr: "Rayures", en: "Scratches", es: "Rayones", pt: "Riscos", de: "Kratzer", it: "Graffi", sq: "Vija", el: "Ρίγες", ru: "Полоски" },
  Peinture: { fr: "Peinture", en: "Paint", es: "Pintura", pt: "Pintura", de: "Lack", it: "Vernice", sq: "Pikturë", el: "Ζωγραφική", ru: "Живопись" },
  Jantes: { fr: "Jantes", en: "Rims", es: "Llantas", pt: "Jantes", de: "Felgen", it: "Cerchi", sq: "Rrotat", el: "Ζάντες", ru: "Диски" },
  Autres: { fr: "Autres", en: "Other", es: "Otros", pt: "Outros", de: "Sonstiges", it: "Altro", sq: "Të tjera", el: "Άλλα", ru: "Прочее" },
  Intérieur: { fr: "Intérieur", en: "Interior", es: "Interior", pt: "Interior", de: "Innenraum", it: "Interni", sq: "E brendshme", el: "Εσωτερικό", ru: "Интерьер" },
};

export function trCategoryTitle(title: string, lang: Lang): string {
  return tr(title, CATEGORY_TITLE_TR, lang);
}
