import { afterEach, describe, expect, it, vi } from "vitest";
import { searchAnime } from "./anilist";

describe("searchAnime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes AniList media results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            data: {
              Page: {
                media: [
                  {
                    averageScore: 91,
                    coverImage: { large: "https://image.example/anime.jpg" },
                    format: "TV",
                    id: 1,
                    title: { english: "English title", native: "Native title", romaji: "Romaji title" }
                  }
                ]
              }
            }
          }),
        ok: true
      })
    );

    await expect(searchAnime({ search: "frieren" })).resolves.toEqual([
      {
        averageScore: 91,
        coverImageUrl: "https://image.example/anime.jpg",
        format: "TV",
        id: 1,
        title: "English title"
      }
    ]);
  });

  it("throws when AniList returns HTTP errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })
    );

    await expect(searchAnime({})).rejects.toThrow("AniList request failed with status 500.");
  });

  it("throws when AniList returns GraphQL errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ errors: [{ message: "Invalid query" }] }),
        ok: true
      })
    );

    await expect(searchAnime({})).rejects.toThrow("Invalid query");
  });

  it("normalizes optional AniList fields with fallbacks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            data: {
              Page: {
                media: [
                  {
                    id: 2,
                    title: { english: null, native: "Native title", romaji: "Romaji title" }
                  },
                  {
                    coverImage: { large: null },
                    id: 3,
                    title: { english: null, native: null, romaji: null }
                  }
                ]
              }
            }
          }),
        ok: true
      })
    );

    await expect(searchAnime({})).resolves.toEqual([
      {
        averageScore: null,
        coverImageUrl: "",
        format: null,
        id: 2,
        title: "Romaji title"
      },
      {
        averageScore: null,
        coverImageUrl: "",
        format: null,
        id: 3,
        title: "Untitled"
      }
    ]);
  });

  it("returns an empty list when AniList omits the page payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ data: {} }),
        ok: true
      })
    );

    await expect(searchAnime({})).resolves.toEqual([]);
  });
});
