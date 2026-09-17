import getApiBaseUrl from "../../lib/apiBaseUrl";

export type CreateFavoriteRequest ={
    repoId: string;
    name: string;
    description: string | null;
    starCount: number;
    url: string;
    language: string | null;
}

export type ApiError = {
    message: string;
  };

  export function isApiError(data: unknown): data is ApiError {
    return (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data) &&
      "message" in data &&
      typeof data.message === "string"
    );
  }

export type Favorite = CreateFavoriteRequest & {
    id: number;
}
function isFavorite(data: unknown): data is Favorite {
    return (
      typeof data === "object" &&
      data !== null &&
      !Array.isArray(data) &&
      "id" in data &&
      typeof data.id === "number" &&
      Number.isSafeInteger(data.id) &&
      data.id > 0 &&
      "repoId" in data &&
      typeof data.repoId === "string" &&
      "name" in data &&
      typeof data.name === "string" &&
      "description" in data &&
      (typeof data.description === "string" || data.description === null) &&
      "starCount" in data &&
      typeof data.starCount === "number" &&
      Number.isSafeInteger(data.starCount) &&
      data.starCount >= 0 &&
      "url" in data &&
      typeof data.url === "string" &&
      "language" in data &&
      (typeof data.language === "string" || data.language === null)
    );
  }

  export async function getFavorites(token: string): Promise<Favorite[]> {
    const response = await fetch(
      `${getApiBaseUrl()}/user/favorites`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data: unknown = await response.json();

    if (!response.ok) {
      if (isApiError(data)) {
        throw new Error(data.message);
      }

      throw new Error(`Request failed with status ${response.status}`);
    }

    if (!Array.isArray(data) || !data.every(isFavorite)) {
      throw new Error("Unexpected response shape from endpoint");
    }

    return data;
  }

  export async function deleteFavorite(token: string, favoriteId: number): Promise<void>{
    const response = await fetch(`${getApiBaseUrl()}/user/favorites/${favoriteId}`,{
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      },
    }

)
if(response.ok){
    return;
}
const data: unknown = await response.json();
if(isApiError(data)){
    throw new Error(data.message);
}
throw new Error(`Request failed with status ${response.status}`)
  }