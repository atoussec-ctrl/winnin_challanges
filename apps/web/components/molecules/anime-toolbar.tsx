"use client";

import type { FormEvent } from "react";
import type { AnimeFormat } from "../../lib/anilist";
import { Button } from "../atoms/button";
import { Input } from "../atoms/input";

const formats: readonly { label: string; value: AnimeFormat | "" }[] = [
  { label: "Todos", value: "" },
  { label: "TV", value: "TV" },
  { label: "TV Short", value: "TV_SHORT" },
  { label: "Movie", value: "MOVIE" },
  { label: "OVA", value: "OVA" },
  { label: "ONA", value: "ONA" },
  { label: "Special", value: "SPECIAL" },
  { label: "Music", value: "MUSIC" }
];

export interface AnimeToolbarProps {
  readonly format: AnimeFormat | "";
  readonly search: string;
  readonly onFormatChange: (format: AnimeFormat | "") => void;
  readonly onSearchChange: (search: string) => void;
  readonly onSubmit: () => void;
}

export function AnimeToolbar({
  format,
  onFormatChange,
  onSearchChange,
  onSubmit,
  search
}: AnimeToolbarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row" onSubmit={handleSubmit}>
      <Input
        aria-label="Buscar anime"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por titulo"
        value={search}
      />
      <select
        aria-label="Formato"
        className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onChange={(event) => onFormatChange(event.target.value as AnimeFormat | "")}
        value={format}
      >
        {formats.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit">Buscar</Button>
    </form>
  );
}

