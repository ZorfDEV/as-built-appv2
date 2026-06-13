import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet, FileText, Loader2,
  Wifi, WifiOff, AlertTriangle, ChevronDown, ChevronUp
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortReport {
  port_id:        string;
  ifName:         string;
  alias:          string;
  operStatus:     "up" | "down" | "unknown";
  adminStatus:    "up" | "down" | "unknown";
  speedMbps:      number;
  human_speed:    string;
  hasData:        boolean;
  // P95
  p95InMbps:      number | null;
  p95OutMbps:     number | null;
  p95UtilInPct:   number | null;  // ex: 8.06
  p95UtilOutPct:  number | null;  // ex: 6.17
  utilizationPct: number | null;  // ex: 8.06
  // Moyenne
  avgInMbps:      number | null;
  avgOutMbps:     number | null;
  // Maximum
  maxInMbps:      number | null;
  maxOutMbps:     number | null;
  // Erreurs
  inErrors:       number;
  outErrors:      number;
  hasErrors:      boolean;
  inDiscards:     number;
  outDiscards:    number;
}

interface DeviceReport {
  device_id:    string;
  hostname:     string;
  status:       "up" | "down" | "unknown";
  uptimeHours:  number;
  availability: number;
  alertCount:   number;
  ports:        PortReport[];
}

interface ReportSummary {
  totalDevices:     number;
  devicesUp:        number;
  devicesDown:      number;
  avgAvailability:  number;
  totalPorts:       number;
  portsUp:          number;
  portsDown:        number;
  portsWithErrors:  number;
  totalErrors:      number;
}

interface ReportData {
  period:      { from: string; to: string };
  generatedAt: string;
  summary:     ReportSummary;
  devices:     DeviceReport[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Affiche "—" si la valeur est null, sinon affiche avec unité
function Val({
  value,
  unit = "Mbps",
  decimals = 2,
}: {
  value: number | null;
  unit?: string;
  decimals?: number;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span>{Number(value).toFixed(decimals)} {unit}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const isUp = status === "up";
  return (
    <Badge
      className={
        isUp
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          : status === "unknown"
          ? "bg-gray-100 text-gray-500 hover:bg-gray-100"
          : "bg-red-100 text-red-700 hover:bg-red-100"
      }
    >
      {status.toUpperCase()}
    </Badge>
  );
}

/*function UtilizationBar({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
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
        {pct}%
      </span>
    </div>
  );
}*/

function UtilizationBar({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
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
      {/* ✅ Toujours 2 décimales */}
      <span className={`text-xs ${pct >= 80 ? "text-red-500 font-medium" : ""}`}>
        {pct.toFixed(2)}%
      </span>
    </div>
  );
}

// ─── DeviceCard ───────────────────────────────────────────────────────────────

function DeviceCard({ device }: { device: DeviceReport }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="overflow-hidden">
      {/* Bandeau device */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-[#1a2744] cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={device.status} />
          <span className="text-white font-medium">{device.hostname}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>
            Dispo :{" "}
            <strong className={device.availability < 99 ? "text-red-400" : "text-emerald-400"}>
              {device.availability}%
            </strong>
          </span>
          <span>Uptime : {device.uptimeHours}h</span>
          <span>Alertes : {device.alertCount}</span>
          {expanded
            ? <ChevronUp  className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />
          }
        </div>
      </div>

      {/* Tableau des ports */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {[
                  "Port",  "Statut", "Vitesse",
                  "P95 In ↓", "P95 Out ↑",
                  "Util. P95",
                  "Err. In", "Err. Out",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.isArray(device.ports) && device.ports.map((port) => (
                <tr
                  key={port.port_id}
                  className={`hover:bg-muted/30 transition-colors ${
                    port.operStatus === "down"
                      ? "bg-red-50 dark:bg-red-950/20"
                      : ""
                  }`}
                >
                  {/* Port */}
                  <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                    {port.ifName}
                  </td>


                  {/* Statut */}
                  <td className="px-4 py-2.5">
                    <StatusBadge status={port.operStatus} />
                  </td>

                  {/* Vitesse */}
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium">
                    {port.human_speed ?? `${port.speedMbps} Mbps`}
                  </td>

                  {/* P95 In */}
                  <td className="px-4 py-2.5 whitespace-nowrap text-blue-600 font-medium">
                    <Val value={port.p95InMbps} />
                  </td>

                  {/* P95 Out */}
                  <td className="px-4 py-2.5 whitespace-nowrap text-purple-600 font-medium">
                    <Val value={port.p95OutMbps} />
                  </td>

                  {/* Utilisation P95 */}
                  <td className="px-4 py-2.5">
                    <UtilizationBar pct={port.utilizationPct} />
                  </td>

                  {/* Erreurs In */}
                  <td className="px-4 py-2.5">
                    <span className={port.inErrors > 0 ? "text-orange-500 font-medium" : ""}>
                      {port.inErrors}
                    </span>
                  </td>

                  {/* Erreurs Out */}
                  <td className="px-4 py-2.5">
                    <span className={port.outErrors > 0 ? "text-orange-500 font-medium" : ""}>
                      {port.outErrors}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message si aucun port */}
      {expanded && device.ports.length === 0 && (
        <div className="px-5 py-4 text-sm text-muted-foreground">
          Aucun port configuré pour cet équipement.
        </div>
      )}
    </Card>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function Report() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [report,   setReport]   = useState<ReportData | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const fetchReport = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<ReportData>("/api/report", {
        params: { dateFrom, dateTo },
      });

      if (!data || !Array.isArray(data.devices)) {
        throw new Error(`Structure inattendue : ${JSON.stringify(data)}`);
      }

      console.log("Rapport reçu :", data);

      setReport(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Impossible de récupérer le rapport : ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportFile = (format: "excel" | "pdf") => {
    window.open(
      `/api/report/export/${format}?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      "_blank"
    );
  };

  const s = report?.summary;

  return (
    <div className="p-6 space-y-6">

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-semibold">Rapports réseau</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionne une période pour générer le rapport.
        </p>
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                Date de début
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                Date de fin
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Button
              onClick={fetchReport}
              disabled={!dateFrom || !dateTo || loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Générer le rapport
            </Button>

            {report && (
              <>
                <Button variant="outline" onClick={() => exportFile("excel")} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => exportFile("pdf")} className="gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  Export PDF
                </Button>
              </>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-3 bg-red-50 px-3 py-2 rounded-md">
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
              value: `${s.avgAvailability}%`,
              icon: Wifi,
              color: "text-emerald-500",
              bg: "bg-emerald-50",
              alert: s.avgAvailability < 99,
            },
            {
              label: "Équipements DOWN",
              value: s.devicesDown,
              icon: WifiOff,
              color: "text-red-500",
              bg: "bg-red-50",
              alert: s.devicesDown > 0,
            },
            {
              label: "Ports DOWN",
              value: s.portsDown,
              icon: WifiOff,
              color: "text-orange-500",
              bg: "bg-orange-50",
              alert: s.portsDown > 0,
            },
            {
              label: "Ports avec erreurs",
              value: s.portsWithErrors,
              icon: AlertTriangle,
              color: "text-yellow-500",
              bg: "bg-yellow-50",
              alert: s.portsWithErrors > 0,
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

      {/* Détail par device */}
      {report && Array.isArray(report.devices) && (
        <div className="space-y-4">
          <CardHeader className="px-0 pb-2">
            <CardTitle className="text-base font-medium">
              Détail par équipement
            </CardTitle>
          </CardHeader>
          {report.devices.map((device) => (
            <DeviceCard key={device.device_id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}