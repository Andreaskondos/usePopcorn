import { useEffect, useState } from "react";

const KEY = "6a73e5d5";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      try {
        if (query.length < 3) {
          setError("");
          setMovies([]);
          return;
        }

        const controller = new AbortController();

        async function fetchMovies() {
          setError("");
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Something went wrong");
          const data = await res.json();
          if (data.Response === "False") throw new Error("No movies found");
          setMovies(data.Search);
          setError("");
        }

        // callback?.()
        fetchMovies();

        return function () {
          controller.abort();
        };
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [query]
  );
  return { movies, error, isLoading };
}
