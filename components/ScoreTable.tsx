import ScoreCard from "./ScoreCard";
import type { ScoreItem } from "@/lib/types";

interface Props {
  generativeScores: ScoreItem[];
  riskScores: ScoreItem[];
}

export default function ScoreTable({ generativeScores, riskScores }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-4 pb-2 border-b border-gray-100">
          Generative Scores
        </h3>
        <div>
          {generativeScores.map((item) => (
            <ScoreCard key={item.label} item={item} isRisk={false} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-4 pb-2 border-b border-gray-100">
          Risk Scores <span className="normal-case font-normal tracking-normal">(higher = more risk)</span>
        </h3>
        <div>
          {riskScores.map((item) => (
            <ScoreCard key={item.label} item={item} isRisk={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
