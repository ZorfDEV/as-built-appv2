import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Server, ChevronDown, ChevronUp,
  Activity, Search, MapPin, Cpu, Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ObserviumDevice {
  device_id:       string;
  hostname:        string;
  status:          string;
  hardware:        string | null;
  version:         string | null;
  location_lat:    string | null;
  location_lon:    string | null;
  location_county: string | null;
  location_city:   string | null;
  location_state:  string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDeviceStatus(device: ObserviumDevice): "up" | "down" {
  const s = (device.status ?? "").toString().toLowerCase();
  return s === "1" || s === "up" ? "up" : "down";
}

function formatLocation(device: ObserviumDevice): string {
  const parts = [
    device.location_city,
    device.location_county,
    device.location_state,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

// ─── Badge statut ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "up" | "down" }) {
  return (
    <Badge
      className={
        status === "up"
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          : "bg-red-100 text-red-700 hover:bg-red-100"
      }
    >
      {status.toUpperCase()}
    </Badge>
  );
}

// ─── Carte device ─────────────────────────────────────────────────────────────

function DeviceCard({ device }: { device: ObserviumDevice }) {
  const [expanded, setExpanded] = useState(false);
  const status   = getDeviceStatus(device);
  const location = formatLocation(device);
  const hasCoords = device.location_lat && device.location_lon;

  return (
    <Card className="overflow-hidden">
      {/* Bandeau device */}
      <div
        className="flex items-center justify-between px-5 py-3 bg-[#1a2744] cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Server className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{device.hostname}</p>
            <p className="text-slate-400 text-xs">ID : {device.device_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {expanded
            ? <ChevronUp  className="h-4 w-4 text-slate-400" />
            : <ChevronDown className="h-4 w-4 text-slate-400" />
          }
        </div>
      </div>

      {/* Détails dépliables */}
      {expanded && (
        <CardContent className="pt-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Hardware */}
          <div className="flex items-start gap-2.5">
            <Cpu className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Hardware</p>
              <p className="text-sm font-medium">
                {device.hardware || "—"}
              </p>
            </div>
          </div>

          {/* Version */}
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm font-medium truncate max-w-50">
                {device.version || "—"}
              </p>
            </div>
          </div>

          {/* Localisation */}
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Localisation</p>
              <p className="text-sm font-medium">{location}</p>
            </div>
          </div>

          {/* Coordonnées GPS */}
          {hasCoords && (
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Coordonnées GPS</p>
                <p className="text-sm font-medium font-mono">
                 <span>Lat:</span> {device.location_lat},<span>Lon:</span>  {device.location_lon}
                </p>
              </div>
            </div>
          )}

        </CardContent>
      )}
    </Card>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function DeviceMetrics() {
  const [devices, setDevices] = useState<ObserviumDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    axios.get("/api/report/metrics/")
      .then((response) => {
        const data = response.data;

        // ✅ Supporte tableau ou objet { "1": {...}, "2": {...} }
        const raw: ObserviumDevice[] = Array.isArray(data)
          ? data
          : Object.values(data);

        setDevices(raw);
      })
      .catch((err) => {
        console.error("Erreur fetch devices:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = devices.filter((d) =>
    d.hostname?.toLowerCase().includes(search.toLowerCase()) ||
    d.device_id?.includes(search) ||
    d.location_city?.toLowerCase().includes(search.toLowerCase()) ||
    d.location_state?.toLowerCase().includes(search.toLowerCase())
  );

  const devicesUp   = devices.filter((d) => getDeviceStatus(d) === "up").length;
  const devicesDown = devices.filter((d) => getDeviceStatus(d) === "down").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-sm animate-pulse">
          Chargement des équipements…
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-semibold">Équipements réseau</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Liste des équipements supervisés par Observium.
        </p>
      </div>

      {/* Résumé global */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total",        value: devices.length, color: "text-foreground"  },
          { label: "UP",           value: devicesUp,      color: "text-emerald-600" },
          { label: "DOWN",         value: devicesDown,    color: "text-red-500"     },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 flex items-center gap-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-semibold ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, ville, région…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste des devices */}
      <div className="space-y-3">
        <CardHeader className="px-0 pb-2">
          <CardTitle className="text-base font-medium">
            Équipements
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filtered.length} équipement{filtered.length > 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground text-sm">
              Aucun équipement trouvé.
            </CardContent>
          </Card>
        ) : (
          filtered.map((device) => (
            <DeviceCard key={device.device_id} device={device} />
          ))
        )}
      </div>
    </div>
  );
}