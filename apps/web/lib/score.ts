export type ScoreTone = "danger" | "warning" | "success" | "empty";

export function getScoreTone(score: number | null | undefined): ScoreTone {
  if (score === null || score === undefined) {
    return "empty";
  }

  if (score < 50) {
    return "danger";
  }

  if (score <= 80) {
    return "warning";
  }

  return "success";
}

