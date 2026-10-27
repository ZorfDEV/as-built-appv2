import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet, FileText, Loader2,
  Link2, WifiOff, AlertTriangle, Wifi,
} from "lucide-react";
import { downloadExcel } from "@/services/excelExport";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortStats {
  hasData:        boolean;
  operStatus:     string;
  adminStatus:    string;
  speedMbps:      number;
  human_speed:    string;
  p95InMbps:      number | null;
  p95OutMbps:     number | null;
  p95UtilInPct:   number | null;
  p95UtilOutPct:  number | null;
  utilizationPct: number | null;
  avgInMbps:      number | null;
  avgOutMbps:     number | null;
  maxInMbps:      number | null;
  maxOutMbps:     number | null;
  inErrors:       number;
  outErrors:      number;
  hasErrors:      boolean;
  inDiscards:     number;
  outDiscards:    number;
  noDataReason?:  string | null;
}

interface LinkReport {
  link_id:        string;
  linkLabel:      string;
  siteA:          string;
  siteB:          string;
  hostnameA:      string;
  hostnameB:      string;
  portA_id:       string;
  portB_id:       string | null;
  portA_name:     string;
  portB_name:     string;
  capacityGbps:   number;
  status:         "UP" | "DOWN" | "PARTIAL" | string;
  availability: number | null; 
  utilizationPct: number | null;
  errors:         string;
  hasErrors:      boolean;
  portA:          PortStats;
  portB:          PortStats | null;
}

interface SitePairGroup {
  siteA: string;
  siteB: string;
  links: LinkReport[];
}

interface ReportSummary {
  totalLinks:      number;
  linksUp:         number;
  linksDown:       number;
  linksPartial:    number;
  linksWithErrors: number;
  avgAvailability: number | null;
  totalErrors:     number;
}

interface ReportData {
  period:          { from: string; to: string };
  generatedAt:     string;
  summary:         ReportSummary;
  links:           LinkReport[];
  linksBySitePair: SitePairGroup[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    UP:      "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    DOWN:    "bg-red-100    text-red-700    hover:bg-red-100",
    PARTIAL: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  };
  return (
    <Badge className={map[status] ?? "bg-gray-100 text-gray-500"}>
      {status}
    </Badge>
  );
}

function AvailabilityCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  const isGood = value >= 99;
  return (
    <span className={`font-medium ${isGood ? "text-emerald-600" : "text-red-500"}`}>
      {value.toFixed(1)}
    </span>
  );
}

function UtilizationCell({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-muted-foreground text-xs">—</span>;

  const color =
    pct >= 80 ? "bg-red-500" :
    pct >= 60 ? "bg-orange-400" :
    "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`text-xs ${pct >= 80 ? "text-red-500 font-medium" : ""}`}>
        {pct.toFixed(2)}%
      </span>
    </div>
  );
}

// ─── Carte détail port ────────────────────────────────────────────────────────

function PortDetail({ port, label }: { port: PortStats | null; label: string }) {
  if (!port) return null;

  const fmt = (val: number | null) =>
    val !== null ? `${Number(val).toFixed(2)} Mbps` : "—";

  return (
    <div className="text-xs space-y-0.5 text-muted-foreground">
      <p className="font-medium text-foreground">{label}</p>
      {port.hasData ? (
        <>
          <p>P95 ↓ {fmt(port.p95InMbps)} / ↑ {fmt(port.p95OutMbps)}</p>
          <p>Moy ↓ {fmt(port.avgInMbps)} / ↑ {fmt(port.avgOutMbps)}</p>
          <p>Max ↓ {fmt(port.maxInMbps)} / ↑ {fmt(port.maxOutMbps)}</p>
          {(port.inErrors > 0 || port.outErrors > 0) && (
            <p className="text-orange-500">
              Erreurs In:{port.inErrors} Out:{port.outErrors}
            </p>
          )}
        </>
      ) : (
        <p className="italic">{port.noDataReason ?? "Données indisponibles"}</p>
      )}
    </div>
  );
}

// ─── Groupe de liens par paire de sites ──────────────────────────────────────

