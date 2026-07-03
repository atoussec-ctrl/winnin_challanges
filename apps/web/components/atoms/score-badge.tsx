import { getScoreTone } from "../../lib/score";
import { cn } from "../../lib/utils";
import { toneClasses } from "./tone-classes";

export function ScoreBadge({ score }: Readonly<{ score: number | null }>) {
  const tone = getScoreTone(score);

  return (
    <span
      className={cn(
        "inline-flex min-w-12 items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold tabular-nums",
        toneClasses[tone]
      )}
    >
      {score ?? "N/A"}
    </span>
  );
}
