import { useState, type FormEvent } from "react";

import {
  searchRepositories,
  type RepositorySearchResult,
} from "./githubApi";

type RepositorySearchProps = {
  token: string;
};

type RepositorySearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; repositories: RepositorySearchResult[] }
  | { status: "error"; message: string };

export default function RepositorySearch({token}: RepositorySearchProps) {

  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<RepositorySearchState>({ status: "idle"});

  async function handleSubmit( event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (searchState.status === "loading") {
      return;
    }

    setSearchState({
      status: "loading",
    });

    try {
      const repositories = await searchRepositories(query, token);

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

  const isLoading = searchState.status === "loading";

  return (
    <section aria-labelledby="repository-search-heading">
      <h2 id="repository-search-heading">
        Search GitHub repositories
      </h2>

      <form
        onSubmit={handleSubmit}
        aria-busy={isLoading}
      >
        <label htmlFor="repository-query">
          Repository search
        </label>

        <input
          id="repository-query"
          name="query"
          type="search"
          value={query}
          maxLength={256}
          required
          disabled={isLoading}
          autoComplete="off"
          onChange={(event) =>
            setQuery(event.currentTarget.value)
          }
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {searchState.status === "loading" && (
        <p role="status">Searching GitHub...</p>
      )}

      {searchState.status === "error" && (
        <p role="alert">{searchState.message}</p>
      )}

      {searchState.status === "success" &&
        searchState.repositories.length === 0 && (
          <p>No repositories matched your search.</p>
        )}

      {searchState.status === "success" &&
        searchState.repositories.length > 0 && (
          <ul>
            {searchState.repositories.map((repository) => (
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
                    {repository.language ?? "Not specified"}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}