function SitePairCard({ group }: { group: SitePairGroup }) {
  const [expandedLink, setExpandedLink] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedLink((prev) => (prev === id ? null : id));

  return (
    <Card className="overflow-hidden">
      {/* Bandeau paire de sites */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[#1a2744]">
        <span className="text-white font-semibold text-sm">{group.siteA}</span>
        <span className="text-slate-400 text-lg">↔</span>
        <span className="text-white font-semibold text-sm">{group.siteB}</span>
        <Badge className="ml-auto bg-slate-700 text-slate-200 hover:bg-slate-700 text-xs">
          {group.links.length} lien{group.links.length > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Tableau des liens */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {[
                "Liens",
                "BP (Gbps)",
                "Disponibilité",
                "Utilisation P95 (%)",
                "Erreurs",
                "Statut",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-xs font-medium
                             text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {group.links.map((link) => (
              <>
                <tr
                  key={link.link_id}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                    link.status === "DOWN"
                      ? "bg-red-50 dark:bg-red-950/20"
                      : ""
                  }`}
                  onClick={() => toggle(link.link_id)}
                >
                  {/* Lien */}
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {link.linkLabel}
                    </div>
                  </td>

                  {/* Bande passante */}
                  <td className="px-4 py-2.5 whitespace-nowrap font-medium">
                    {link.capacityGbps}
                  </td>

                  {/* Disponibilité */}
                  <td className="px-4 py-2.5">
                    <AvailabilityCell value={link.availability} />
                  </td>

                  {/* Utilisation P95 */}
                  <td className="px-4 py-2.5">
                    <UtilizationCell pct={link.utilizationPct} />
                  </td>

                  {/* Erreurs */}
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={link.hasErrors ? "text-orange-500 font-medium" : ""}>
                      {link.errors}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-2.5">
                    <StatusBadge status={link.status} />
                  </td>

                  {/* Toggle détail */}
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {expandedLink === link.link_id ? "▲ Réduire" : "▼ Détail"}
                  </td>
                </tr>

                {/* Ligne de détail dépliable */}
                {expandedLink === link.link_id && (
                  <tr key={`${link.link_id}-detail`} className="bg-muted/20">
                    <td colSpan={7} className="px-8 py-4">
                      <div className="grid grid-cols-2 gap-8">
                        <PortDetail
                          port={link.portA}
                          label={`${link.hostnameA} — ${link.portA_name}`}
                        />
                        <PortDetail
                          port={link.portB}
                          label={
                            link.portB
                              ? `${link.hostnameB} — ${link.portB_name}`
                              : link.hostnameB
                          }
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Composant principal:: ──────────────────────────────────────────────────────

export default function Report() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [report,   setReport]   = useState<ReportData | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const today        = new Date().toISOString().split("T")[0];
const isValidRange = Boolean(dateFrom && dateTo && dateFrom <= dateTo && dateTo <= today);

  const fetchReport = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<ReportData>("/api/report", {
        params: { dateFrom, dateTo },
      });
      if (!data || !Array.isArray(data.links)) {
        throw new Error(`Structure inattendue : ${JSON.stringify(data)}`);
      }

      if (data.links.length === 0) {
        setError(
          "Aucun lien détecté. Vérifiez que les voisins LLDP sont bien configurés " +
          "dans Observium et que les hostnames correspondent à votre configuration."
        );
        setLoading(false);
        return;
      }

      setReport(data);
    } catch (err: unknown) {
      // Message renvoyé par le backend ({ error }) plutôt que "Request failed with status code 500"
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? err.message
        : err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(`Impossible de récupérer le rapport : ${message}`);
      setError(`Impossible de récupérer le rapport : ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportFile = (format: "excel" | "pdf") => {
   /* window.open(
      `/api/report/export/${format}?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      "_blank"
    );*/
    if(format)
    toast.success("Le rapport PDF n'est pas encore disponible")
  };

  const s = report?.summary;

  return (
    <div className="p-6 space-y-6">

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-semibold">Rapports réseau</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionne une période pour générer le rapport des liens.
        </p>
      </div>

      {/* Sélecteur de période + actions */}
      <Card>
  <CardContent className="pt-5">
    <div className="flex flex-wrap items-end gap-4">

      {/* Date de début */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground font-medium">
          Date de début
        </label>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || today}
          onChange={(e) => {
            setDateFrom(e.target.value)
            if (dateTo && e.target.value > dateTo) setDateTo("")
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Date de fin */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground font-medium">
          Date de fin
        </label>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          max={today}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Message d'erreur plage invalide */}
      {dateFrom && dateTo && !isValidRange && (
        <p className="text-xs text-red-500 self-center">
          {dateFrom > dateTo
            ? "La date de début doit être antérieure à la date de fin."
            : "La date de fin ne peut pas dépasser aujourd'hui."}
        </p>
      )}

      {/* Bouton générer */}
      <Button
        onClick={fetchReport}
        disabled={!isValidRange || loading}
        className="bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Générer le rapport
      </Button>

      {/* Exports */}
      {report && (
        <>
          <Button
            variant="outline"
            onClick={() => downloadExcel(report)}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => exportFile("pdf")}
            className="gap-2"
          >
            <FileText className="h-4 w-4 text-red-500" />
            Export PDF
          </Button>
        </>
      )}
    </div>

    {error && (
      <p className="text-sm text-red-500 mt-3 bg-red-50 dark:bg-red-950/20
                    px-3 py-2 rounded-md border border-red-200">
        {error}
      </p>
    )}
  </CardContent>
</Card>
      {/* Résumé */}
      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Disponibilité moy.",
              value: s.avgAvailability != null ? `${s.avgAvailability.toFixed(1)}%` : "N/A",
              icon:  Wifi,
              color: "text-emerald-500",
              bg:    "bg-emerald-50",
              alert: s.avgAvailability != null && s.avgAvailability < 99,
            },
            {
              label: "Liens DOWN",
              value: s.linksDown,
              icon:  WifiOff,
              color: "text-red-500",
              bg:    "bg-red-50",
              alert: s.linksDown > 0,
            },
            {
              label: "Liens partiels",
              value: s.linksPartial,
              icon:  WifiOff,
              color: "text-orange-500",
              bg:    "bg-orange-50",
              alert: s.linksPartial > 0,
            },
            {
              label: "Liens avec erreurs",
              value: s.linksWithErrors,
              icon:  AlertTriangle,
              color: "text-yellow-500",
              bg:    "bg-yellow-50",
              alert: s.linksWithErrors > 0,
            },
          ].map(({ label, value, icon: Icon, color, bg, alert }) => (
            <Card key={label} className={alert ? "border-red-200" : ""}>
              <CardContent className="pt-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-xl font-semibold ${alert ? "text-red-500" : ""}`}>
                    {value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Liens groupés par paire de sites */}
      {report && Array.isArray(report.linksBySitePair) && (
        <div className="space-y-4">
          <CardHeader className="px-0 pb-2">
            <CardTitle className="text-base font-medium">
              Liens par paire de sites
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({report.summary.totalLinks} liens —{" "}
                {report.period.from} → {report.period.to})
              </span>
            </CardTitle>
          </CardHeader>

          {report.linksBySitePair.map((group) => (
            <SitePairCard
              key={`${group.siteA}-${group.siteB}`}
              group={group}
            />
          ))}
        </div>
      )}
    </div>
  );
}