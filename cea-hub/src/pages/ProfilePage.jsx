import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';

// --- FINAL AND COMPLETE ProfilePage.jsx with Upload Functionality ---
function ProfilePage({ session, userRole, agentInfo, handleLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_details: '',
    about_me: '',
    province: '',
    town: '',
  });
  const [saving, setSaving] = useState(false);

  // --- NEW STATE for file upload ---
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- useEffect hook is now fixed to prevent endless loading ---
  useEffect(() => {
    const fetchProfile = async () => {
      const agentId = session?.user?.id;
      if (!agentId) {
        setError("User session not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSaveSuccess(false);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      try {
        const response = await fetch(`${backendUrl}/api/get-agent-profile`, {
  headers: { 'Authorization': `Bearer ${session.access_token}` }
});
        const profileData = await response.json();
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          address: profileData.address || '',
          contact_details: profileData.contact_details || '',
          about_me: profileData.about_me || '',
          province: profileData.province || '',
          town: profileData.town || '',
        });
      } catch (err) {
        console.error("Profile: Error fetching profile:", err);
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setLoading(false); // This guarantees the loading screen goes away
      }
    };

    fetchProfile();
  }, [session?.user?.id]); // Depend only on the stable user ID

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    const agentId = session?.user?.id;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${backendUrl}/api/update-agent-profile/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // Good practice to include auth
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Profile save failed`);
      }
      const result = await response.json();
      setProfile(result);
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError(`Failed to save profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // --- NEW: Function to handle file selection ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  // --- NEW: Function to handle picture upload ---
  const handleUploadPicture = async () => {
    if (!fileToUpload) {
      alert("Please select a file first.");
      return;
    }
    setUploading(true);
    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    const formData = new FormData();
    formData.append('profileImage', fileToUpload);

    try {
      const response = await fetch(`${backendUrl}/api/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed');
      
      // Update local profile state to show new image instantly
      setProfile({ ...profile, photo_url: result.photo_url });
      setFileToUpload(null);
      alert("Profile picture updated successfully!");
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        address: profile.address || '',
        contact_details: profile.contact_details || '',
        about_me: profile.about_me || '',
        province: profile.province || '',
        town: profile.town || '',
      });
    }
    setIsEditing(false);
    setError(null);
    setSaveSuccess(false);
    setFileToUpload(null); // Also clear any selected file on cancel
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-navy">My Profile</h1>
            {!isEditing && (
              <button onClick={() => { setIsEditing(true); setSaveSuccess(false); }} className="px-4 py-2 text-white rounded-md bg-navy hover:bg-opacity-90">
                Edit Profile
              </button>
            )}
          </div>
          
          {loading && <p className="text-center text-gray-500">Loading profile...</p>}
          {error && <p className="mb-4 text-center text-red-500">{error}</p>}
          {saveSuccess && <p className="mb-4 text-center text-green-500">Profile updated successfully!</p>}
          
          {!loading && profile && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* --- Profile Picture Section --- */}
              <div className="flex flex-col items-center md:col-span-1">
                <img 
                  src={profile.photo_url || `https://ui-avatars.com/api/?name=${profile.name || 'A'}&background=random&color=fff`} 
                  alt="Profile" 
                  className="object-cover w-40 h-40 mb-4 rounded-full"
                />
                {isEditing && (
                  <div className="w-full text-center">
                    <input type="file" id="file" onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                    <label htmlFor="file" className="inline-block w-full px-4 py-2 text-sm text-center text-gray-700 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300">
                      Choose Image
                    </label>
                    {fileToUpload && <p className="mt-2 text-xs text-gray-500 truncate">{fileToUpload.name}</p>}
                    <button 
                      onClick={handleUploadPicture} 
                      disabled={!fileToUpload || uploading}
                      className="w-full px-4 py-2 mt-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                    >
                      {uploading ? 'Uploading...' : 'Upload Picture'}
                    </button>
                  </div>
                )}
              </div>
              
              {/* --- Profile Details Section --- */}
              <div className="md:col-span-2">
                {!isEditing ? (
                  // --- VIEW MODE ---
                  <div className="space-y-4">
                    <div><label className="font-semibold text-gray-800">Name:</label><p>{profile.name || 'N/A'}</p></div>
                    <div><label className="font-semibold text-gray-800">Email:</label><p>{profile.email || 'N/A'}</p></div>
                    <div><label className="font-semibold text-gray-800">Agent ID:</label><p>{profile.agent_id || 'N/A'}</p></div>
                    <div><label className="font-semibold text-gray-800">About Me:</label><p className="whitespace-pre-wrap">{profile.about_me || 'N/A'}</p></div>
                    <div><label className="font-semibold text-gray-800">Location:</label><p>{profile.town || 'N/A'}, {profile.province || 'N/A'}</p></div>
                    <div><label className="font-semibold text-gray-800">Address:</label><p>{profile.address || 'N/A'}</p></div>
                    <div><label className="font-semibold text-gray-800">Contact Details:</label><p>{profile.contact_details || 'N/A'}</p></div>
                  </div>
                ) : (
                  // --- EDIT MODE ---
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div><label className="block mb-1 font-semibold" htmlFor="name">Name:</label><input id="name" name="name" type="text" className="w-full px-3 py-2 border rounded-md" value={formData.name} onChange={handleInputChange} disabled={saving} /></div>
                    <div><label className="block mb-1 font-semibold" htmlFor="about_me">About Me:</label><textarea id="about_me" name="about_me" rows="4" className="w-full px-3 py-2 border rounded-md" value={formData.about_me} onChange={handleInputChange} disabled={saving}></textarea></div>
                    <div><label className="block mb-1 font-semibold" htmlFor="province">Province:</label><input id="province" name="province" type="text" className="w-full px-3 py-2 border rounded-md" value={formData.province} onChange={handleInputChange} disabled={saving} /></div>
                    <div><label className="block mb-1 font-semibold" htmlFor="town">Town:</label><input id="town" name="town" type="text" className="w-full px-3 py-2 border rounded-md" value={formData.town} onChange={handleInputChange} disabled={saving} /></div>
                    <div><label className="block mb-1 font-semibold" htmlFor="address">Address:</label><textarea id="address" name="address" rows="3" className="w-full px-3 py-2 border rounded-md" value={formData.address} onChange={handleInputChange} disabled={saving}></textarea></div>
                    <div><label className="block mb-1 font-semibold" htmlFor="contact_details">Contact Details:</label><input id="contact_details" name="contact_details" type="text" className="w-full px-3 py-2 border rounded-md" value={formData.contact_details} onChange={handleInputChange} disabled={saving} /></div>
                    <div className="flex justify-end mt-6 space-x-4">
                      <button type="button" onClick={handleCancelEdit} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300" disabled={saving}>Cancel</button>
                      <button type="submit" className="px-6 py-2 text-white rounded-lg bg-navy hover:bg-opacity-90 disabled:bg-gray-400" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;