
import PropTypes from 'prop-types';
import AnimeCard from './AnimeCard';

function AnimeGrid({ animeList }) {
    if (animeList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No anime found. Try a different search.</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animeList.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    );
  }

  AnimeGrid.propTypes = {
    animeList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.shape({
          english: PropTypes.string,
          romaji: PropTypes.string,
          native: PropTypes.string,
        }).isRequired,
        coverImage: PropTypes.shape({
          large: PropTypes.string,
        }),
        siteUrl: PropTypes.string,
        averageScore: PropTypes.number,
        status: PropTypes.string,
      })
    ).isRequired,
  };


  export default AnimeGrid;