import './App.css'
import { useEffect, useState, useRef } from 'react'
import Search from './assets/components/Search'
import Spinner from './assets/components/Spinner'
import heroImage from '../public/hero.png'
import MovieCard from './assets/components/MovieCard'
import { useDebounce } from 'react-use'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState(''); 
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [top10Movies, setTop10Movies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sliderRef = useRef(null);
  
  // Use useDebounce to delay the search term update
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
      // Reset pagination when search term changes
      setCurrentPage(1);
      setMovies([]);
    },
    500,
    [searchTerm]
  );

  const fetchMovies = async (query='', page = 1, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      let endpoint;
      if (query) {
        endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`;
      } else {
        endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;
      }
      
      const response = await fetch(endpoint, API_OPTIONS);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (append) {
        setMovies(prev => [...prev, ...(data.results || [])]);
      } else {
        setMovies(data.results || []);
      }
      
      setTotalPages(data.total_pages);
      
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError(error.message);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Fetch top 10 movies on initial load
  useEffect(() => {
    const fetchTop10 = async () => {
      try {
        const top10 = await fetch(`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`, API_OPTIONS);
        const top10Data = await top10.json();
        setTop10Movies(top10Data.results.slice(0, 10));
      } catch (error) {
        console.error('Error fetching top 10 movies:', error);
      }
    };
    
    fetchTop10();
    fetchMovies('', 1, false);
  }, []);

  // Fetch movies when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchMovies(debouncedSearchTerm, 1, false);
    } else {
      fetchMovies('', 1, false);
    }
  }, [debouncedSearchTerm]);

  const loadMoreMovies = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      if (debouncedSearchTerm) {
        fetchMovies(debouncedSearchTerm, nextPage, true);
      } else {
        fetchMovies('', nextPage, true);
      }
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <main>
      <div className="pattern"/>
      <div className="wrapper">
        <header>
          <img src={heroImage} alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Love without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
      </div>
      
      {/* Top 10 Movies - Only show when no search term */}
      {!debouncedSearchTerm && (
        <section className="px-5 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-5">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Top 10 Movies</h2>
            <div className="flex gap-2">
              <button 
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full bg-light-100/20 border-2 border-light-100 text-light-100 text-2xl flex items-center justify-center hover:bg-light-100 hover:text-primary transition-all duration-300 cursor-pointer"
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button 
                onClick={scrollRight}
                className="w-10 h-10 rounded-full bg-light-100/20 border-2 border-light-100 text-light-100 text-2xl flex items-center justify-center hover:bg-light-100 hover:text-primary transition-all duration-300 cursor-pointer"
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </div>
          
          {/* Slider Container */}
          <div 
            ref={sliderRef}
            className="overflow-x-auto overflow-y-hidden px-5 scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#f5c518 #0f0d23'
            }}
          >
            <style>{`
              .movies-slider::-webkit-scrollbar {
                height: 8px;
              }
              .movies-slider::-webkit-scrollbar-track {
                background: #0f0d23;
                border-radius: 4px;
              }
              .movies-slider::-webkit-scrollbar-thumb {
                background: #f5c518;
                border-radius: 4px;
              }
              .movies-slider::-webkit-scrollbar-thumb:hover {
                background: #ffd700;
              }
            `}</style>
            <div className="flex gap-5 w-max">
              {top10Movies.map((movie, index) => (
                <div 
                  key={movie.id} 
                  className="flex-none w-[200px] transition-transform duration-300 hover:scale-105"
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Movies / Search Results Section */}
      <section className="px-5 py-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white sm:text-3xl mb-6">
          {debouncedSearchTerm ? 'Search Results' : 'Trending Movies'}
        </h2>
        
        {/* Show initial spinner while loading */}
        {isLoading && <Spinner />}
        
        {/* Show error message if there's an error */}
        {error && !isLoading && (
          <div className="error-container">
            <p className="text-white error">Error: {error}</p>
          </div>
        )}
        
        {/* Show movies when not loading and no error */}
        {!isLoading && !error && (
          <>
            {movies.length > 0 ? (
              <>
                <ul className="grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
                
                {/* Show More Button */}
                {currentPage < totalPages && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreMovies}
                      disabled={isLoadingMore}
                      className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isLoadingMore ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Show More Movies'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-white no-movies">
                {debouncedSearchTerm ? `No movies found for "${debouncedSearchTerm}"` : 'No movies found'}
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default App