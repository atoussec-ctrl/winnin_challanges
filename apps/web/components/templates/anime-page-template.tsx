"use client";

import { useCallback, useEffect, useState } from "react";
import type { Anime, AnimeFormat } from "../../lib/anilist";
import { searchAnime } from "../../lib/anilist";
import { AnimeToolbar } from "../molecules/anime-toolbar";
import { AnimeGrid } from "../organisms/anime-grid";

export function AnimePageTemplate() {
  const [animes, setAnimes] = useState<readonly Anime[]>([]);
  const [activeFormat, setActiveFormat] = useState<AnimeFormat | "">("");
  const [activeSearch, setActiveSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<AnimeFormat | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAnimes = useCallback(async (): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      setAnimes(
        await searchAnime({
          format: activeFormat || undefined,
          search: activeSearch
        })
      );
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Erro ao carregar animes.");
    } finally {
      setIsLoading(false);
    }
  }, [activeFormat, activeSearch]);

  useEffect(() => {
    void loadAnimes();
  }, [loadAnimes]);

  function submitFilters(): void {
    setActiveFormat(format);
    setActiveSearch(search);
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-normal">Anime Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Busca e filtros usando AniList GraphQL.
          </p>
        </header>

        <AnimeToolbar
          format={format}
          onFormatChange={setFormat}
          onSearchChange={setSearch}
          onSubmit={submitFilters}
          search={search}
        />

        {error ? (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center rounded-md border border-border text-sm text-muted-foreground">
            Carregando animes...
          </div>
        ) : (
          <AnimeGrid animes={animes} />
        )}
      </section>
    </main>
  );
}
