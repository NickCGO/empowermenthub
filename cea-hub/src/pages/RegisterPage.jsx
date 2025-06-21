import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// --- FINAL AND CORRECTED RegisterPage.jsx ---
function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', contact_details: '', province: '', about_me: '', training_completed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // State to show the success message
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.about_me.length > 300) {
      setError("About Me section cannot exceed 300 characters.");
      return;
    }
    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setLoading(true);

    try {
      // 1. Create the Supabase Auth user. This automatically sends the confirmation email.
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Registration failed: No user was created.");

      // 2. Call our backend to create the corresponding agent record
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/register-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          name: formData.name,
          email: formData.email,
          contact_details: formData.contact_details,
          province: formData.province,
          about_me: formData.about_me,
          training_completed: formData.training_completed,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create agent profile.');

      // 3. DO NOT automatically log in. Instead, show a success message.
      setSuccess(true);

    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If registration was successful, we show a different view.
  if (success) {
    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
            <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-green-600">Registration Successful!</h1>
                <p className="mt-4 text-gray-700">
                    A confirmation link has been sent to **{formData.email}**.
                    Please click the link in the email to activate your account before logging in.
                </p>
                <Link to="/login" className="inline-block w-full px-4 py-2 mt-6 font-bold text-white rounded-md bg-navy hover:bg-opacity-90">
                    Go to Login Page
                </Link>
            </div>
        </div>
    );
  }

  // Default registration form view
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-navy">Agent Registration</h1>
        {error && <p className="p-3 text-center text-red-700 bg-red-100 rounded-md">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* All your form inputs remain the same */}
          <input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-navy focus:border-navy" />
          <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-navy focus:border-navy" />
          <input name="password" type="password" placeholder="Password (min 6 characters)" value={formData.password} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-navy focus:border-navy" />
          <input name="contact_details" type="tel" placeholder="Contact Number (e.g., WhatsApp)" value={formData.contact_details} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-navy focus:border-navy" />
          <input name="province" type="text" placeholder="Province" value={formData.province} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-navy focus:border-navy" />
          <textarea name="about_me" placeholder="About Me (max 300 characters)" value={formData.about_me} onChange={handleChange} maxLength="300" rows="3" className="w-full px-3 py-2 border rounded-md focus:ring-navy focus:border-navy" />
          <div className="flex items-center">
            <input id="training_completed" name="training_completed" type="checkbox" checked={formData.training_completed} onChange={handleChange} className="w-4 h-4 border-gray-300 rounded text-navy focus:ring-navy" />
            <label htmlFor="training_completed" className="block ml-2 text-sm text-gray-900">I have completed the required training.</label>
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white rounded-md bg-navy hover:bg-opacity-90 disabled:bg-gray-400">
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-center">Already have an account? <Link to="/login" className="font-medium text-navy hover:underline">Log In</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;