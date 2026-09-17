import { Router } from "express";

import { authenticateToken } from "../middleware/authenticateToken.js";

type GitHubRepository = {
  id: number;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
};

type GitHubSearchResponse = {
  items: GitHubRepository[];
};

type RepositorySearchResult = {
  repoId: string;
  name: string;
  description: string | null;
  starCount: number;
  url: string;
  language: string | null;
};

function isGitHubRepository(data: unknown): data is GitHubRepository {
  return (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    "id" in data &&
    typeof data.id === "number" &&
    Number.isSafeInteger(data.id) &&
    data.id > 0 &&
    "full_name" in data &&
    typeof data.full_name === "string" &&
    data.full_name.trim().length > 0 &&
    "description" in data &&
    (typeof data.description === "string" || data.description === null) &&
    "stargazers_count" in data &&
    typeof data.stargazers_count === "number" &&
    Number.isSafeInteger(data.stargazers_count) &&
    data.stargazers_count >= 0 &&
    "html_url" in data &&
    typeof data.html_url === "string" &&
    data.html_url.trim().length > 0 &&
    "language" in data &&
    (typeof data.language === "string" || data.language === null)
  );
}

function isGitHubSearchResponse(
  data: unknown,
): data is GitHubSearchResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    "items" in data &&
    Array.isArray(data.items) &&
    data.items.every(isGitHubRepository)
  );
}

const githubRouter = Router();

githubRouter.get(
  "/repositories",
  authenticateToken,
  async (request, response) => {
    const query: unknown = request.query.query;

    if (typeof query !== "string") {
      return response.status(400).json({
        message: "Invalid search query",
      });
    }

    const searchQuery = query.trim();

    if (searchQuery.length === 0 || searchQuery.length > 256) {
      return response.status(400).json({
        message: "Invalid search query",
      });
    }

    const githubUrl = new URL(
      "https://api.github.com/search/repositories",
    );

    githubUrl.searchParams.set("q", searchQuery);
    githubUrl.searchParams.set("per_page", "10");

    let githubResponse: globalThis.Response;

    try {
      githubResponse = await fetch(githubUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
          "User-Agent": "github-repo-explorer",
        },
      });
    } catch {
      return response.status(502).json({
        message: "GitHub search is currently unavailable",
      });
    }

    if (!githubResponse.ok) {
      return response.status(502).json({
        message: "GitHub search is currently unavailable",
      });
    }

    let data: unknown;

    try {
      data = await githubResponse.json();
    } catch {
      return response.status(502).json({
        message: "Unexpected response from GitHub",
      });
    }

    if (!isGitHubSearchResponse(data)) {
      return response.status(502).json({
        message: "Unexpected response from GitHub",
      });
    }

    const repositories: RepositorySearchResult[] = data.items.map(
      (repository) => ({
        repoId: String(repository.id),
        name: repository.full_name,
        description: repository.description,
        starCount: repository.stargazers_count,
        url: repository.html_url,
        language: repository.language,
      }),
    );

    return response.status(200).json(repositories);
  },
);

export { githubRouter };