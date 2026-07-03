import type { Anime } from "../../lib/anilist";
import { ScoreBadge } from "../atoms/score-badge";

export function AnimeGrid({ animes }: Readonly<{ animes: readonly Anime[] }>) {
  if (animes.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        Nenhum anime encontrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {animes.map((anime) => (
        <article
          className="overflow-hidden rounded-md border border-border bg-background shadow-sm"
          key={anime.id}
        >
          <div className="aspect-[3/4] bg-muted">
            {anime.coverImageUrl ? (
              <img
                alt={anime.title}
                className="h-full w-full object-cover"
                loading="lazy"
                src={anime.coverImageUrl}
              />
            ) : null}
          </div>
          <div className="space-y-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="line-clamp-2 text-sm font-semibold leading-5">{anime.title}</h2>
              <ScoreBadge score={anime.averageScore} />
            </div>
            <p className="text-xs text-muted-foreground">{anime.format ?? "Formato indisponivel"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

