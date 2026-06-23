import { clsx } from "clsx";
import type { ScoreItem } from "@/lib/types";

interface Props {
  item: ScoreItem;
  isRisk?: boolean;
}

function scoreColor(value: number, isRisk: boolean): string {
  if (isRisk) {
    if (value >= 60) return "#ef4444";
    if (value >= 40) return "#f97316";
    if (value >= 25) return "#eab308";
    return "#22c55e";
  }
  if (value >= 80) return "#22c55e";
  if (value >= 65) return "#3730a3";
  if (value >= 50) return "#eab308";
  return "#ef4444";
}

export default function ScoreCard({ item, isRisk = false }: Props) {
  const color = scoreColor(item.value, isRisk);
  const barWidth = isRisk ? item.value : item.value;

  return (
    <div className="py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">{item.label}</span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {item.value}
          <span className="text-xs font-normal text-gray-300 ml-0.5">/100</span>
        </span>
      </div>
      <div className="score-track mb-2">
        <div
          className="score-fill"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
    </div>
  );
}
