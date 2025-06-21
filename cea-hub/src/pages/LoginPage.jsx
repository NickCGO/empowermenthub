import React, { useState } from 'react'; // Import React hooks
import { Link } from 'react-router-dom'; // Import Link for navigation
import { supabase } from '../lib/supabaseClient'; // Import your Supabase client

// Assuming these image paths are correct relative to the /src/pages directory
// If your images are in src/assets, the paths should be like '../assets/your-image.jpg'
// If your images are in the public folder, the paths should be like '/your-image.jpg' or '/erudite-logo.png'
// Let's assume they are in src/assets based on your comment, so '../assets/' is correct
import blueSidePhoto from '../assets/blue-side-photo .jpg'; // Path to the background photo
import eruditeLogo from '../assets/erudite-logo.png';     // Path to the logo image

// Ensure your Tailwind config has the 'navy' color defined
// Ensure your Tailwind config has the 'orange-500' color available (it's a default color)
// If you have a custom orange color, update the text-orange-500 class accordingly


// Define the LoginPage functional component.
// This component does NOT accept any props like 'session' or 'userRole' from App.jsx.
function LoginPage() {
  // State variables for form inputs, loading, and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // This will be the agent's chosen password, not their internal ID number
  const [loading, setLoading] = useState(false); // Indicates if login attempt is in progress
  const [error, setError] = useState(null); // Stores any error messages during login


  // Handler for the form submission when the Login button is clicked
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default browser form submission (page reload)
    console.log("Login: Login form submitted"); // Debug log

    setLoading(true); // Set loading state to true
    setError(null); // Clear any previous error messages

    // Call Supabase Auth signInWithPassword function
    console.log("Login: Calling supabase.auth.signInWithPassword..."); // Debug log
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(), // Trim whitespace from email
      password: password.trim(), // Trim whitespace from password
    });

    if (signInError) {
      console.error('Login: Supabase signIn error:', signInError.message); // Log detailed error to console
      setError(`Login failed: ${signInError.message}`); // Set user-friendly error message to display on the page
    }
    // Note: Successful login automatically updates the session state in App.jsx,
    // which triggers the onAuthStateChange listener and handles redirection.

    setLoading(false); // Set loading state to false regardless of success or failure
    console.log("Login: handleLogin function finished."); // Debug log
  };


  // --- Main LoginPage Render ---
  return ( // <-- The component must return JSX
    // Main container for the two-column layout, taking full screen height
    <div className="flex h-screen"> {/* Flex container, takes full viewport height */}

      {/* Left Half - Visual Side with Photo */}
      {/* This div takes half the width and is styled with padding, overflow handling, and navy background */}
      <div className="flex items-center justify-center w-1/2 p-8 overflow-hidden bg-navy"> {/* Flex container, centers content, half width, padding, overflow hidden */}
          {/* Add the background photo image */}
           <img
              src={blueSidePhoto} // Use the imported image variable as the source
              alt="Abstract blue background photo" // Provide descriptive alt text for accessibility
              className="object-contain max-w-full max-h-full" // Ensure photo fits within the div without cropping, maintains aspect ratio
           />
      </div> {/* End of left half */}


      {/* Right Half - Login Form Side */}
      {/* This div takes the other half of the width and is styled with padding and white background */}
      {/* Use flex and items-center/justify-center to center the content (the form block) vertically and horizontally within this half */}
      <div className="flex items-center justify-center w-1/2 p-8 bg-white"> {/* Flex container, centers content, half width, padding */}
        {/* The actual login form container (kept from previous design) */}
        {/* This div has padding, rounded corners, shadow, max width, and ensures content aligns to the left */}
        <div className="w-full max-w-md px-8 py-6 text-left bg-white rounded-lg shadow-lg">

          {/* Logo Area - Placed at the top center of this login block */}
          <div className="flex justify-center mb-4"> {/* Flex container to center horizontally, add bottom margin */}
              {/* Add your logo image tag */}
              {/* Make sure the eruditeLogo variable is imported at the top */}
               <img
                  src={eruditeLogo} // Use the imported logo variable as the source
                  alt="Erudite Agent Hub Logo" // Provide descriptive alt text for accessibility
                   className="object-contain w-auto h-20" // Control height, auto width, maintain aspect ratio
               />
          </div> {/* End of logo area */}


          {/* Application Title: "Erudite Agent Hub" */}
          {/* Apply text-navy to "Erudite Agent", and text-orange-500 to "Hub" */}
          <h3 className="mb-6 text-2xl font-bold text-center"> {/* Title styling */}
             {/* "Erudite Agent" in navy color */}
             <span className="text-navy">Erudite Agent</span> {/* Span for navy color */}
             {' '} {/* Add a space between words */}
             {/* "Hub" now in orange color */}
             {/* Ensure text-orange-500 class is available in your Tailwind config */}
             <span className="text-orange-500">Hub</span> {/* Span for orange color */}
          </h3> {/* End of title */}


          {/* Display error message prominently if any */}
          {error && <p className="mt-2 text-sm text-center text-red-500">{error}</p>} {/* Conditional rendering for error */}


          {/* Login Form */}
          {/* Form associated with the handleLogin handler */}
          <form onSubmit={handleLogin}>
            {/* Container for form fields */}
            <div className="mt-4 space-y-4"> {/* Add vertical space between form field divs */}
              {/* Email Input Field */}
              <div>
                <label className="block mb-1 font-semibold text-gray-800" htmlFor="email">Email</label> {/* Label for email input */}
                <input
                  type="email" // Input type (helps with validation and autofill)
                  id="email"       // Match htmlFor attribute on the label
                  name="email"     // Input name (useful for forms, autofill)
                  placeholder="Email Address" // Placeholder text
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy" // Tailwind styling
                  value={email} // Bind input value to 'email' state
                  onChange={(e) => setEmail(e.target.value)} // Update 'email' state on input change
                  required // Make field required
                  disabled={loading} // Disable input while login is in progress
                />
              </div>
              {/* Password Input Field */}
              <div>
                <label className="block mb-1 font-semibold text-gray-800" htmlFor="password">Password</label> {/* Label for password input */}
                <input
                  type="password" // Input type (hides input text)
                  id="password"    // Match htmlFor attribute on the label
                  name="password"  // Input name
                  placeholder="Password" // Placeholder text
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy" // Tailwind styling
                  value={password} // Bind input value to 'password' state
                  onChange={(e) => setPassword(e.target.value)} // Update 'password' state on input change
                  required // Make field required
                  disabled={loading} // Disable input while login is in progress
                />
              </div>

              {/* Login Button and Register Link */}
              {/* This div contains the Login button and the "Register" link, justified to space them out */}
              <div className="flex items-baseline justify-between mt-4"> {/* Flex container, aligns items to baseline, spaces content horizontally */}
                 {/* Add Register Link */}
                 {/* Link to the new registration page (/register) */}
                 <Link
                     to="/register"
                     className="text-sm text-blue-600 hover:underline" // Styling for the link
                 >
                     Don't have an account? Register {/* Link text */}
                 </Link>
                 {/* Login Button */}
                 {/* Button to submit the form */}
                 <button
                   type="submit"
                   className="px-6 py-2 text-white rounded-lg bg-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed" // Styling
                   disabled={loading} // Disable button while login is in progress
                 >
                   {loading ? 'Logging in...' : 'Login'} {/* Change button text while loading */}
                 </button>
              </div> {/* End of div containing button and link */}

              {/* NOTE: The duplicate div with the login button has been REMOVED from here */}
              {/*
              <div className="flex items-baseline justify-end mt-4">
                <button type="submit" className="..." disabled={loading}> ... </button>
              </div>
              */}

            </div> {/* End of container for form fields */}
          </form> {/* End of Login Form */}

          {/* NOTE: The Link back to Login is handled within the RegistrationPage component */}
          {/* No need for a "Already have an account? Log In" link *on* the Login page itself */}


        </div> {/* End of actual login form container */}
      </div> {/* End of right half */}

    </div> /* End of main two-column container */
  ); // <-- Closing parenthesis for the return statement
} // <-- FINAL CLOSING CURLY BRACE FOR THE COMPONENT FUNCTION

export default LoginPage; // <-- Export the component