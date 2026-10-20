import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  getTrendDirection,
  trendStyles,
  type ScorePoint,
} from "./trendHelpers";
import { SCORE_TREND_CHART_CONTENT } from "@/config/content";

function SummaryStat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
      <p
        className={cn(
          dmSans.className,
          "text-lg sm:text-xl font-semibold",
          valueClass,
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ScoreTrendChart({
  stats,
}: {
  stats: { scoreTrend: ScorePoint[]; averageScore?: number };
}) {
  const direction = getTrendDirection(stats.scoreTrend);
  const trendStyle = trendStyles[direction];

  const highest = Math.max(...stats.scoreTrend.map((s) => s.score));
  const average =
    stats.scoreTrend.reduce((acc, s) => acc + s.score, 0) /
    stats.scoreTrend.length;
  const improvement =
    stats.scoreTrend.length > 1
      ? Math.abs(
          stats.scoreTrend[stats.scoreTrend.length - 1].score -
            stats.scoreTrend[0].score,
        )
      : 0;
  const avgValue = stats.averageScore ?? Math.round(average);

  return (
    <div>
      <div className="h-[16.25rem] sm:h-[18.75rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={stats.scoreTrend}
            margin={{ top: 20, right: 24, left: -8, bottom: 8 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)" }}
              tickMargin={10}
              padding={{ left: 20, right: 10 }}
            />

            <YAxis
              domain={[0, 100]}
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)" }}
              tickMargin={10}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass p-3 rounded-lg shadow-lg border border-primary/20">
                      <p className="text-xs font-semibold text-primary">
                        {label}
                      </p>
                      <p className="text-base font-bold mt-1">
                        {payload[0].value}%
                      </p>
                      <p className="text-[0.6875rem] text-muted-foreground mt-1">
                        {SCORE_TREND_CHART_CONTENT.TOOLTIP_LABEL}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{
                stroke: "var(--primary)",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              dot={{
                r: 4,
                fill: "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />

            <ReferenceLine
              y={avgValue}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.6}
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{
                value: SCORE_TREND_CHART_CONTENT.AVG_LABEL(avgValue),
                position: "insideTopRight",
                fill: "var(--muted-foreground)",
                fontSize: 11,
                fontWeight: 600,
                offset: 8,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart stats summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
        <SummaryStat
          label={SCORE_TREND_CHART_CONTENT.HIGHEST}
          value={`${highest}%`}
          valueClass="text-foreground"
        />
        <SummaryStat
          label={SCORE_TREND_CHART_CONTENT.AVERAGE}
          value={`${average.toFixed(1)}%`}
          valueClass="text-foreground"
        />
        <SummaryStat
          label={SCORE_TREND_CHART_CONTENT.IMPROVEMENT}
          value={`${direction === "up" ? "+" : direction === "down" ? "-" : ""}${improvement}%`}
          valueClass={trendStyle.text}
        />
      </div>
    </div>
  );
}
