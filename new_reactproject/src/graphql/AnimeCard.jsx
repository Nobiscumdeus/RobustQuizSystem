import PropTypes  from "prop-types";
import { useState } from "react";

function AnimeCard({ anime }) {
    const [showDetails, setShowDetails] = useState(false);
    const title = anime.title.english || anime.title.romaji || anime.title.native;
  
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {anime.coverImage?.large && (
          <img 
            src={anime.coverImage.large} 
            alt={title}
            className="w-full h-48 object-cover"
          />
        )}
        
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h2>
          
          <div className="flex items-center justify-between mb-2">
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {anime.status || 'Unknown'}
            </span>
            {anime.averageScore && (
              <span className="flex items-center">
                ⭐ {anime.averageScore / 10}
              </span>
            )}
          </div>
  
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
  
          {showDetails && (
            <div className="mt-3 text-sm text-gray-600">
              <p className="line-clamp-4">{anime.description || 'No description available.'}</p>
              {anime.siteUrl && (
                <a 
                  href={anime.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-purple-600 hover:underline"
                >
                  View on AniList
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }


  AnimeCard.propTypes = {
    anime: PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.shape({
        english: PropTypes.string,
        romaji: PropTypes.string,
        native: PropTypes.string,
      }).isRequired,
      description: PropTypes.string,
      coverImage: PropTypes.shape({
        large: PropTypes.string,
      }),
      siteUrl: PropTypes.string,
      averageScore: PropTypes.number,
      status: PropTypes.string,
      episodes: PropTypes.number,
    }).isRequired,
  };

  export default AnimeCard;