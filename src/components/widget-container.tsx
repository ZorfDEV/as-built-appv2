import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DataWidget = {
  total: number;
  percentage: number;
};

type WidgetContainerProps = {
  link: string;
  title: string;
  icon: React.ReactNode;
  refreshInterval: number;
  variant?: "purple" | "red" | "yellow" | "green";
};

const variants = {
  purple: {
    card: "bg-violet-50/70 border-violet-200 dark:bg-violet-950/20 dark:border-violet-900",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconText: "text-violet-600",
    progress: "[&>div]:bg-violet-500",
  },

  red: {
    card: "bg-red-50/70 border-red-200 dark:bg-red-950/20 dark:border-red-900",
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconText: "text-red-500",
    progress: "[&>div]:bg-red-500",
  },

  yellow: {
    card: "bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconText: "text-amber-500",
    progress: "[&>div]:bg-amber-500",
  },

  green: {
    card: "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconText: "text-emerald-500",
    progress: "[&>div]:bg-emerald-500",
  },
};

function WidgetContainer({
  link,
  title,
  icon,
  refreshInterval,
  variant = "purple",
}: WidgetContainerProps) {
  const [data, setData] = useState<DataWidget | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(link);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching widget data:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [link, refreshInterval]);

  const style = variants[variant];

  return (
    <Card  className={cn(
    "relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer",
    style.card
  )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              {data?.total ?? 0}
            </h2>
          </div>

          {/* Icon */}
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              style.iconBg
            )}
          >
            <div className={style.iconText}>{icon}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {data?.percentage ?? 0}%
            </span>{" "}
            du total incidents
          </p>

          {/* Progress Bar Shadcn */}
          <Progress
            value={data?.percentage ?? 0}
            className={cn("h-2 rounded-full", style.progress, style.iconBg)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default WidgetContainer;