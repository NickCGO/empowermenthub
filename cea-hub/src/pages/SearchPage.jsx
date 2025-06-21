import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { supabase } from '../lib/supabaseClient'; // Import Supabase client (needed for logout)

// Make sure to accept the userRole prop here
function SearchPage({ session, userRole }) { // Accept the session AND userRole prop
  // State for search input, results, loading, and errors
  const [searchQuery, setSearchQuery] = useState(''); // State for the value in the search input field (initialized to empty string)
  const [searchResults, setSearchResults] = useState([]); // State to store the list of agents found (initialized to empty array)
  const [loading, setLoading] = useState(false); // State to indicate if a search is in progress (initialized to false)
  const [error, setError] = useState(null); // State to store any error messages (initialized to null)
  const [searched, setSearched] = useState(false); // State to track if a search has been attempted (initialized to false)

   // Handle logout (copied from other pages)
   const handleLogout = async () => {
     const { error } = await supabase.auth.signOut();
     if (error) console.error('Error logging out:', error);
     // Redirection is handled by App.jsx onAuthStateChange
   };

  // Implement the search function
  // This function will be called when the search form is submitted
  const handleSearch = async (e) => {
     e.preventDefault(); // Prevent default form submission which would reload the page
     setLoading(true); // Show loading state
     setError(null); // Clear previous errors
     setSearchResults([]); // Clear previous results when a new search starts
     setSearched(true); // Mark that a search has been attempted

     // Basic validation - don't search if query is empty after trimming whitespace
     const searchTerm = searchQuery.trim();
     if (!searchTerm) {
         setLoading(false);
         setSearchResults([]); // Clear previous results
         // Optionally set a message like "Please enter a search term"
         console.log("Search query is empty after trimming.");
         return; // Stop the function here
     }

     // Call backend search endpoint here
     // We will create a backend endpoint like /api/search-agents that accepts the search query
     console.log(`Attempting to search for: "${searchTerm}"`); // Log the search query

     // === Example fetch call (Uncomment and replace with your actual backend endpoint logic later) ===
     // const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; // Get backend URL from env
     // try {
     //    // Make a GET request to your backend, passing the search query as a URL parameter
     //    // Use encodeURIComponent to handle special characters in the query
     //    const response = await fetch(`${backendUrl}/api/search-agents?query=${encodeURIComponent(searchTerm)}`);
     //    console.log("Search backend response status:", response.status); // Log backend response status

     //    if (!response.ok) {
     //        // If backend response is not OK, parse the error message from the response body
     //         const errorData = await response.json(); // Assume backend sends JSON error
     //         throw new Error(errorData.error || `Search failed with status ${response.status}`);
     //    }

     //    // Assuming backend returns an array of matching agent objects { id, name, agent_id }
     //    const data = await response.json();
     //    setSearchResults(data); // Update the state with search results
     //    console.log("Search results received:", data); // Log the received data

     // } catch (err) {
     //    // Catch any errors during the fetch process (network issues, HTTP errors, JSON parsing errors)
     //    console.error("Search error:", err); // Log the detailed error
     //    setError(`Search failed: ${err.message}`); // Display a user-friendly error message
     //    setSearchResults([]); // Clear results on error
     // } finally {
        // Ensure loading is false regardless of success or failure
        setLoading(false);
     // }
     // === End Example fetch call ===

     // --- Placeholder Logic (Remove when backend fetch is implemented) ---
     // Simulate a search result after a delay
     // Check if searchTerm matches dummy data (case-insensitive)
     const lowerSearchTerm = searchTerm.toLowerCase();
     const dummyResults = [
         { id: 'dummy-1', name: 'Agent John', agent_id: 'CEA-001' },
         { id: 'dummy-2', name: 'Another Agent', agent_id: 'CEA-002' },
         { id: 'dummy-3', name: 'Third Agent', agent_id: 'CEA-003' },
         { id: 'dummy-4', name: 'Jane Doe', agent_id: 'AJANE' },
     ].filter(agent =>
         agent.name.toLowerCase().includes(lowerSearchTerm) ||
         agent.agent_id.toLowerCase().includes(lowerSearchTerm)
     );

     setTimeout(() => {
         setSearchResults(dummyResults); // Update results with filtered dummy data
         setLoading(false); // End loading state
         console.log("Simulating search results for term", searchTerm, ":", dummyResults);
     }, 500); // Simulate network delay (reduced to 0.5s)
     // --- End Placeholder Logic ---
  };


  return ( // <-- The component must return JSX
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header with Navigation - Use navy color */}
      <header className="flex items-center justify-between p-4 text-white bg-navy">
        <div className="text-xl font-bold">CEA Hub</div>
        <nav>
          <ul className="flex space-x-4"> {/* This is the list */}
             <li><Link to="/" className="hover:underline">Dashboard</Link></li> {/* Dashboard link */}
             <li><Link to="/profile" className="hover:underline">Profile</Link></li> {/* Profile link */}
             <li><Link to="/search" className="hover:underline">Search</Link></li> {/* Search link */}
             {/* --- NEW: Conditionally display Admin link --- */}
             {/* Make sure to accept userRole as a prop in the SearchPage function definition */}
             {userRole === 'admin' && ( // Only render this list item if userRole is 'admin'
                 <li><Link to="/admin" className="font-bold hover:underline">Admin</Link></li> // Added font-bold for emphasis
             )}
             {/* --- End Admin link --- */}
             <li><button onClick={handleLogout} className="hover:underline focus:outline-none">Logout</button></li> {/* Logout button */}
          </ul>
        </nav>
      </header>
      {/* End Header */}

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-lg p-8 mx-auto bg-white rounded-lg shadow"> {/* Container for search area */}
           <h2 className="mb-6 text-2xl font-bold text-center text-navy-800">Search Agents</h2>

           {/* Search Input Form */}
           {/* Associate form with handleSearch function */}
           <form onSubmit={handleSearch} className="flex items-center mb-4">
               {/* Input field for the search query */}
               <input
                  type="text"
                  placeholder="Enter Agent Name or ID" // Updated placeholder text
                  className="flex-1 px-4 py-2 mr-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy" // Tailwind classes for styling
                  value={searchQuery} // Bind input value to searchQuery state
                  onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on input change
                  disabled={loading} // Disable input while loading
               /> {/* End of input tag */}
                {/* Search button */}
               <button
                  type="submit" // This button submits the form
                   className="px-4 py-2 text-white rounded-md bg-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-50 disabled:cursor-not-allowed" // Tailwind classes for styling
                   disabled={loading || !searchQuery.trim()} // Disable if loading or query is empty after trimming
               >
                  {loading ? 'Searching...' : 'Search'} {/* Change button text while loading */}
               </button>
           </form>
           {/* End Search Input Form */}


           {/* Display loading, error, or no results message */}
           {loading && <p className="mt-4 text-center text-gray-500">Searching...</p>}
           {error && <p className="mt-4 text-center text-red-500">{error}</p>}
           {/* Show 'No agents found' only if search was attempted and results are empty */}
           {!loading && !error && searched && searchResults.length === 0 && (
               <p className="mt-4 text-center text-gray-500">No agents found matching your search.</p>
           )}


           {/* Search Results Display */}
            {!loading && !error && searchResults.length > 0 && (
                <div className="mt-6"> {/* Add space above results */}
                     <h3 className="mb-4 text-lg font-semibold text-gray-800">Search Results</h3>
                     {/* Display search results in a list */}
                     <ul className="space-y-2 text-gray-700"> {/* Use an unordered list */}
                          {/* Map over the searchResults array to display each agent */}
                          {searchResults.map((agent) => (
                              // Use a unique key for each list item (e.g., agent.id from Supabase)
                              <li key={agent.id} className="p-3 bg-gray-100 rounded-md shadow-sm"> {/* Basic styling for each result item */}
                                   <p><span className="font-semibold">Name:</span> {agent.name}</p> {/* Display agent's name */}
                                   {/* Display internal ID from Supabase data */}
                                   <p><span className="font-semibold">Agent ID:</span> {agent.agent_id}</p> {/* Display agent's internal ID */}
                                   {/* TODO: Add ranking if you implement that in the backend search endpoint */}
                                   {/* <p><span className="font-semibold">Rank:</span> {agent.rank}</p> */} {/* Display rank if available */}
                              </li>
                          ))}
                     </ul>
                </div>
            )}
            {/* End Search Results Display */}

        </div>
      </div>
    </div>
  ); // <-- Closing parenthesis for the return statement
} // <-- FINAL CLOSING CURLY BRACE FOR THE COMPONENT FUNCTION

export default SearchPage;