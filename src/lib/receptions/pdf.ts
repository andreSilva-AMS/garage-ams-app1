import { jsPDF } from "jspdf";
import { I18N, Lang, trWorkTag, trDamageTag } from "./i18n";
import { formatGarageDateTime } from "@/lib/timezone";

export interface ReceptionPdfInput {
  receptionNumber: number;
  garageName: string;
  garageAddress: string | null;
  garagePhone: string | null;
  garageEmail: string | null;
  garageLogoDataUrl?: string | null;
  client: {
    name: string;
    phone: string;
    email: string;
    plate: string;
    mileage: string;
    brandModel: string;
  };
  workTags: string[];
  workText: string;
  damageTags: string[];
  damageText: string;
  photos: Partial<Record<"front" | "back" | "left" | "right", string>>;
  cardGreyDataUrl: string | null;
  dashboardPhotoDataUrl: string | null;
  fuelLevel: string | null;
  signatureDataUrl: string | null;
  extraPhotos: { dataUrl: string; caption: string }[];
  lang: Lang;
  timezone: string;
}

const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;

export function buildReceptionPdf(input: ReceptionPdfInput): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 15;
  const contentWidth = PAGE_WIDTH - 2 * margin;
  let y = margin;
  const t = I18N[input.lang] ?? I18N.fr;
  const c = input.client;

  // S'assure qu'il reste au moins `needed` mm avant le bas de page ; sinon
  // démarre une nouvelle page. Appelé avant chaque titre de section pour ne
  // jamais laisser un titre collé en bas de page, seul, sans son contenu.
  function ensureSpace(needed: number) {
    if (y + needed > PAGE_HEIGHT - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function sectionTitle(label: string) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(label, margin, y);
    y += 7;
  }

  // ---------------------------------------------------------------------
  // En-tête : logo, garage, coordonnées, date/heure. Le titre du document
  // et le numéro de fiche sont reportés en pied de page (voir plus bas).
  // ---------------------------------------------------------------------
  const numberLabel = `${t.receptionNumberLabel} ${String(input.receptionNumber).padStart(6, "0")}`;

  if (input.garageLogoDataUrl) {
    try {
      doc.addImage(input.garageLogoDataUrl, PAGE_WIDTH - margin - 20, y, 20, 20);
    } catch {
      // logo illisible (format non supporté) : on continue sans bloquer la génération
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20);
  doc.text(input.garageName, margin, y + 5);
  y += 11;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  const contactBits = [
    input.garageAddress,
    input.garagePhone ? `${t.phone} : ${input.garagePhone}` : null,
    input.garageEmail,
  ].filter(Boolean);
  if (contactBits.length > 0) {
    doc.text(contactBits.join("  ·  "), margin, y);
    y += 5;
  }
  doc.text(formatGarageDateTime(new Date(), input.timezone), margin, y);
  y += 8;
  doc.setDrawColor(210);
  doc.line(margin, y, PAGE_WIDTH - margin, y);
  y += 8;

  // ---------------------------------------------------------------------
  // Client & véhicule
  // ---------------------------------------------------------------------
  sectionTitle(t.clientVehicle);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const lines: [string, string][] = [
    [t.name, c.name],
    [t.phone, c.phone || t.none],
    [t.email, c.email || t.none],
    [t.vehicle, c.brandModel || t.none],
    [t.plate, c.plate],
    [t.mileage, `${c.mileage || t.none} ${t.km}`],
    [t.fuelLevelLabel, input.fuelLevel ? t.fuelLevels[input.fuelLevel as keyof typeof t.fuelLevels] : t.none],
  ];
  lines.forEach(([k, v]) => {
    doc.setTextColor(120);
    doc.text(`${k} :`, margin, y);
    doc.setTextColor(20);
    doc.text(String(v), margin + 48, y);
    y += 6;
  });
  y += 2;

  // ---------------------------------------------------------------------
  // Travaux demandés
  // ---------------------------------------------------------------------
  sectionTitle(t.workRequested);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(20);
  const work =
    [
      ...input.workTags.map((w) => trWorkTag(w, input.lang)),
      ...(input.workText ? [input.workText] : []),
    ].join(" · ") || t.none;
  const workLines = doc.splitTextToSize(work, contentWidth);
  doc.text(workLines, margin, y);
  y += workLines.length * 5.5 + 5;

  // ---------------------------------------------------------------------
  // État du véhicule : grille 2×2 des 4 angles (plus grande), photo du
  // tableau de bord, carte grise (plus petite).
  // ---------------------------------------------------------------------
  sectionTitle(t.vehicleState);
  const photoOrder: ["front" | "back" | "left" | "right", string][] = [
    ["front", t.photoLabels.front],
    ["back", t.photoLabels.back],
    ["left", t.photoLabels.left],
    ["right", t.photoLabels.right],
  ];
  const gridGap = 6;
  const cellW = (contentWidth - gridGap) / 2;
  const cellH = cellW * 0.72;
  ensureSpace(2 * cellH + 2 * 6 + 4);
  photoOrder.forEach(([k, label], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (cellW + gridGap);
    const cellY = y + row * (cellH + 6);
    const url = input.photos[k];
    if (url) doc.addImage(url, "JPEG", x, cellY, cellW, cellH);
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(label, x, cellY + cellH + 4);
  });
  y += 2 * cellH + 6 + 8;

  // Tableau de bord + carte grise, côte à côte (petit format).
  const smallW = (contentWidth - gridGap) / 2;
  const smallH = smallW * 0.75;
  if (input.dashboardPhotoDataUrl || input.cardGreyDataUrl) {
    ensureSpace(smallH + 12);
    if (input.dashboardPhotoDataUrl) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20);
      doc.text(t.dashboardPhotoLabel, margin, y);
      doc.addImage(input.dashboardPhotoDataUrl, "JPEG", margin, y + 2, smallW, smallH);
    }
    if (input.cardGreyDataUrl) {
      const x = margin + smallW + gridGap;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(20);
      doc.text(t.cardGrey, x, y);
      doc.addImage(input.cardGreyDataUrl, "JPEG", x, y + 2, smallW, smallH);
    }
    y += smallH + 12;
  }

  // ---------------------------------------------------------------------
  // Dommages constatés — toujours affiché, même vide.
  // ---------------------------------------------------------------------
  sectionTitle(t.damageNoted);
  const damage = [
    ...input.damageTags.map((d) => trDamageTag(d, input.lang)),
    ...(input.damageText ? [input.damageText] : []),
  ].join(" · ");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  if (damage) {
    doc.setTextColor(180, 60, 40);
    const dLines = doc.splitTextToSize(damage, contentWidth);
    doc.text(dLines, margin, y);
    y += dLines.length * 5.5 + 6;
  } else {
    doc.setTextColor(90);
    doc.text(t.noDamage, margin, y);
    y += 10;
  }
  doc.setTextColor(20);

  // ---------------------------------------------------------------------
  // Signature
  // ---------------------------------------------------------------------
  sectionTitle(t.signature);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  const cLines = doc.splitTextToSize(t.consent, contentWidth);
  doc.text(cLines, margin, y);
  y += cLines.length * 4.2 + 4;
  ensureSpace(36);
  if (input.signatureDataUrl) doc.addImage(input.signatureDataUrl, "JPEG", margin, y, 60, 30);
  y += 36;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text(c.name, margin, y);
  y += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  doc.text(`${t.signedOn} ${formatGarageDateTime(new Date(), input.timezone)}`, margin, y);

  // ---------------------------------------------------------------------
  // Photos supplémentaires (une page dédiée par lot)
  // ---------------------------------------------------------------------
  if (input.extraPhotos.length > 0) {
    const cols = 2;
    const perPage = 6;
    const gap = 6;
    const cellW2 = (contentWidth - gap) / cols;
    const cellH2 = cellW2 * 0.75;
    const rowH = cellH2 + 14;

    input.extraPhotos.forEach((photo, i) => {
      const posInPage = i % perPage;
      if (posInPage === 0) {
        doc.addPage();
        y = margin;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(20);
        doc.text(t.extraPhotosTitle, margin, y);
        y += 8;
      }
      const col = posInPage % cols;
      const row = Math.floor(posInPage / cols);
      const x = margin + col * (cellW2 + gap);
      const cellY = y + row * rowH;
      doc.addImage(photo.dataUrl, "JPEG", x, cellY, cellW2, cellH2);
      if (photo.caption) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(90);
        const captionLines = doc.splitTextToSize(photo.caption, cellW2);
        doc.text(captionLines.slice(0, 2), x, cellY + cellH2 + 4);
      }
    });
  }

  // ---------------------------------------------------------------------
  // Pied de page : titre du document + numéro de fiche, sur chaque page.
  // ---------------------------------------------------------------------
  const footerLabel = `${t.docTitle}  ·  ${numberLabel}`;
  const footerY = PAGE_HEIGHT - 10;
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220);
    doc.line(margin, footerY - 4, PAGE_WIDTH - margin, footerY - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(140);
    doc.text(footerLabel, PAGE_WIDTH / 2, footerY, { align: "center" });
  }

  return doc;
}
