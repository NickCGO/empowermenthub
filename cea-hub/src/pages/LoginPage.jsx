import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Assuming paths are correct relative to the pages directory
import blueSidePhoto from '../assets/blue-side-photo .jpg';
import eruditeLogo from '../assets/erudite-logo.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login: Login form submitted");

    setLoading(true);
    setError(null);

    console.log("Login: Calling supabase.auth.signInWithPassword...");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (signInError) {
      console.error('Login: Supabase signIn error:', signInError.message);
      setError(`Login failed: ${signInError.message}`);
    }
    
    setLoading(false);
    console.log("Login: handleLogin function finished.");
  };

  return (
    <div className="flex h-screen">
      {/* Left Half - Visual Side */}
      <div className="flex items-center justify-center w-1/2 p-8 overflow-hidden bg-navy">
           <img
              src={blueSidePhoto}
              alt="Abstract blue background photo"
              className="object-contain max-w-full max-h-full"
           />
      </div>

      {/* Right Half - Login Form Side */}
      <div className="flex items-center justify-center w-1/2 p-8 bg-white">
        <div className="w-full max-w-md px-8 py-6 text-left bg-white rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
               <img
                  src={eruditeLogo}
                  alt="Erudite Agent Hub Logo"
                   className="object-contain w-auto h-20"
               />
          </div>

          <h3 className="mb-6 text-2xl font-bold text-center">
             <span className="text-navy">Erudite Agent</span>
             {' '}
             <span className="text-orange-500">Hub</span>
          </h3>

          {error && <p className="mt-2 text-sm text-center text-red-500">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-800" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-800" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-baseline justify-between mt-4">
                 <Link to="/register" className="text-sm text-blue-600 hover:underline">
                     Don't have an account? Register
                 </Link>
                 <button
                   type="submit"
                   className="px-6 py-2 text-white rounded-lg bg-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-navy focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   disabled={loading}
                 >
                   {loading ? 'Logging in...' : 'Login'}
                 </button>
              </div>
            </div>
          </form>

          {/* --- THIS IS THE NEWLY ADDED SECTION --- */}
          <div className="mt-6 text-sm text-center">
            <p className="text-gray-600">
              Looking for a local agent?{' '}
              <Link to="/find-agent" className="font-semibold text-navy-700 hover:text-orange-500">
                Find an Agent
              </Link>
            </p>
          </div>
          {/* ------------------------------------ */}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;