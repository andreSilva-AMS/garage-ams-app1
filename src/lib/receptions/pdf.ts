import { jsPDF } from "jspdf";
import { I18N, Lang, trWorkTag, trDamageTag } from "./i18n";

export interface ReceptionPdfInput {
  garageName: string;
  garageAddress: string | null;
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
  signatureDataUrl: string | null;
  extraPhotos: { dataUrl: string; caption: string }[];
  lang: Lang;
}

export function buildReceptionPdf(input: ReceptionPdfInput): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 15;
  let y = margin;
  const t = I18N[input.lang] ?? I18N.fr;
  const c = input.client;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(input.garageName, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`${input.garageAddress ? input.garageAddress + " — " : ""}${t.docTitle}`, margin, y);
  y += 5;
  doc.text(new Date().toLocaleString("fr-CH"), margin, y);
  y += 8;
  if (input.garageLogoDataUrl) {
    try {
      doc.addImage(input.garageLogoDataUrl, 210 - margin - 16, margin - 9, 16, 16);
    } catch {
      // logo illisible (format non supporté) : on continue sans bloquer la génération
    }
  }
  doc.setDrawColor(210);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t.clientVehicle, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const lines: [string, string][] = [
    [t.name, c.name],
    [t.phone, c.phone || t.none],
    [t.email, c.email || t.none],
    [t.vehicle, c.brandModel || t.none],
    [t.plate, c.plate],
    [t.mileage, `${c.mileage || t.none} ${t.km}`],
  ];
  lines.forEach(([k, v]) => {
    doc.setTextColor(120);
    doc.text(`${k} :`, margin, y);
    doc.setTextColor(20);
    doc.text(String(v), margin + 48, y);
    y += 6;
  });
  y += 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text(t.workRequested, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const work =
    [
      ...input.workTags.map((w) => trWorkTag(w, input.lang)),
      ...(input.workText ? [input.workText] : []),
    ].join(" · ") || t.none;
  const workLines = doc.splitTextToSize(work, 210 - 2 * margin);
  doc.text(workLines, margin, y);
  y += workLines.length * 5.5 + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(t.vehicleState, margin, y);
  y += 5;
  const photoOrder: ["front" | "back" | "left" | "right", string][] = [
    ["front", t.photoLabels.front],
    ["back", t.photoLabels.back],
    ["left", t.photoLabels.left],
    ["right", t.photoLabels.right],
  ];
  const pw = (210 - 2 * margin - 9) / 4;
  const ph = pw * 0.75;
  photoOrder.forEach(([k, label], i) => {
    const x = margin + i * (pw + 3);
    const url = input.photos[k];
    if (url) doc.addImage(url, "JPEG", x, y, pw, ph);
    doc.setFontSize(7.5);
    doc.setTextColor(110);
    doc.text(label, x, y + ph + 4);
  });
  y += ph + 10;

  const damage = [
    ...input.damageTags.map((d) => trDamageTag(d, input.lang)),
    ...(input.damageText ? [input.damageText] : []),
  ].join(" · ");
  if (damage) {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(t.damageNoted, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(180, 60, 40);
    const dLines = doc.splitTextToSize(damage, 210 - 2 * margin);
    doc.text(dLines, margin, y);
    y += dLines.length * 5.5 + 6;
    doc.setTextColor(20);
  }

  if (input.cardGreyDataUrl) {
    if (y > 230) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(t.cardGrey, margin, y);
    y += 5;
    doc.addImage(input.cardGreyDataUrl, "JPEG", margin, y, 70, 52.5);
    y += 58;
  }

  if (y > 230) {
    doc.addPage();
    y = margin;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text(t.signature, margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  const cLines = doc.splitTextToSize(t.consent, 210 - 2 * margin);
  doc.text(cLines, margin, y);
  y += cLines.length * 4.2 + 4;
  if (input.signatureDataUrl) doc.addImage(input.signatureDataUrl, "JPEG", margin, y, 60, 30);
  y += 34;
  doc.setFontSize(9);
  doc.setTextColor(20);
  doc.text(`${t.signedOn} ${new Date().toLocaleDateString("fr-CH")}`, margin, y);

  if (input.extraPhotos.length > 0) {
    const cols = 2;
    const perPage = 6;
    const gap = 6;
    const cellW = (210 - 2 * margin - gap) / cols;
    const cellH = cellW * 0.75;
    const rowH = cellH + 14;

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

  return doc;
}
