import jsPDF from "jspdf";
import type { MemberFullProfile } from "@/lib/api";

// Note: jsPDF default fonts don't support Arabic. We render Arabic via canvas as image
// but for cleanliness here we use bilingual labels in English and embed Arabic content
// pre-rendered as text using the built-in font (which renders Arabic codepoints poorly
// in some cases). The most reliable approach: render the Arabic blocks via an offscreen
// canvas to image, then place them into the PDF.

const COLORS = {
  primary: [20, 50, 100] as [number, number, number],
  accent: [38, 130, 142] as [number, number, number],
  text: [30, 40, 55] as [number, number, number],
  muted: [110, 120, 135] as [number, number, number],
  line: [220, 225, 232] as [number, number, number],
};

const renderArabicLine = (text: string, fontPx: number, weight: "normal" | "bold", maxWidthPx: number, color: string) => {
  const dpr = 2;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${weight} ${fontPx}px "Cairo", "Tahoma", sans-serif`;
  // Measure with line wrapping
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxWidthPx && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);

  const lineHeight = fontPx * 1.6;
  const height = Math.max(lineHeight, lines.length * lineHeight);
  canvas.width = Math.ceil(maxWidthPx * dpr);
  canvas.height = Math.ceil(height * dpr);
  ctx.scale(dpr, dpr);
  ctx.font = `${weight} ${fontPx}px "Cairo", "Tahoma", sans-serif`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  lines.forEach((line, i) => {
    ctx.fillText(line, maxWidthPx, i * lineHeight);
  });
  return { dataUrl: canvas.toDataURL("image/png"), heightMm: (height / 96) * 25.4 };
};

export const generateCV = async (member: MemberFullProfile, lang: "ar" | "en" = "ar") => {
  const isAr = lang === "ar";
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ===== Header bar =====
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageW, 45, "F");

  // Avatar circle (right side for AR, left for EN)
  const avatarSize = 28;
  const avatarX = isAr ? pageW - margin - avatarSize : margin;

  if (member.avatar_url) {
    try {
      const img = await loadImage(member.avatar_url);
      // Draw circle clip via canvas
      const c = document.createElement("canvas");
      c.width = 200;
      c.height = 200;
      const cx = c.getContext("2d")!;
      cx.beginPath();
      cx.arc(100, 100, 100, 0, Math.PI * 2);
      cx.closePath();
      cx.clip();
      cx.drawImage(img, 0, 0, 200, 200);
      pdf.addImage(c.toDataURL("image/png"), "PNG", avatarX, 8, avatarSize, avatarSize);
    } catch {
      drawInitialsCircle(pdf, avatarX, 8, avatarSize, member.initials || "؟");
    }
  } else {
    drawInitialsCircle(pdf, avatarX, 8, avatarSize, member.initials || "؟");
  }

  // Name + specialty next to avatar
  const name = isAr ? member.name_ar : (member.name_en || member.name_ar);
  const specialty = isAr ? member.specialty_ar : (member.specialty_en || member.specialty_ar);
  const deptName = member.department ? (isAr ? member.department.name_ar : member.department.name_en) : "";

  const textX = isAr ? margin : margin + avatarSize + 6;
  const textW = contentW - avatarSize - 6;

  if (isAr) {
    const nameImg = renderArabicLine(name, 26, "bold", textW * 3.78, "#ffffff");
    pdf.addImage(nameImg.dataUrl, "PNG", textX, 12, textW, nameImg.heightMm);
    if (specialty) {
      const specImg = renderArabicLine(specialty, 14, "normal", textW * 3.78, "rgba(255,255,255,0.9)");
      pdf.addImage(specImg.dataUrl, "PNG", textX, 24, textW, specImg.heightMm);
    }
    if (deptName) {
      const dImg = renderArabicLine(deptName, 11, "normal", textW * 3.78, "rgba(255,255,255,0.75)");
      pdf.addImage(dImg.dataUrl, "PNG", textX, 34, textW, dImg.heightMm);
    }
  } else {
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(name || "", textX, 18);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    if (specialty) pdf.text(specialty, textX, 26);
    if (deptName) pdf.text(deptName, textX, 33);
  }

  y = 55;

  // ===== Contact strip =====
  pdf.setTextColor(...COLORS.muted);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  const contactParts: string[] = [];
  if (member.email) contactParts.push(`✉ ${member.email}`);
  if (member.phone) contactParts.push(`☎ ${member.phone}`);
  if (member.website_url) contactParts.push(`🌐 ${member.website_url}`);
  pdf.text(contactParts.join("    "), pageW / 2, y, { align: "center" });
  y += 5;
  pdf.setDrawColor(...COLORS.line);
  pdf.line(margin, y, pageW - margin, y);
  y += 8;

  // ===== Sections =====
  const renderSection = async (titleAr: string, titleEn: string, render: () => Promise<number>) => {
    if (y > pageH - 30) {
      pdf.addPage();
      y = margin;
    }
    pdf.setFillColor(...COLORS.accent);
    pdf.rect(isAr ? pageW - margin - 1.5 : margin, y - 4, 1.5, 6, "F");
    if (isAr) {
      const t = renderArabicLine(titleAr, 14, "bold", contentW * 3.78, `rgb(${COLORS.primary.join(",")})`);
      pdf.addImage(t.dataUrl, "PNG", margin, y - 4, contentW, t.heightMm);
    } else {
      pdf.setTextColor(...COLORS.primary);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text(titleEn, margin + 4, y);
    }
    y += 7;
    const usedH = await render();
    y += usedH + 4;
  };

  // Bio
  const bio = isAr ? member.bio_ar : (member.bio_en || member.bio_ar);
  if (bio) {
    await renderSection("نبذة شخصية", "Biography", async () => {
      if (isAr) {
        const img = renderArabicLine(bio, 11, "normal", contentW * 3.78, `rgb(${COLORS.text.join(",")})`);
        if (y + img.heightMm > pageH - margin) { pdf.addPage(); y = margin; }
        pdf.addImage(img.dataUrl, "PNG", margin, y, contentW, img.heightMm);
        return img.heightMm;
      } else {
        pdf.setTextColor(...COLORS.text);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const lines = pdf.splitTextToSize(bio, contentW);
        pdf.text(lines, margin, y + 4);
        return lines.length * 5;
      }
    });
  }

  // Publications
  if (member.publications.length) {
    await renderSection("الإنتاج العلمي", "Publications", async () => {
      let used = 0;
      for (const p of member.publications) {
        const title = isAr ? p.title_ar : (p.title_en || p.title_ar);
        const meta = `${p.publication_year} · ${p.journal_name || p.publisher || ""}`;
        if (y + used > pageH - 25) { pdf.addPage(); y = margin; used = 0; }
        if (isAr) {
          const tImg = renderArabicLine(`• ${title}`, 11, "bold", contentW * 3.78, `rgb(${COLORS.text.join(",")})`);
          pdf.addImage(tImg.dataUrl, "PNG", margin, y + used, contentW, tImg.heightMm);
          used += tImg.heightMm;
        } else {
          pdf.setTextColor(...COLORS.text);
          pdf.setFont("helvetica", "bold"); pdf.setFontSize(10);
          const tl = pdf.splitTextToSize(`• ${title}`, contentW);
          pdf.text(tl, margin, y + used + 4);
          used += tl.length * 5;
        }
        pdf.setTextColor(...COLORS.muted); pdf.setFontSize(9); pdf.setFont("helvetica", "italic");
        pdf.text(meta, isAr ? pageW - margin : margin + 3, y + used + 1, { align: isAr ? "right" : "left" });
        used += 5;
      }
      return used;
    });
  }

  // Awards
  if (member.awards.length) {
    await renderSection("الجوائز والتكريم", "Awards & Honors", async () => {
      let used = 0;
      for (const a of member.awards) {
        const title = isAr ? a.title_ar : (a.title_en || a.title_ar);
        if (y + used > pageH - 20) { pdf.addPage(); y = margin; used = 0; }
        if (isAr) {
          const tImg = renderArabicLine(`★ ${title} (${a.year}) — ${a.granting_body}`, 11, "normal", contentW * 3.78, `rgb(${COLORS.text.join(",")})`);
          pdf.addImage(tImg.dataUrl, "PNG", margin, y + used, contentW, tImg.heightMm);
          used += tImg.heightMm + 1;
        } else {
          pdf.setTextColor(...COLORS.text); pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
          pdf.text(`★ ${title} (${a.year}) — ${a.granting_body}`, margin, y + used + 4);
          used += 6;
        }
      }
      return used;
    });
  }

  // Certificates
  if (member.certificates.length) {
    await renderSection("الشهادات", "Certificates", async () => {
      let used = 0;
      for (const c of member.certificates) {
        const title = isAr ? c.title_ar : (c.title_en || c.title_ar);
        if (y + used > pageH - 20) { pdf.addPage(); y = margin; used = 0; }
        if (isAr) {
          const tImg = renderArabicLine(`◆ ${title} — ${c.issuer} (${c.year})`, 11, "normal", contentW * 3.78, `rgb(${COLORS.text.join(",")})`);
          pdf.addImage(tImg.dataUrl, "PNG", margin, y + used, contentW, tImg.heightMm);
          used += tImg.heightMm + 1;
        } else {
          pdf.setTextColor(...COLORS.text); pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
          pdf.text(`◆ ${title} — ${c.issuer} (${c.year})`, margin, y + used + 4);
          used += 6;
        }
      }
      return used;
    });
  }

  // Footer
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setTextColor(...COLORS.muted);
    pdf.setFontSize(8);
    pdf.text(`${i} / ${total}`, pageW / 2, pageH - 8, { align: "center" });
    pdf.text(isAr ? "منصة إنجاز الأكاديمية" : "Injaz Academy Platform", margin, pageH - 8);
  }

  pdf.save(`CV-${(member.name_en || member.name_ar || "member").replace(/\s+/g, "_")}.pdf`);
};

const drawInitialsCircle = (pdf: jsPDF, x: number, y: number, size: number, initials: string) => {
  pdf.setFillColor(255, 255, 255);
  pdf.circle(x + size / 2, y + size / 2, size / 2, "F");
  pdf.setTextColor(...COLORS.primary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(initials, x + size / 2, y + size / 2 + 2, { align: "center" });
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
