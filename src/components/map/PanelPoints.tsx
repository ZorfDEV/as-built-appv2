import { useState, useMemo } from 'react';
import type { Point } from '@/datatypes/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Train, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { Button } from "../ui/button";

interface NearestGare {
  _id: string;
  name: string;
  distanceKm: string;
  foundIn5km: boolean;
}

interface PanelPointsProps {
  listpoints: Point[];
  nearestGare?: NearestGare | null;
  incidentName?: string;
}

export default function PanelPoints({
  listpoints,
  nearestGare,
  incidentName,
}: PanelPointsProps) {
  const [visible,  setVisible]  = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [search,   setSearch]   = useState("");

  // Filtre les points selon la recherche
  const filteredPoints = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listpoints;
    return listpoints.filter((p) =>
      p.name?.toLowerCase().includes(q)
    );
  }, [listpoints, search]);

  if (!visible || listpoints.length === 0) return null;

  return (
    <div
      className="absolute top-14 left-4 z-[3000] w-72"
      onWheel={(e) => e.stopPropagation()}
    >
      <Card className="shadow-lg border border-border bg-background/95 backdrop-blur-sm">

        {/* En-tête */}
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium leading-tight">
                  Points proches
                </CardTitle>
                {incidentName && (
                  <CardDescription className="text-xs mt-0.5 truncate max-w-[180px]">
                    {incidentName}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                onClick={() => setExpanded((v) => !v)}
                variant="ghost"
                size="sm"
                title={expanded ? "Réduire" : "Développer"}
              >
                {expanded
                  ? <ChevronUp  className="h-3.5 w-3.5 text-muted-foreground" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                }
              </Button>
              <Button
                onClick={() => setVisible(false)}
                variant="ghost"
                size="sm"
                title="Fermer"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Badges résumé */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge
              variant="secondary"
              className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              {listpoints.length} point{listpoints.length > 1 ? "s" : ""} ≤ 5 km
            </Badge>
            {nearestGare && !nearestGare.foundIn5km && (
              <Badge
                variant="secondary"
                className="text-xs bg-amber-50 text-amber-700 border-amber-200"
              >
                Gare à {nearestGare.distanceKm} km
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Contenu dépliable */}
        {expanded && (
          <CardContent className="px-3 pb-3 pt-0">

            {/* Gare la plus proche */}
            {nearestGare && (
              <div className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg mb-2 text-xs
                ${nearestGare.foundIn5km
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-amber-50 border border-amber-200"
                }
              `}>
                <Train className={`h-4 w-4 shrink-0 ${
                  nearestGare.foundIn5km ? "text-emerald-600" : "text-amber-600"
                }`} />
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {nearestGare.name}
                  </p>
                  <p className={`${
                    nearestGare.foundIn5km ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {nearestGare.foundIn5km
                      ? `Dans le rayon — ${nearestGare.distanceKm} km`
                      : `Gare la plus proche — ${nearestGare.distanceKm} km`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Barre de recherche */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un point…"
                className="pl-8 h-8 text-xs"
              />
              {/* Bouton effacer la recherche */}
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* ✅ Compteur de résultats si recherche active */}
            {search && (
              <p className="text-xs text-muted-foreground mb-1.5 px-1">
                {filteredPoints.length === 0
                  ? "Aucun résultat"
                  : `${filteredPoints.length} résultat${filteredPoints.length > 1 ? "s" : ""}`
                }
              </p>
            )}

            {/* Liste des points filtrés */}
            <ScrollArea className="h-52">
              <div className="space-y-0 divide-y divide-border">
                {filteredPoints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Aucun point ne correspond à<br />
                      <span className="font-medium text-foreground">"{search}"</span>
                    </p>
                  </div>
                ) : (
                  filteredPoints.map((p, index) => (
                    <div
                      key={p._id.toString() + index.toString()}
                      className="flex items-center justify-between px-2 py-2.5 hover:bg-muted/50 transition-colors rounded-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* ✅ Numéro basé sur la position dans la liste originale */}
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-medium text-emerald-700">
                            {listpoints.findIndex((lp) => lp._id === p._id) + 1}
                          </span>
                        </div>
                        {/* ✅ Met en surbrillance le texte recherché */}
                        <span className="text-xs text-foreground font-medium truncate">
                          {search
                            ? highlightMatch(p.name ?? "", search)
                            : p.name
                          }
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2 font-mono">
                        {p.distance} km
                      </span>
                    </div>
                  ))
                )}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ✅ Surligne la partie du texte qui correspond à la recherche
function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-100 text-emerald-800 rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}