import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val: number | null | undefined, decimals = 2, unit = "") =>
  val !== null && val !== undefined && !isNaN(Number(val))
    ? `${Number(val).toFixed(decimals)}${unit}`
    : "—";

const fmtDate = (isoString: string | number | Date) =>
  new Date(isoString).toLocaleString("fr-FR");

// ─── Export Excel principal ───────────────────────────────────────────────────

export function generateExcel(reportData) {
  const wb = XLSX.utils.book_new();

  const s = reportData.summary;

  // ── Feuille 1 : Résumé global ────────────────────────────────────────────

  const summaryRows = [
    ["RAPPORT RÉSEAU", `${reportData.period.from} → ${reportData.period.to}`],
    ["Généré le", fmtDate(reportData.generatedAt)],
    [],
    ["RÉSUMÉ GÉNÉRAL", ""],
    ["Total liens",            s.totalLinks],
    ["Liens UP",               s.linksUp],
    ["Liens DOWN",             s.linksDown],
    ["Liens partiels",         s.linksPartial],
    ["Liens avec erreurs",     s.linksWithErrors],
    ["Disponibilité moyenne",  `${fmt(s.avgAvailability)}%`],
    ["Total erreurs cumulées", s.totalErrors],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 35 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé");

  // ── Feuille 2 : Tous les liens ────────────────────────────────────────────

  const linksHeader = [
    ["RAPPORT DES LIENS", `${reportData.period.from} → ${reportData.period.to}`],
    [],
    [
      "Site A",
      "Site B",
      "Liens",
      "BP (Gbps)",
      "Disponibilité (%)",
      "P95 In (Mbps)",
      "P95 Out (Mbps)",
      "Util. P95 In (%)",
      "Util. P95 Out (%)",
      "Utilisation (%)",
      "Moy. In (Mbps)",
      "Moy. Out (Mbps)",
      "Max In (Mbps)",
      "Max Out (Mbps)",
      "Erreurs (In ⇔ Out)",
      "Taux erreur (%)",
      "Statut",
      "Protocole",
    ],
  ];

  const linkRows = reportData.links.map((link) => {
    const pA = link.portA ?? {};
    const pB = link.portB ?? {};

    // P95 — prend le max des deux côtés
    const p95In  = Math.max(pA.p95InMbps  ?? 0, pB.p95InMbps  ?? 0);
    const p95Out = Math.max(pA.p95OutMbps ?? 0, pB.p95OutMbps ?? 0);
    const avgIn  = Math.max(pA.avgInMbps  ?? 0, pB.avgInMbps  ?? 0);
    const avgOut = Math.max(pA.avgOutMbps ?? 0, pB.avgOutMbps ?? 0);
    const maxIn  = Math.max(pA.maxInMbps  ?? 0, pB.maxInMbps  ?? 0);
    const maxOut = Math.max(pA.maxOutMbps ?? 0, pB.maxOutMbps ?? 0);

    // Taux d'erreur
    const errorRate = pA.errorRate ?? pB.errorRate ?? 0;

    const flags = [];
    if (link.status === "DOWN")         flags.push("DOWN");
    if (link.hasErrors)                 flags.push("ERREURS");
    if ((link.utilizationPct ?? 0) >= 80) flags.push(`UTIL ${fmt(link.utilizationPct)}%`);

    return [
      link.siteA,
      link.siteB,
      link.linkLabel,
      link.capacityGbps,
      fmt(link.availability),
      fmt(p95In),
      fmt(p95Out),
      fmt(pA.p95UtilInPct),
      fmt(pA.p95UtilOutPct),
      fmt(link.utilizationPct),
      fmt(avgIn),
      fmt(avgOut),
      fmt(maxIn),
      fmt(maxOut),
      link.errors ?? "0 ⇔ 0",
      fmt(errorRate, 4),
      link.status,
      link.protocol ?? "LLDP",
    ];
  });

  const wsLinks = XLSX.utils.aoa_to_sheet([...linksHeader, ...linkRows]);
  wsLinks["!cols"] = [
    { wch: 12 }, // Site A
    { wch: 12 }, // Site B
    { wch: 55 }, // Liens
    { wch: 12 }, // BP
    { wch: 18 }, // Disponibilité
    { wch: 15 }, // P95 In
    { wch: 15 }, // P95 Out
    { wch: 16 }, // Util In
    { wch: 16 }, // Util Out
    { wch: 15 }, // Utilisation
    { wch: 15 }, // Moy In
    { wch: 15 }, // Moy Out
    { wch: 14 }, // Max In
    { wch: 14 }, // Max Out
    { wch: 16 }, // Erreurs
    { wch: 15 }, // Taux erreur
    { wch: 10 }, // Statut
    { wch: 10 }, // Protocole
  ];
  XLSX.utils.book_append_sheet(wb, wsLinks, "Liens");

  // ── Feuilles 3+ : Une feuille par paire de sites ──────────────────────────

  for (const group of reportData.linksBySitePair ?? []) {
    const sheetName = `${group.siteA}-${group.siteB}`.slice(0, 31);

    const groupHeader = [
      [`${group.siteA} ↔ ${group.siteB}`, `${reportData.period.from} → ${reportData.period.to}`],
      [],
      [
        "Liens",
        "BP (Gbps)",
        "Disponibilité (%)",
        "P95 In (Mbps)",
        "P95 Out (Mbps)",
        "Util. P95 (%)",
        "Moy. In (Mbps)",
        "Moy. Out (Mbps)",
        "Max In (Mbps)",
        "Max Out (Mbps)",
        "Erreurs",
        "Taux erreur (%)",
        "Statut",
      ],
    ];

    const groupRows = group.links.map((link) => {
      const pA = link.portA ?? {};
      const pB = link.portB ?? {};

      const p95In  = Math.max(pA.p95InMbps  ?? 0, pB.p95InMbps  ?? 0);
      const p95Out = Math.max(pA.p95OutMbps ?? 0, pB.p95OutMbps ?? 0);
      const avgIn  = Math.max(pA.avgInMbps  ?? 0, pB.avgInMbps  ?? 0);
      const avgOut = Math.max(pA.avgOutMbps ?? 0, pB.avgOutMbps ?? 0);
      const maxIn  = Math.max(pA.maxInMbps  ?? 0, pB.maxInMbps  ?? 0);
      const maxOut = Math.max(pA.maxOutMbps ?? 0, pB.maxOutMbps ?? 0);
      const errorRate = pA.errorRate ?? pB.errorRate ?? 0;

      return [
        link.linkLabel,
        link.capacityGbps,
        fmt(link.availability),
        fmt(p95In),
        fmt(p95Out),
        fmt(link.utilizationPct),
        fmt(avgIn),
        fmt(avgOut),
        fmt(maxIn),
        fmt(maxOut),
        link.errors ?? "0 ⇔ 0",
        fmt(errorRate, 4),
        link.status,
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([...groupHeader, ...groupRows]);
    ws["!cols"] = [
      { wch: 55 }, // Liens
      { wch: 12 }, // BP
      { wch: 18 }, // Disponibilité
      { wch: 15 }, // P95 In
      { wch: 15 }, // P95 Out
      { wch: 15 }, // Util
      { wch: 15 }, // Moy In
      { wch: 15 }, // Moy Out
      { wch: 14 }, // Max In
      { wch: 14 }, // Max Out
      { wch: 16 }, // Erreurs
      { wch: 15 }, // Taux erreur
      { wch: 10 }, // Statut
    ];

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // ── Génération du fichier ─────────────────────────────────────────────────

  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return buffer;
}

// ─── Déclenchement du téléchargement côté navigateur ─────────────────────────

export function downloadExcel(reportData) {
  const buffer   = generateExcel(reportData);
  const blob     = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url      = URL.createObjectURL(blob);
  const link     = document.createElement("a");
  const filename = `rapport_reseau_${reportData.period.from}_${reportData.period.to}.xlsx`;

  link.href     = url;
  link.download = filename;
  link.click();

  // Libère la mémoire
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
