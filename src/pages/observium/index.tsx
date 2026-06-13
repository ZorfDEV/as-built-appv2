import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Loader2, Wifi, WifiOff, AlertTriangle } from "lucide-react";

interface ReportSummary {
  totalDevices: number;
  devicesUp: number;
  devicesDown: number;
  availabilityPct: number;
  totalPorts: number;
  portsUp: number;
  portsDown: number;
  totalErrors: number;
}

interface ReportData {
  period: { from: string; to: string };
  generatedAt: string;
  summary: ReportSummary;
  ports: Array<{
    device: string;
    port: string;
    alias: string;
    status: "up" | "down";
    inErrors: number;
    outErrors: number;
    bandwidthInMbps: number;
    bandwidthOutMbps: number;
    utilizationPct: number;
  }>;
}

export default function Report() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<ReportData>("/api/report", {
        params: { dateFrom, dateTo },
      });
      setReport(data);
    } catch {
      setError("Impossible de récupérer le rapport. Vérifie la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const exportFile = (format: "excel" | "pdf") => {
    window.open(`/api/report/export/${format}?dateFrom=${dateFrom}&dateTo=${dateTo}`, "_blank");
  };

  return (
    <div className="p-6 space-y-6">
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
              <label className="text-xs text-muted-foreground font-medium">Date de début</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">Date de fin</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Résumé */}
      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Disponibilité", value: `${report.summary.availabilityPct}%`, icon: Wifi, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Équipements DOWN", value: report.summary.devicesDown, icon: WifiOff, color: "text-red-500", bg: "bg-red-50" },
              { label: "Ports DOWN", value: report.summary.portsDown, icon: WifiOff, color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Total erreurs", value: report.summary.totalErrors, icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="pt-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-semibold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table des ports */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-medium">Détail des ports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Équipement","Port","Alias","Statut","BW In","BW Out","Utilisation","Erreurs"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.ports.map((p, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium">{p.device}</td>
                        <td className="px-4 py-2.5">{p.port}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.alias}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={p.status === "up" ? "default" : "destructive"}
                            className={p.status === "up" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                            {p.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">{p.bandwidthInMbps} Mbps</td>
                        <td className="px-4 py-2.5">{p.bandwidthOutMbps} Mbps</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(p.utilizationPct, 100)}%` }} />
                            </div>
                            <span>{p.utilizationPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={p.inErrors + p.outErrors > 0 ? "text-red-500 font-medium" : ""}>
                            {p.inErrors + p.outErrors}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}