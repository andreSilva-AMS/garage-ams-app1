export type Lang = "fr" | "en" | "es" | "pt" | "de";

export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "pt", label: "🇵🇹 Português" },
  { value: "de", label: "🇩🇪 Deutsch" },
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
  photoLabels: { front: string; back: string; left: string; right: string };
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
      "Le client certifie l'exactitude des informations ci-dessus et accepte l'état du véhicule tel que constaté et documenté par photos lors de la réception.",
    signedOn: "Signé le",
    none: "—",
    photoLabels: { front: "Avant", back: "Arrière", left: "Côté gauche", right: "Côté droit" },
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
      "The client certifies the accuracy of the above information and accepts the condition of the vehicle as noted and documented by photos upon reception.",
    signedOn: "Signed on",
    none: "—",
    photoLabels: { front: "Front", back: "Back", left: "Left side", right: "Right side" },
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
      "El cliente certifica la exactitud de la información anterior y acepta el estado del vehículo tal como se constató y documentó mediante fotos en la recepción.",
    signedOn: "Firmado el",
    none: "—",
    photoLabels: { front: "Delantera", back: "Trasera", left: "Lado izquierdo", right: "Lado derecho" },
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
    cardGrey: "Documento único automóvel",
    signature: "Assinatura do cliente",
    consent:
      "O cliente certifica a exatidão das informações acima e aceita o estado do veículo tal como constatado e documentado por fotos na receção.",
    signedOn: "Assinado em",
    none: "—",
    photoLabels: { front: "Frente", back: "Trás", left: "Lado esquerdo", right: "Lado direito" },
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
      "Der Kunde bestätigt die Richtigkeit der obigen Angaben und akzeptiert den bei der Annahme festgestellten und mittels Fotos dokumentierten Zustand des Fahrzeugs.",
    signedOn: "Unterschrieben am",
    none: "—",
    photoLabels: { front: "Vorne", back: "Hinten", left: "Linke Seite", right: "Rechte Seite" },
    emailSubject: (p, g) => `Annahmeprotokoll — ${p} — ${g}`,
    emailBody: (name, bm, p, g, addr) =>
      `Guten Tag ${name},\n\nAnbei erhalten Sie das Annahmeprotokoll für Ihr Fahrzeug (${bm || ""} — ${p}) mit den bei der Ankunft aufgenommenen Fotos und den vereinbarten Arbeiten.\n\n${g}\n${addr}`,
  },
};

interface Tag {
  fr: string;
  en: string;
  es: string;
  pt: string;
  de: string;
}

function tr(tag: string, map: Record<string, Tag>, lang: Lang): string {
  return map[tag]?.[lang] ?? tag;
}

export const WORK_TAG_TR: Record<string, Tag> = {
  Vidange: { fr: "Vidange", en: "Oil change", es: "Cambio de aceite", pt: "Mudança de óleo", de: "Ölwechsel" },
  Freins: { fr: "Freins", en: "Brakes", es: "Frenos", pt: "Travões", de: "Bremsen" },
  Pneus: { fr: "Pneus", en: "Tires", es: "Neumáticos", pt: "Pneus", de: "Reifen" },
  "Contrôle technique": {
    fr: "Contrôle technique",
    en: "Technical inspection",
    es: "Inspección técnica",
    pt: "Inspeção técnica",
    de: "Fahrzeugprüfung",
  },
  Climatisation: { fr: "Climatisation", en: "Air conditioning", es: "Aire acondicionado", pt: "Ar condicionado", de: "Klimaanlage" },
  "Diagnostic panne": {
    fr: "Diagnostic panne",
    en: "Fault diagnosis",
    es: "Diagnóstico de avería",
    pt: "Diagnóstico de avaria",
    de: "Fehlerdiagnose",
  },
  Révision: { fr: "Révision", en: "Service", es: "Revisión", pt: "Revisão", de: "Wartung" },
  "Courroie de distribution": {
    fr: "Courroie de distribution",
    en: "Timing belt",
    es: "Correa de distribución",
    pt: "Correia de distribuição",
    de: "Zahnriemen",
  },
  Embrayage: { fr: "Embrayage", en: "Clutch", es: "Embrague", pt: "Embraiagem", de: "Kupplung" },
  Alternateur: { fr: "Alternateur", en: "Alternator", es: "Alternador", pt: "Alternador", de: "Lichtmaschine" },
  Démarreur: { fr: "Démarreur", en: "Starter motor", es: "Motor de arranque", pt: "Motor de arranque", de: "Anlasser" },
  "Balai d'essuie-glace": {
    fr: "Balai d'essuie-glace",
    en: "Wiper blade",
    es: "Escobilla limpiaparabrisas",
    pt: "Palheta do limpa-vidros",
    de: "Scheibenwischer",
  },
  "Pare-brise à remplacer": {
    fr: "Pare-brise à remplacer",
    en: "Windshield replacement",
    es: "Sustitución de parabrisas",
    pt: "Substituição do para-brisas",
    de: "Windschutzscheibe ersetzen",
  },
};

