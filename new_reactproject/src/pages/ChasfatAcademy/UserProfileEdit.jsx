import { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfileEdit = () => {
  const [userData, setUserData] = useState({
    username: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      // Send the updated user data to the backend
      const response = await axios.put("http://localhost:5000/profile", userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // If the update is successful, update state and show success message
      if (response.status === 200) {
        setUserData(response.data);
        alert("Profile updated successfully!");
        setIsEditing(false); // Exit editing mode
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">User Profile</h2>

        {!isEditing ? (
          <div className="space-y-2">
            <p><strong className="text-gray-600">Username:</strong> {userData.username}</p>
            <p><strong className="text-gray-600">First Name:</strong> {userData.firstName}</p>
            <p><strong className="text-gray-600">Last Name:</strong> {userData.lastName}</p>
            <button
              className="mt-4 text-blue-600"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-gray-600">Username:</label>
              <input
                id="username"
                name="username"
                type="text"
                value={userData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-gray-600">First Name:</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={userData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-600">Last Name:</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={userData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div className="mt-4 flex gap-4">
              <button
                className="w-full bg-green-600 text-white py-2 rounded-md"
                onClick={handleEditProfile}
              >
                Save Changes
              </button>
              <button
                className="w-full bg-gray-600 text-white py-2 rounded-md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileEdit;
