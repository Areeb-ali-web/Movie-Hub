import React from 'react'


function MovieCard({ movie }) {
  // Destructure movie object inside the component
  const { title, vote_average, poster_path, release_date, original_language, genres } = movie;
  
  return (
    <div key={movie.id} className="movie-card">
      <img 
        src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'} 
        alt={title}
        className="movie-poster"
      />
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
          <img src="star.svg" alt="" />
          <p>{vote_average.toFixed(1) || 'N/A'}</p>
          <span>•</span>
          <div className='lang'>{original_language || 'N/A'}</div>
           <span>•</span>
           <p className='year'>{release_date ? new Date(release_date).getFullYear() : 'N/A'}</p>
           
           
            
         
          </div>
          
        </div>
        
      </div>
    
    </div>
  )
}

export default MovieCard