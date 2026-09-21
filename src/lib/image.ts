export interface ResizedImage {
  blob: Blob;
  dataUrl: string;
}

export function fileToResizedImage(
  file: File | Blob,
  maxDim: number,
  quality: number,
): Promise<ResizedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Impossible de traiter l'image"));
              return;
            }
            resolve({ blob, dataUrl: canvas.toDataURL("image/jpeg", quality) });
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface ProcessedLogo {
  blob: Blob;
  dataUrl: string;
}

const LOGO_SIZE = 256;
// Un pixel compte comme "marge vide" s'il est transparent, ou presque blanc
// (léger anti-crénelage autour d'un logo détouré sur fond blanc).
const LOGO_WHITE_THRESHOLD = 250;

/**
 * Rogne les marges vides (transparentes ou blanches) autour du logo, le
 * recadre dans un carré (contenu centré, complété par de la transparence si
 * besoin), puis redimensionne à 256×256 px. Le PDF (zone carrée fixe) et le
 * bandeau (conteneur `object-contain` de 40 px) affichent ensuite ce même
 * fichier sans qu'aucun des deux n'ait besoin de sa propre logique de recadrage.
 */
export function cropLogoToSquare(file: File | Blob): Promise<ProcessedLogo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const { width, height } = img;
        const source = document.createElement("canvas");
        source.width = width;
        source.height = height;
        const sctx = source.getContext("2d")!;
        sctx.drawImage(img, 0, 0);

        let minX = width;
        let minY = height;
        let maxX = -1;
        let maxY = -1;
        const { data } = sctx.getImageData(0, 0, width, height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const a = data[i + 3];
            const isEmpty =
              a === 0 ||
              (data[i] >= LOGO_WHITE_THRESHOLD &&
                data[i + 1] >= LOGO_WHITE_THRESHOLD &&
                data[i + 2] >= LOGO_WHITE_THRESHOLD);
            if (!isEmpty) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        // Rien détecté (image entièrement vide) : on garde l'image d'origine
        // plutôt que de produire un fichier vide.
        if (maxX < 0) {
          minX = 0;
          minY = 0;
          maxX = width - 1;
          maxY = height - 1;
        }

        const trimmedW = maxX - minX + 1;
        const trimmedH = maxY - minY + 1;
        const squareSize = Math.max(trimmedW, trimmedH);
        const scale = LOGO_SIZE / squareSize;

        const out = document.createElement("canvas");
        out.width = LOGO_SIZE;
        out.height = LOGO_SIZE;
        const octx = out.getContext("2d")!;
        octx.drawImage(
          source,
          minX,
          minY,
          trimmedW,
          trimmedH,
          ((squareSize - trimmedW) / 2) * scale,
          ((squareSize - trimmedH) / 2) * scale,
          trimmedW * scale,
          trimmedH * scale,
        );

        out.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Impossible de traiter le logo"));
            return;
          }
          resolve({ blob, dataUrl: out.toDataURL("image/png") });
        }, "image/png");
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Redimensionne une data URL déjà en mémoire (ex. signature PNG haute résolution). */
export function shrinkDataUrl(dataUrl: string, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = (height * maxDim) / width;
        width = maxDim;
      } else if (height > maxDim) {
        width = (width * maxDim) / height;
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
