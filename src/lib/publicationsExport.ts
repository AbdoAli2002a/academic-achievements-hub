import type { Publication } from "@/lib/api";

export interface ExportRatings {
  get(id: string): { average: number; count: number } | undefined;
}

export interface ExportContext {
  isAr: boolean;
  ownerName?: string;
  filters: {
    query: string;
    type: string;
    sort: string;
  };
  labels: {
    pdfTitle: string;
    pdfMember: string;
    pdfFilters: string;
    pdfGeneratedAt: string;
    colTitle: string;
    colYear: string;
    colType: string;
    colJournal: string;
    colCitations: string;
    colRating: string;
    colUrl: string;
    typeLabel: (t: string) => string;
    sortLabel: string;
    typeFilterLabel: string;
    searchLabel: string;
  };
}

const sanitizeFilename = (s: string) =>
  s.replace(/[^\p{L}\p{N}_\-]+/gu, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "publications";

const escapeCsvCell = (val: unknown) => {
  if (val === null || val === undefined) return "";
  const s = String(val).replace(/\r?\n/g, " ").trim();
  if (/[",;\n\r\t]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const titleOf = (p: Publication, isAr: boolean) =>
  isAr ? p.title_ar || p.title_en || "" : p.title_en || p.title_ar || "";

const journalOf = (p: Publication) =>
  [p.journal_name, p.publisher].filter(Boolean).join(" — ");

// Audit report returned to caller after CSV generation
export interface CsvAudit {
  rowCount: number;
  byteSize: number;
  hasArabic: boolean;
  hasNonAscii: boolean;
  hasSymbols: boolean;
  encoding: "utf-8";
  hasBom: boolean;
}

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
// Common symbol/dingbat/emoji blocks
const SYMBOL_RE =
  /[\u2010-\u206F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u;

export const exportPublicationsCsv = (
  pubs: Publication[],
  ratings: ExportRatings | undefined,
  ctx: ExportContext,
  scope: "all" | "page" = "all",
): CsvAudit => {
  const { labels, isAr, ownerName } = ctx;
  const headers = [
    labels.colTitle,
    labels.colYear,
    labels.colType,
    labels.colJournal,
    labels.colCitations,
    labels.colRating,
    labels.colUrl,
  ];

  const rows = pubs.map((p) => {
    const r = ratings?.get(p.id);
    const ratingStr = r && r.count > 0 ? `${r.average.toFixed(1)} (${r.count})` : "";
    return [
      titleOf(p, isAr),
      p.publication_year ?? "",
      labels.typeLabel(p.type),
      journalOf(p),
      p.citations_count ?? 0,
      ratingStr,
      p.url ?? "",
    ];
  });

  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(","));
  const body = lines.join("\r\n") + "\r\n";

  // Encoding audit BEFORE prepending BOM
  const hasArabic = ARABIC_RE.test(body);
  const hasSymbols = SYMBOL_RE.test(body);
  // eslint-disable-next-line no-control-regex
  const hasNonAscii = /[^\x00-\x7F]/.test(body);

  // Always emit UTF-8 with BOM so Excel auto-detects encoding for Arabic/symbols
  const BOM = "\uFEFF";
  const encoder = new TextEncoder(); // always produces valid UTF-8 bytes
  const bytes = encoder.encode(BOM + body);
  const blob = new Blob([bytes], { type: "text/csv;charset=utf-8" });

  const scopeTag = scope === "page" ? "page" : "all";
  const base = ownerName ? `publications_${ownerName}_${scopeTag}` : `publications_${scopeTag}`;
  triggerDownload(blob, `${sanitizeFilename(base)}.csv`);

  return {
    rowCount: rows.length,
    byteSize: bytes.byteLength,
    hasArabic,
    hasNonAscii,
    hasSymbols,
    encoding: "utf-8",
    hasBom: true,
  };
};

const escapeHtml = (s: unknown) => {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const exportPublicationsPdf = (
  pubs: Publication[],
  ratings: ExportRatings | undefined,
  ctx: ExportContext,
  scope: "all" | "page" = "all",
) => {
  const { labels, isAr, ownerName, filters } = ctx;
  const dir = isAr ? "rtl" : "ltr";
  const lang = isAr ? "ar" : "en";
  const now = new Date().toLocaleString(isAr ? "ar-EG" : "en-US");

  const filterChips: string[] = [];
  if (filters.query.trim()) filterChips.push(`${labels.searchLabel}: "${escapeHtml(filters.query.trim())}"`);
  filterChips.push(`${labels.typeFilterLabel}: ${escapeHtml(filters.type)}`);
  filterChips.push(`${labels.sortLabel}: ${escapeHtml(filters.sort)}`);

  const rowsHtml = pubs
    .map((p) => {
      const r = ratings?.get(p.id);
      const ratingStr = r && r.count > 0 ? `${r.average.toFixed(1)} (${r.count})` : "—";
      const urlCell = p.url
        ? `<a href="${escapeHtml(p.url)}">${escapeHtml(p.url)}</a>`
        : "—";
      return `<tr>
        <td>${escapeHtml(titleOf(p, isAr))}</td>
        <td class="num">${escapeHtml(p.publication_year ?? "")}</td>
        <td>${escapeHtml(labels.typeLabel(p.type))}</td>
        <td>${escapeHtml(journalOf(p)) || "—"}</td>
        <td class="num">${escapeHtml(p.citations_count ?? 0)}</td>
        <td class="num">${escapeHtml(ratingStr)}</td>
        <td class="url">${urlCell}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(labels.pdfTitle)}${ownerName ? " — " + escapeHtml(ownerName) : ""}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", "Tahoma", "Arial", sans-serif;
    color: #111;
    margin: 0;
    padding: 16px;
    direction: ${dir};
    line-height: 1.45;
  }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { font-size: 11px; color: #555; margin-bottom: 4px; }
  .filters { font-size: 11px; color: #333; margin-bottom: 12px; }
  .filters span { display: inline-block; background: #f1f5f9; border-radius: 999px; padding: 2px 8px; margin: 0 2px 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #d4d4d8; padding: 6px 8px; vertical-align: top; text-align: ${isAr ? "right" : "left"}; word-wrap: break-word; }
  th { background: #f4f4f5; font-weight: 600; }
  td.num { text-align: center; white-space: nowrap; }
  td.url { font-size: 10px; word-break: break-all; max-width: 180px; }
  td.url a { color: #1d4ed8; text-decoration: none; }
  tr { page-break-inside: avoid; }
  .footer { margin-top: 12px; font-size: 10px; color: #777; text-align: center; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>${escapeHtml(labels.pdfTitle)}</h1>
  ${ownerName ? `<div class="meta"><strong>${escapeHtml(labels.pdfMember)}:</strong> ${escapeHtml(ownerName)}</div>` : ""}
  <div class="meta"><strong>${escapeHtml(labels.pdfGeneratedAt)}:</strong> ${escapeHtml(now)} — ${pubs.length}</div>
  <div class="filters"><strong>${escapeHtml(labels.pdfFilters)}:</strong> ${filterChips.map((c) => `<span>${c}</span>`).join("")}</div>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(labels.colTitle)}</th>
        <th>${escapeHtml(labels.colYear)}</th>
        <th>${escapeHtml(labels.colType)}</th>
        <th>${escapeHtml(labels.colJournal)}</th>
        <th>${escapeHtml(labels.colCitations)}</th>
        <th>${escapeHtml(labels.colRating)}</th>
        <th>${escapeHtml(labels.colUrl)}</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    });
    window.addEventListener("afterprint", function () { window.close(); });
  </script>
</body>
</html>`;

  const scopeTag = scope === "page" ? "page" : "all";
  const baseName = ownerName ? `publications_${ownerName}_${scopeTag}` : `publications_${scopeTag}`;
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) {
    // Popup blocked — fallback: download as .html so user can open & print
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    triggerDownload(blob, `${sanitizeFilename(baseName)}.html`);
    return false;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
};
