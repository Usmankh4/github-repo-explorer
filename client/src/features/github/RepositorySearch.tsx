import { useState, type FormEvent } from "react";

import {
  createFavorite,
  type Favorite,
} from "../favorites/favoritesApi";
import {
  searchRepositories,
  type RepositorySearchResult,
} from "./githubApi";

type RepositorySearchProps = {
  token: string;
  canSave: boolean;
  savedRepositoryIds: ReadonlySet<string>;
  onFavoriteSaved: (favorite: Favorite) => void;
};

type RepositorySearchState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      repositories: RepositorySearchResult[];
    }
  | { status: "error"; message: string };

export default function RepositorySearch({token, canSave,savedRepositoryIds,onFavoriteSaved,}: RepositorySearchProps) {
    const [query, setQuery] = useState("");
    const [searchState, setSearchState] =
    useState<RepositorySearchState>({ status: "idle",});

  const [savingRepositoryId, setSavingRepositoryId] = useState<string | null>(null);

  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchQuery = query.trim();

    if (searchQuery.length === 0) {
      setSearchState({
        status: "error",
        message: "Enter a repository search",
      });

      return;
    }

    setSearchState({
      status: "loading",
    });

    setSaveError(null);

    try {
      const repositories = await searchRepositories(searchQuery,token);

      setSearchState({
        status: "success",
        repositories,
      });
    } catch (error: unknown) {
      setSearchState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not search repositories",
      });
    }
  }

  async function handleSave(repository: RepositorySearchResult) {

    const isAlreadySaved = savedRepositoryIds.has(repository.repoId);

    if (!canSave || isAlreadySaved || savingRepositoryId !== null) {
      return;
    }

    setSaveError(null);
    setSavingRepositoryId(repository.repoId);

    try {
      const createdFavorite = await createFavorite(token, repository);

      onFavoriteSaved(createdFavorite);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save repository",
      );
    } finally {
      setSavingRepositoryId(null);
    }
  }

  return (
    <section aria-labelledby="repository-search-heading">
      <h2 id="repository-search-heading">
        Search GitHub repositories
      </h2>

      <form onSubmit={handleSearch}>
        <label htmlFor="repository-query">
          Repository name
        </label>

        <input
          id="repository-query"
          name="query"
          type="search"
          value={query}
          required
          maxLength={256}
          placeholder="Search for React, TypeScript..."
          onChange={(event) =>
            setQuery(event.currentTarget.value)
          }
        />

        <button
          type="submit"
          disabled={searchState.status === "loading"}
        >
          {searchState.status === "loading"
            ? "Searching..."
            : "Search"}
        </button>
      </form>

      {searchState.status === "error" && (
        <p role="alert">{searchState.message}</p>
      )}

      {saveError !== null && (
        <p role="alert">{saveError}</p>
      )}

      {searchState.status === "success" &&
        searchState.repositories.length === 0 && (
          <p>No repositories found.</p>
        )}

      {searchState.status === "success" &&
        searchState.repositories.length > 0 && (
          <ul>
            {searchState.repositories.map(
              (repository) => {
                const isSaved =
                  savedRepositoryIds.has(
                    repository.repoId,
                  );

                const isSaving =
                  savingRepositoryId ===
                  repository.repoId;

                return (
                  <li key={repository.repoId}>
                    <article>
                      <h3>
                        <a
                          href={repository.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {repository.name}
                        </a>
                      </h3>

                      {repository.description !== null && (
                        <p>{repository.description}</p>
                      )}

                      <p>
                        Stars:{" "}
                        {repository.starCount.toLocaleString()}
                      </p>

                      <p>
                        Language:{" "}
                        {repository.language ??
                          "Not specified"}
                      </p>

                      <button
                        type="button"
                        disabled={
                          !canSave ||
                          isSaved ||
                          savingRepositoryId !== null
                        }
                        onClick={() =>
                          void handleSave(repository)
                        }
                      >
                        {isSaved
                          ? "Saved"
                          : isSaving
                            ? "Saving..."
                            : "Save"}
                      </button>
                    </article>
                  </li>
                );
              },
            )}
          </ul>
        )}
    </section>
  );
}