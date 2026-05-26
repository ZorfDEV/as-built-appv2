import { CalendarDays, ChartNoAxesColumn, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Point } from "./../datatypes/index"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useMemo } from "react"

const SECTION_COLORS = [
    "#14B8A6",
    "#2DD4BF",
    "#5EEAD4",
    "#0F766E",
]

const MONTH_ORDER = ["Jan","Fév","Mar","Avr","Mai","Jui","Jul","Aoû","Sep","Oct","Nov","Déc"]
const MONTH_MAP: Record<string, string> = {
  janv:"Jan", févr:"Fév", mars:"Mar", avril:"Avr", mai:"Mai",
  juin:"Jui", juil:"Jul", août:"Aoû", sept:"Sep", oct:"Oct", nov:"Nov", déc:"Déc",
}

const normalizeMonth = (raw: string) =>
  MONTH_MAP[raw.replace(".", "").toLowerCase()] ?? raw.charAt(0).toUpperCase() + raw.slice(1)

const getSectionName = (section_id: Point["section_id"]) =>
  typeof section_id === "string" ? section_id : section_id?.name ?? "Non défini"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="rounded-lg border border-border bg-background shadow-md px-3 py-2 text-xs min-w-35">
      <p className="font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium text-foreground">{total}</span>
      </div>
    </div>
  )
}

// Fonction utilitaire à placer hors du composant
function getTopSectionForMonth(
  chartData: Record<string, unknown>[],
  month: string,
  sections: string[]
): string | null {
  const monthData = chartData.find((d) => d.month === month)
  if (!monthData) return null
  // Cherche la dernière section (dans l'ordre d'empilement) qui a une valeur
  for (let i = sections.length - 1; i >= 0; i--) {
    if ((monthData[sections[i]] as number) > 0) return sections[i]
  }
  return null
}

export function AnalyticsChartBar({ dataincidents }: { dataincidents: Point[] }) {
  const sections = useMemo(
    () => [...new Set(dataincidents.map((i) => getSectionName(i.section_id)))],
    [dataincidents]
  )

  const chartData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {}
    dataincidents.forEach((incident) => {
      const raw = format(new Date(incident.createdAt), "MMM", { locale: fr }).toLowerCase()
      const month = normalizeMonth(raw)
      const section = getSectionName(incident.section_id)
      if (!grouped[month]) grouped[month] = {}
      grouped[month][section] = (grouped[month][section] ?? 0) + 1
    })
    return Object.entries(grouped)
      .map(([month, secs]) => ({
        month,
        ...secs,
        total: Object.values(secs).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month))
  }, [dataincidents])

  const busiest = chartData.reduce(
    (max, cur) => (cur.total > max.total ? cur : max),
    chartData[0] ?? { month: "—", total: 0 }
  )

  return (
    <Card className="flex flex-col gap-0 pb-0 overflow-hidden">
      <CardHeader className="pb-3 ">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-start gap-1.5">
            <ChartNoAxesColumn className="text-shadow-emerald-800 h-8 w-8"/>
            <div>
            <CardTitle className="text-base font-medium">Diagramme des incidents</CardTitle>
             <CardDescription className="text-xs mt-0.5">Janvier – Décembre 2026</CardDescription>
            </div>
           </div>
          </div>
           <Badge
          variant="outline"
          className="h-10 rounded-xl px-4 text-sm font-medium"
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Année 2026
        </Badge>
        </div>
      </CardHeader>

      <CardContent className=" px-3">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barCategoryGap="35%" barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickMargin={8}
              allowDecimals={false}
              width={24}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
           {sections.map((section, idx) => (
  <Bar
    key={section}
    dataKey={section}
    stackId="a"
    fill={SECTION_COLORS[idx % SECTION_COLORS.length]}
    radius={[0, 0, 0, 0]} // valeur par défaut, écrasée par shape
    shape={(props: unknown) => {
      const { x, y, width, height, month } = props as {
        x: number; y: number; width: number; height: number; month: string
      }
      if (!height || height <= 0) return <g />

      const topSection = getTopSectionForMonth(chartData, month, sections)
      const isTop = topSection === section
      const r = isTop ? 8 : 0

      return (
        <path
          d={`
            M ${x + r},${y}
            L ${x + width - r},${y}
            Q ${x + width},${y} ${x + width},${y + r}
            L ${x + width},${y + height}
            L ${x},${y + height}
            L ${x},${y + r}
            Q ${x},${y} ${x + r},${y}
            Z
          `}
          fill={SECTION_COLORS[idx % SECTION_COLORS.length]}
        />
      )
    }}
  />
))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/30">
      
        <div className="flex items-center justify-between gap-2">
           <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex flex-col gap-0.5 ">
          <span className="text-xs text-muted-foreground">Période la plus active</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            {busiest.month}
          </span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs text-muted-foreground">Total incidents sur l'année</span>
          <span className="text-sm font-medium text-foreground">{dataincidents.length} incidents</span>
        </div>
      </CardFooter>
    </Card>
  )
}
