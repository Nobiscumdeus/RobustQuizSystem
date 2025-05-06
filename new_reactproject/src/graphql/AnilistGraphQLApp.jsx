// src/AniListApp.jsx
import { useQuery, gql } from '@apollo/client';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SearchBar from './SearchBar';
import AnimeGrid from './AnimeGrid';
import Pagination from './Pagination';

const ANILIST_QUERY = gql`
  query GetAnimeList($page: Int, $perPage: Int, $search: String) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search) {
        id
        title {
          english
          native
          romaji
        }
        description(asHtml: false)
        coverImage {
          large
        }
        siteUrl
        averageScore
        episodes
        status
      }
    }
  }
`;

function AniListApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { loading, error, data } = useQuery(ANILIST_QUERY, {
    variables: { page, perPage, search: searchQuery },
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const animeList = data?.Page?.media || [];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">🎌 AniList Explorer</h1>
      
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      
      <AnimeGrid animeList={animeList} />
      
      <Pagination 
        page={page}
        setPage={setPage}
        hasNextPage={animeList.length === perPage}
      />
    </div>
  );
}


export default AniListApp