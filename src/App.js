import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  Math.round(
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0) * 100
  ) / 100;
// const KEY = "f84fc31d";
const KEY = "6a73e5d5";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  // const [watched, setWatched] = useState([]);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((mov) => mov.imdbID !== id));
  }

  function handleAddWatched(movie) {
    if (
      watched.filter(
        (mov) =>
          movie.imdbID === mov.imdbID && movie.userRating === mov.userRating
      ).length
    )
      return;
    if (watched.filter((mov) => movie.imdbID === mov.imdbID).length) {
      setWatched((watched) =>
        watched.map((mov) =>
          mov.imdbID === movie.imdbID
            ? { ...mov, userRating: movie.userRating }
            : mov
        )
      );
    } else setWatched((watched) => [...watched, movie]);
    // setWatched((watched) => [...watched, movie]);
    setSelectedID(null);
  }

  function handleSelectedID(id) {
    setSelectedID((selectedID) => (id === selectedID ? null : id));
  }

  const { movies, error, isLoading } = useMovies(query);

  return (
    <>
      <NavigationBar>
        <Search query={query} setQuery={setQuery} />
        <SearchResults movies={movies} />
      </NavigationBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <ResultList movies={movies} handleClickedMovie={handleSelectedID} />
          )}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              id={selectedID}
              setSelectedID={setSelectedID}
              addWatched={handleAddWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList movies={watched} onDelete={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">LOADING...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function NavigationBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function SearchResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies && movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}

function ResultList({ movies, handleClickedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <ResultMovie movie={movie} handleClickedMovie={handleClickedMovie} />
      ))}
    </ul>
  );
}

function WatchedList({ movies, onDelete }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <WatchedMovie movie={movie} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function ResultMovie({ movie, handleClickedMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => handleClickedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMovie({ movie, onDelete }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => onDelete(movie.imdbID)}>
        <strong>X</strong>
      </button>
    </li>
  );
}

function MovieDetails({ id, setSelectedID, addWatched }) {
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(0);

  const ratingDecisions = useRef(0);

  function handleAdd(movie) {
    const tempMovie = { ...movie, userRating };
    addWatched(tempMovie);
  }

  function handleBackBtn() {
    setSelectedID(null);
  }

  useEffect(
    function () {
      if (userRating) ratingDecisions.current++;
    },
    [userRating]
  );

  useKey("Escape", () => setSelectedID(null));

  useEffect(
    function () {
      async function fetchMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${id}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      fetchMovieDetails();
    },
    [id]
  );

  return movie ? (
    isLoading ? (
      <Loader />
    ) : (
      <Details
        movie={movie}
        handleBackBtn={handleBackBtn}
        handleAdd={handleAdd}
        setUserRating={setUserRating}
        userRating={userRating}
        ratingDecisions={ratingDecisions.current}
      />
    )
  ) : (
    ""
  );
}

function Details({
  movie,
  handleBackBtn,
  setUserRating,
  handleAdd,
  userRating,
  ratingDecisions,
}) {
  const {
    imdbID,
    Year: year,
    Title: title,
    Runtime: runtime,
    Released: released,
    Actors: actors,
    Awards: awards,
    Genre: genre,
    imdbRating,
    Plot: plot,
    Poster: poster,
    Director: director,
  } = movie;

  useEffect(
    function () {
      document.title = `Movie | ${title}`;

      return () => (document.title = "usePopcorn");
    },
    [title]
  );

  function addWatched() {
    const watchedMovie = {
      imdbID,
      title,
      year,
      poster,
      runtime: runtime.split(" ")[0] * 1,
      imdbRating,
      ratingDecisions,
    };
    handleAdd(watchedMovie);
  }

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={handleBackBtn}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${title}`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>⭐ {imdbRating} IMDb rating</p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StarRating size={24} maxRating={10} onSetRating={setUserRating} />
          {userRating > 0 && (
            <button className="btn-add" onClick={addWatched}>
              +Add to list
            </button>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
        <p>Awards: {awards}</p>
      </section>
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
