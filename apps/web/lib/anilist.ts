import { postGraphql } from "./graphql-client";

export type AnimeFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC";

export interface Anime {
  readonly id: number;
  readonly title: string;
  readonly coverImageUrl: string;
  readonly format: AnimeFormat | null;
  readonly averageScore: number | null;
}

interface AniListMedia {
  readonly id: number;
  readonly title: {
    readonly romaji?: string | null;
    readonly english?: string | null;
    readonly native?: string | null;
  };
  readonly coverImage?: {
    readonly large?: string | null;
  } | null;
  readonly format?: AnimeFormat | null;
  readonly averageScore?: number | null;
}

interface AniListData {
  readonly Page?: {
    readonly media?: readonly AniListMedia[];
  };
}

const SEARCH_ANIME_QUERY = `
  query SearchAnime($search: String, $format: MediaFormat, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search, format: $format, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
        }
        format
        averageScore
      }
    }
  }
`;

export interface SearchAnimeParams {
  readonly search?: string;
  readonly format?: AnimeFormat;
  readonly page?: number;
  readonly perPage?: number;
}

export async function searchAnime(params: SearchAnimeParams): Promise<readonly Anime[]> {
  const endpoint = process.env.NEXT_PUBLIC_ANILIST_GRAPHQL_URL ?? "https://graphql.anilist.co";
  const data = await postGraphql<AniListData>({
    endpoint,
    label: "AniList",
    query: SEARCH_ANIME_QUERY,
    variables: {
      format: params.format,
      page: params.page ?? 1,
      perPage: params.perPage ?? 24,
      search: params.search?.trim() || undefined
    }
  });

  return (data.Page?.media ?? []).map((media) => ({
    averageScore: media.averageScore ?? null,
    coverImageUrl: media.coverImage?.large ?? "",
    format: media.format ?? null,
    id: media.id,
    title: media.title.english ?? media.title.romaji ?? media.title.native ?? "Untitled"
  }));
}
