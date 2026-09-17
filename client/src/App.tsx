import { useEffect, useState } from "react";

import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import type { SuccessfulLoginResponse } from "./features/auth/authApi";
import {
  deleteFavorite,
  getFavorites,
  type Favorite,
} from "./features/favorites/favoritesApi";

type FavoritesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; favorites: Favorite[] }
  | { status: "error"; message: string };

export default function App() {
  const [session, setSession] = useState<SuccessfulLoginResponse | null>(null);

  const [favoritesState, setFavoritesState] = useState<FavoritesState>({status: "idle",});

  const [deletingFavoriteId, setDeletingFavoriteId] = useState<number | null>(null);

  const [favoriteActionError, setFavoriteActionError] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) {
      setFavoritesState({
        status: "idle",
      });

      return;
    }

    const token = session.token;
    let cancelled = false;

    async function loadFavorites() {
      setFavoritesState({
        status: "loading",
      });

      try {
        const favorites = await getFavorites(token);

        if (!cancelled) {
          setFavoritesState({
            status: "success",
            favorites,
          });
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setFavoritesState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Could not load favorites",
          });
        }
      }
    }

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [session]);

  async function handleDeleteFavorite(favoriteId: number) {
    if (session === null || deletingFavoriteId !== null) {
      return;
    }

    setFavoriteActionError(null);
    setDeletingFavoriteId(favoriteId);

    try {
      await deleteFavorite(session.token, favoriteId);

      setFavoritesState((previousState) => {
        if (previousState.status !== "success") {
          return previousState;
        }

        return {
          status: "success",
          favorites: previousState.favorites.filter(
            (favorite) => favorite.id !== favoriteId,
          ),
        };
      });
    } catch (error: unknown) {
      setFavoriteActionError(
        error instanceof Error
          ? error.message
          : "Could not remove favorite",
      );
    } finally {
      setDeletingFavoriteId(null);
    }
  }

  function handleLogin(userData: SuccessfulLoginResponse) {
    setSession(userData);
  }

  function handleLogout() {
    setSession(null);
    setFavoriteActionError(null);
    setDeletingFavoriteId(null);
  }

  return (
    <main>
      <h1>GitHub Repo Explorer</h1>

      {session === null ? (
        <>
          <LoginForm onLogin={handleLogin} />
          <RegisterForm />
        </>
      ) : (
        <>
          <section aria-label="Account">
            <p>Signed in as {session.username}</p>

            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </section>

          <section aria-labelledby="favorites-heading">
            <h2 id="favorites-heading">Saved repositories</h2>

            {favoriteActionError !== null && (
              <p role="alert">{favoriteActionError}</p>
            )}

            {favoritesState.status === "loading" && (
              <p role="status">Loading favorites...</p>
            )}

            {favoritesState.status === "error" && (
              <p role="alert">{favoritesState.message}</p>
            )}

            {favoritesState.status === "success" &&
              favoritesState.favorites.length === 0 && (
                <p>You have not saved any repositories yet.</p>
              )}

            {favoritesState.status === "success" &&
              favoritesState.favorites.length > 0 && (
                <ul>
                  {favoritesState.favorites.map((favorite) => (
                    <li key={favorite.id}>
                      <article>
                        <h3>
                          <a
                            href={favorite.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {favorite.name}
                          </a>
                        </h3>

                        {favorite.description !== null && (
                          <p>{favorite.description}</p>
                        )}

                        <p>
                          Stars: {favorite.starCount.toLocaleString()}
                        </p>

                        <p>
                          Language: {favorite.language ?? "Not specified"}
                        </p>

                        <button
                          type="button"
                          disabled={deletingFavoriteId !== null}
                          onClick={() =>
                            void handleDeleteFavorite(favorite.id)
                          }
                        >
                          {deletingFavoriteId === favorite.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </>
      )}
    </main>
  );
}