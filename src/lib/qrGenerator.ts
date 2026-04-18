import QRCode from "qrcode";
import jsPDF from "jspdf";

export interface QrCardData {
  name: string;
  specialty?: string | null;
  url: string;
  facultyLine: string;
}

export const generateQrPng = async (url: string, size = 1024): Promise<string> => {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: size,
    color: { dark: "#0a2540", light: "#ffffff" },
  });
};

export const downloadQrPng = async (url: string, fileName: string) => {
  const dataUrl = await generateQrPng(url, 1024);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${fileName}.png`;
  a.click();
};

/** Print-ready QR card (A6 portrait) with name & QR */
export const downloadQrCardPdf = async (data: QrCardData, fileName: string) => {
  const qrDataUrl = await generateQrPng(data.url, 1024);
  // A6 = 105 x 148 mm
  const pdf = new jsPDF({ unit: "mm", format: "a6", orientation: "portrait" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Top brand band
  pdf.setFillColor(20, 50, 100);
  pdf.rect(0, 0, w, 18, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(data.facultyLine, w / 2, 11, { align: "center" });

  // Render Arabic name via canvas
  const nameImg = await renderTextToImage(data.name, 28, "bold", 600, "#0a2540", "rtl");
  const nameMmW = 75;
  const nameMmH = (nameImg.naturalHeight / nameImg.naturalWidth) * nameMmW;
  pdf.addImage(nameImg.dataUrl, "PNG", (w - nameMmW) / 2, 24, nameMmW, nameMmH);

  if (data.specialty) {
    const specImg = await renderTextToImage(data.specialty, 18, "normal", 600, "#26828e", "rtl");
    const specH = (specImg.naturalHeight / specImg.naturalWidth) * 70;
    pdf.addImage(specImg.dataUrl, "PNG", (w - 70) / 2, 24 + nameMmH + 2, 70, specH);
  }

  // QR
  const qrSize = 65;
  pdf.addImage(qrDataUrl, "PNG", (w - qrSize) / 2, h - qrSize - 22, qrSize, qrSize);

  // URL caption
  pdf.setTextColor(110, 120, 135);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.url, w / 2, h - 12, { align: "center" });

  // Footer line
  pdf.setDrawColor(38, 130, 142);
  pdf.setLineWidth(0.5);
  pdf.line(15, h - 8, w - 15, h - 8);
  pdf.setFontSize(7);
  pdf.setTextColor(38, 130, 142);
  pdf.text("Injaz Academy", w / 2, h - 4, { align: "center" });

  pdf.save(`QR-${fileName}.pdf`);
};

const renderTextToImage = (
  text: string,
  fontPx: number,
  weight: "normal" | "bold",
  maxWidthPx: number,
  color: string,
  dir: "rtl" | "ltr"
): Promise<{ dataUrl: string; naturalWidth: number; naturalHeight: number }> => {
  return new Promise((resolve) => {
    const dpr = 2;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    ctx.font = `${weight} ${fontPx}px "Cairo", "Tahoma", sans-serif`;
    const lineHeight = fontPx * 1.4;
    canvas.width = maxWidthPx * dpr;
    canvas.height = lineHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.font = `${weight} ${fontPx}px "Cairo", "Tahoma", sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.direction = dir;
    ctx.textAlign = "center";
    ctx.fillText(text, maxWidthPx / 2, lineHeight / 2);
    resolve({ dataUrl: canvas.toDataURL("image/png"), naturalWidth: canvas.width, naturalHeight: canvas.height });
  });
};
