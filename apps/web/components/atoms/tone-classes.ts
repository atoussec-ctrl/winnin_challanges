export const toneClasses = {
  danger: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-200",
  empty:
    "border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  warning:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
} as const;

export type Tone = keyof typeof toneClasses;
