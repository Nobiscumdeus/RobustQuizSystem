import PropTypes from "prop-types";

function SearchBar({searchQuery,setSearchQuery,setPage}){
    return(
        <div className="mb-6">
            <div className="relative">
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e)=>{
                        setSearchQuery(e.target.value)
                        setPage(1)
                    }}
                     placeholder="Search anime..."
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>

            </div>

        </div>
    )

}

SearchBar.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    setPage: PropTypes.func.isRequired,
  };

export default SearchBar;