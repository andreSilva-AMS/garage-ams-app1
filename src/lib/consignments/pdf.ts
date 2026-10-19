import { jsPDF } from "jspdf";
import { I18N, Lang } from "./i18n";
import { trDamageTag } from "@/lib/receptions/i18n";
import { formatGarageDateTime } from "@/lib/timezone";

export interface ConsignmentPdfInput {
  dossierNumber: number;
  garageName: string;
  garageAddress: string | null;
  garagePhone: string | null;
  garageEmail: string | null;
  garageLogoDataUrl?: string | null;
  owner: {
    name: string;
    phone: string;
    email: string;
  };
  vehicle: {
    plate: string;
    mileage: string;
    brandModel: string;
  };
  leasingFree: boolean;
  lastInspectionDate: string | null;
  keysCount: string;
  damageTags: string[];
  damageText: string;
  askingPrice: string;
  minimumPrice: string;
  commissionAmount: string;
  commissionPercent: string;
  depositDurationDays: string;
  insuredBy: string;
  signatureOwnerDataUrl: string | null;
  signatureSellerDataUrl: string | null;
  marketingPhotos: { dataUrl: string; caption: string }[];
  maintenancePhotos: { dataUrl: string; caption: string }[];
  lang: Lang;
  timezone: string;
}

const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;

export function buildConsignmentPdf(input: ConsignmentPdfInput): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 15;
  const contentWidth = PAGE_WIDTH - 2 * margin;
  let y = margin;
  const t = I18N[input.lang] ?? I18N.fr;

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

  function kv(lines: [string, string][]) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    lines.forEach(([k, v]) => {
      doc.setTextColor(120);
      doc.text(`${k} :`, margin, y);
      doc.setTextColor(20);
      doc.text(String(v), margin + 55, y);
      y += 6;
    });
    y += 2;
  }

  const numberLabel = `${t.dossierNumberLabel} ${String(input.dossierNumber).padStart(6, "0")}`;

  if (input.garageLogoDataUrl) {
    try {
      doc.addImage(input.garageLogoDataUrl, PAGE_WIDTH - margin - 20, y, 20, 20);
    } catch {
      // logo illisible : on continue sans bloquer la génération
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
    input.garagePhone ? `${t.ownerPhone} : ${input.garagePhone}` : null,
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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text(t.docTitle, margin, y);
  y += 9;

  sectionTitle(t.ownerSection);
  kv([
    [t.ownerName, input.owner.name],
    [t.ownerPhone, input.owner.phone || t.none],
    [t.ownerEmail, input.owner.email || t.none],
  ]);

  sectionTitle(t.vehicleSection);
  kv([
    [t.vehicle, input.vehicle.brandModel || t.none],
    [t.plate, input.vehicle.plate],
    [t.mileage, `${input.vehicle.mileage || t.none} ${t.km}`],
    [t.leasingLabel, input.leasingFree ? t.leasingFree : t.leasingNotFree],
    [
      t.lastInspection,
      input.lastInspectionDate ? formatGarageDateTime(new Date(input.lastInspectionDate), input.timezone) : t.none,
    ],
    [t.keysCount, input.keysCount || t.none],
  ]);

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

  sectionTitle(t.commercialSection);
  const commission =
    input.commissionAmount || input.commissionPercent
      ? [input.commissionAmount, input.commissionPercent ? `${input.commissionPercent}%` : null]
          .filter(Boolean)
          .join(" / ")
      : t.none;
  kv([
    [t.askingPrice, input.askingPrice || t.none],
    [t.minimumPrice, input.minimumPrice || t.none],
    [t.commission, commission],
    [t.depositDuration, input.depositDurationDays ? `${input.depositDurationDays} ${t.days}` : t.none],
    [t.insuredBy, input.insuredBy || t.none],
  ]);

  // ---------------------------------------------------------------------
  // Consentement + deux signatures côte à côte.
  // ---------------------------------------------------------------------
  ensureSpace(50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  const cLines = doc.splitTextToSize(t.consent, contentWidth);
  doc.text(cLines, margin, y);
  y += cLines.length * 4.2 + 6;

  ensureSpace(40);
  const sigW = (contentWidth - 10) / 2;
  if (input.signatureOwnerDataUrl) doc.addImage(input.signatureOwnerDataUrl, "JPEG", margin, y, sigW, 28);
  if (input.signatureSellerDataUrl)
    doc.addImage(input.signatureSellerDataUrl, "JPEG", margin + sigW + 10, y, sigW, 28);
  y += 32;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  doc.text(`${t.signatureOwner} — ${t.signedOn} ${formatGarageDateTime(new Date(), input.timezone)}`, margin, y);
  doc.text(t.signatureSeller, margin + sigW + 10, y);

  // ---------------------------------------------------------------------
  // Photos annexées (annonce puis carnet d'entretien), une page dédiée.
  // ---------------------------------------------------------------------
  function photoAppendix(title: string, photos: { dataUrl: string; caption: string }[]) {
    if (photos.length === 0) return;
    const cols = 2;
    const perPage = 6;
    const gap = 6;
    const cellW = (contentWidth - gap) / cols;
    const cellH = cellW * 0.75;
    const rowH = cellH + 14;

    photos.forEach((photo, i) => {
      const posInPage = i % perPage;
      if (posInPage === 0) {
        doc.addPage();
        y = margin;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(20);
        doc.text(title, margin, y);
        y += 8;
      }
      const col = posInPage % cols;
      const row = Math.floor(posInPage / cols);
      const x = margin + col * (cellW + gap);
      const cellY = y + row * rowH;
      doc.addImage(photo.dataUrl, "JPEG", x, cellY, cellW, cellH);
      if (photo.caption) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(90);
        const captionLines = doc.splitTextToSize(photo.caption, cellW);
        doc.text(captionLines.slice(0, 2), x, cellY + cellH + 4);
      }
    });
  }
  photoAppendix(t.marketingPhotosTitle, input.marketingPhotos);
  photoAppendix(t.maintenancePhotosTitle, input.maintenancePhotos);

  // ---------------------------------------------------------------------
  // Pied de page : titre du document + numéro de dossier, sur chaque page.
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