export const WORK_TAGS = Object.keys(WORK_TAG_TR);

export function trWorkTag(tag: string, lang: Lang): string {
  return tr(tag, WORK_TAG_TR, lang);
}

const POSITIONS: Tag[] = [
  { fr: "avant droite", en: "front right", es: "delantera derecha", pt: "dianteira direita", de: "vorne rechts" },
  { fr: "avant gauche", en: "front left", es: "delantera izquierda", pt: "dianteira esquerda", de: "vorne links" },
  { fr: "arrière droite", en: "rear right", es: "trasera derecha", pt: "traseira direita", de: "hinten rechts" },
  { fr: "arrière gauche", en: "rear left", es: "trasera izquierda", pt: "traseira esquerda", de: "hinten links" },
  { fr: "latéral droite", en: "right side", es: "lateral derecho", pt: "lateral direito", de: "rechte Seite" },
  { fr: "latéral gauche", en: "left side", es: "lateral izquierdo", pt: "lateral esquerdo", de: "linke Seite" },
];

const RIM_POSITIONS = POSITIONS.slice(0, 4);

interface DamageCategory {
  title: string;
  fr: string;
  en: string;
  es: string;
  pt: string;
  de: string;
  positions: Tag[];
}

const DAMAGE_CATEGORIES: DamageCategory[] = [
  { title: "Accidenté", fr: "Accidenté", en: "Collision damage", es: "Accidentado", pt: "Acidentado", de: "Unfallschaden", positions: POSITIONS },
  { title: "Rayures", fr: "Rayé", en: "Scratched", es: "Rayado", pt: "Riscado", de: "Verkratzt", positions: POSITIONS },
  {
    title: "Peinture",
    fr: "Peinture défectueuse",
    en: "Paint defect",
    es: "Pintura defectuosa",
    pt: "Pintura defeituosa",
    de: "Lackschaden",
    positions: POSITIONS,
  },
  { title: "Jantes", fr: "Jante rayée", en: "Scratched rim", es: "Llanta rayada", pt: "Jante riscada", de: "Verkratzte Felge", positions: RIM_POSITIONS },
];

const DAMAGE_EXTRA: Omit<DamageCategory, "positions">[] = [
  { title: "Autres", fr: "Rétroviseur cassé", en: "Broken mirror", es: "Retrovisor roto", pt: "Espelho retrovisor partido", de: "Spiegel gebrochen" },
  {
    title: "Autres",
    fr: "Pare-choc(s) abîmé(s)",
    en: "Damaged bumper(s)",
    es: "Parachoques dañado(s)",
    pt: "Para-choques danificado(s)",
    de: "Stoßstange(n) beschädigt",
  },
  { title: "Autres", fr: "Pneus défectueux", en: "Defective tires", es: "Neumáticos defectuosos", pt: "Pneus com defeito", de: "Reifen defekt" },
  {
    title: "Autres",
    fr: "Ampoule(s) défectueuse(s)",
    en: "Faulty bulb(s)",
    es: "Bombilla(s) defectuosa(s)",
    pt: "Lâmpada(s) com defeito",
    de: "Lampe(n) defekt",
  },
  { title: "Autres", fr: "Pare-brise cassé", en: "Cracked windshield", es: "Parabrisas roto", pt: "Para-brisas rachado", de: "Windschutzscheibe gesprungen" },
  { title: "Intérieur", fr: "Intérieur propre", en: "Interior clean", es: "Interior limpio", pt: "Interior limpo", de: "Innenraum sauber" },
  { title: "Intérieur", fr: "Intérieur sale", en: "Interior dirty", es: "Interior sucio", pt: "Interior sujo", de: "Innenraum schmutzig" },
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
    });
  });
});

DAMAGE_EXTRA.forEach((d) => addDamageTag(d.title, d));

export function trDamageTag(tag: string, lang: Lang): string {
  return tr(tag, DAMAGE_TAG_TR, lang);
}
