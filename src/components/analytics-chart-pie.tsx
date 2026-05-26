"use client"

import * as React from "react"
import {
  ChartPie,
  Layers2,
  TrendingUp,
} from "lucide-react"

import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts"

import { Badge } from "@/components/ui/badge"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { ScrollArea } from "./ui/scroll-area"
import type { Point } from "./../datatypes/index"
import { useMemo } from "react"

export const description =
  "A donut chart with text"

export function AnalyticsChartPie({
  dataincidents,
}: {
  dataincidents: Point[]
}) {
  const COLORS_TYPE: string[] = [
    "#14B8A6",
    "#2DD4BF",
    "#5EEAD4",
    "#378ADD",
    "#9FA8DA",
    "#EF9F27",
    "#FFAB91",
    "#EF5350",
    "#CE93D8",
    "#888780",
    "#0F766E",
  ]

  const getSectionName = (
    section_id: Point["section_id"]
  ) =>
    typeof section_id === "string"
      ? section_id
      : section_id?.name ??
        "Non défini"

  const chartConfig = {
    incidents: {
      label: "Incidents",
      color: "var(--chart-1)",
    },
  }

  /**
   * Pie chart data
   */
  const chartData = useMemo(() => {
    const counts: Record<
      string,
      number
    > = {}

    dataincidents.forEach(
      (incident) => {
        const sectionName =
          getSectionName(
            incident.section_id
          )

        counts[sectionName] =
          (counts[sectionName] ??
            0) + 1
      }
    )

    return Object.entries(counts).map(
      ([browser, incidents]) => ({
        browser,
        incidents,
      })
    )
  }, [dataincidents])

  /**
   * Legend data
   */
  const sectionData = useMemo(() => {
    const counts: Record<
      string,
      number
    > = {}

    dataincidents.forEach(
      (incident) => {
        const name =
          getSectionName(
            incident.section_id
          )

        counts[name] =
          (counts[name] ?? 0) + 1
      }
    )

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([name, value], idx) => ({
          name,
          value,
          color:
            COLORS_TYPE[
              idx %
                COLORS_TYPE.length
            ],
        })
      )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataincidents])

  /**
   * Total incidents
   */
  const totalVisitors =
    React.useMemo(() => {
      return chartData.reduce(
        (acc, curr) =>
          acc + curr.incidents,
        0
      )
    }, [chartData])

  /**
   * Most active section
   */
  const mostActiveSection =
    chartData.length > 0
      ? chartData.reduce(
          (max, curr) =>
            curr.incidents >
            max.incidents
              ? curr
              : max,
          chartData[0]
        )
      : null

  return (
    <Card className="flex flex-col rounded-[28px] border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-start gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/40">
                <ChartPie className="h-5 w-5 text-teal-600" />
              </div>

              <div>
                <CardTitle>
                  Diagramme des incidents
                  par section
                </CardTitle>

                <CardDescription>
                  {`Total incidents : ${totalVisitors}`}
                </CardDescription>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className="h-10 rounded-xl px-4 text-sm font-medium"
          >
            <Layers2 className="mr-2 h-4 w-4" />
            Sections
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex items-center justify-center gap-6 p-6">
        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="h-80 w-full max-w-[320px]"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                  />
                }
              />

              <Pie
                data={chartData}
                dataKey="incidents"
                nameKey="browser"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                strokeWidth={0}
              >
                {chartData.map(
                  (_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={
                        COLORS_TYPE[
                          idx %
                            COLORS_TYPE.length
                        ]
                      }
                    />
                  )
                )}

                {/* Center Label */}
                <Label
                  content={({
                    viewBox,
                  }) => {
                    if (
                      viewBox &&
                      "cx" in
                        viewBox &&
                      "cy" in
                        viewBox
                    ) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={
                              viewBox.cx
                            }
                            y={
                              viewBox.cy
                            }
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>

                          <tspan
                            x={
                              viewBox.cx
                            }
                            y={
                              (viewBox.cy ??
                                0) +
                              24
                            }
                            className="fill-muted-foreground text-sm"
                          >
                            Incidents
                          </tspan>
                        </text>
                      )
                    }

                    return null
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <ScrollArea className="h-60 w-56 rounded-2xl border bg-muted/20">
          <div className="p-4">
            <div className="space-y-0 divide-y divide-border">
              {sectionData.map(
                (entry) => {
                  const pct =
                    Math.round(
                      (entry.value /
                        totalVisitors) *
                        100
                    )

                  return (
                    <div
                      key={
                        entry.name
                      }
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{
                            background:
                              entry.color,
                          }}
                        />

                        <span className="max-w-32 truncate text-xs text-muted-foreground">
                          {
                            entry.name
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium text-foreground">
                          {
                            entry.value
                          }
                        </span>

                        <span className="w-9 text-right text-xs text-muted-foreground">
                          · {pct}%
                        </span>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Section la plus active
            </span>

            <span className="text-sm font-medium text-foreground">
              {mostActiveSection?.browser ??
                "Aucune donnée"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground">
            Total incidents
          </span>

          <p className="text-sm font-medium text-foreground">
            {
              dataincidents.length
            }{" "}
            incidents
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}