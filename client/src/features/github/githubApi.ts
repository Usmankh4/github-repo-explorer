import getApiBaseUrl from "../../lib/apiBaseUrl"

export type RepositorySearchResult = {
    repoId: string
    name: string
    description: string | null
    starCount: number
    url: string
    language: string | null
}


function isRepositorySearchResult(data: unknown): data is RepositorySearchResult{
    return (
        typeof data === "object" &&
        data !== null &&
        !Array.isArray(data) &&
        "repoId" in data &&
        typeof data.repoId === "string" &&
        data.repoId.trim().length > 0 &&
        "name" in data &&
        typeof data.name === "string" &&
        data.name.trim().length > 0 &&
        "description" in data &&
        (typeof data.description === "string" || data.description === null) &&
        "starCount" in data &&
        typeof data.starCount === "number" &&
        Number.isSafeInteger(data.starCount) &&
        data.starCount >= 0 &&
        "url" in data &&
        typeof data.url === "string" &&
        data.url.trim().length > 0 &&
        "language" in data &&
        (typeof data.language === "string" || data.language === null)
      );

}


export async function searchRepositories(query: string, token: string): Promise<RepositorySearchResult[]> {
    const searchQuery = query.trim();

    if (searchQuery.length === 0 || searchQuery.length > 256) {
      throw new Error("Enter a valid search query");
    }

    const searchParameters = new URLSearchParams({
      query: searchQuery,
    });

    const response = await fetch(
      `${getApiBaseUrl()}/github/repositories?${searchParameters.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data: unknown = await response.json();

    if (!response.ok) {
      if (
        typeof data === "object" &&
        data !== null &&
        !Array.isArray(data) &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        throw new Error(data.message);
      }

      throw new Error(`Request failed with status ${response.status}`);
    }

    if (
      !Array.isArray(data) ||
      !data.every(isRepositorySearchResult)
    ) {
      throw new Error("Unexpected response shape from endpoint");
    }

    return data;
  }
