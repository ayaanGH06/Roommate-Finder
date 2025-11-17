import './App.css';
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Home, List, PlusCircle, User, LogOut, Search, DollarSign, MapPin, Bed, Bath, Calendar } from 'lucide-react';

// API Configuration
const API_URL = 'http://localhost:5001/api';

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Navbar Component
const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button onClick={() => setCurrentPage('home')} className="text-xl font-bold flex items-center space-x-2">
              <Home size={24} />
              <span>RoommateFinder</span>
            </button>
            {user && (
              <div className="hidden md:flex space-x-4">
                <button onClick={() => setCurrentPage('browse')} className="hover:bg-indigo-700 px-3 py-2 rounded flex items-center space-x-1">
                  <Search size={18} />
                  <span>Browse</span>
                </button>
                <button onClick={() => setCurrentPage('create')} className="hover:bg-indigo-700 px-3 py-2 rounded flex items-center space-x-1">
                  <PlusCircle size={18} />
                  <span>Create Listing</span>
                </button>
                <button onClick={() => setCurrentPage('dashboard')} className="hover:bg-indigo-700 px-3 py-2 rounded flex items-center space-x-1">
                  <List size={18} />
                  <span>My Listings</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button onClick={() => setCurrentPage('profile')} className="hover:bg-indigo-700 px-3 py-2 rounded flex items-center space-x-2">
                  <User size={18} />
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                <button onClick={logout} className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded flex items-center space-x-2">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button onClick={() => setCurrentPage('auth')} className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded font-semibold">
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

// Input Component
const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// Select Component
const Select = ({ label, options, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Landing Page
const LandingPage = ({ setCurrentPage }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Find Your Perfect Roommate</h1>
        <p className="text-xl mb-8 opacity-90">Connect with compatible roommates and discover your ideal living space</p>
        <div className="flex justify-center space-x-4">
          {user ? (
            <>
              <button onClick={() => setCurrentPage('browse')} className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Browse Listings
              </button>
              <button onClick={() => setCurrentPage('create')} className="bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-800 transition">
                Create Listing
              </button>
            </>
          ) : (
            <button onClick={() => setCurrentPage('auth')} className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Get Started
            </button>
          )}
        </div>
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-gray-800">
            <Search size={48} className="mx-auto mb-4 text-indigo-600" />
            <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
            <p className="text-gray-600">Filter by location, budget, and preferences to find your match</p>
          </Card>
          <Card className="p-6 text-gray-800">
            <User size={48} className="mx-auto mb-4 text-indigo-600" />
            <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
            <p className="text-gray-600">Connect with real people looking for roommates</p>
          </Card>
          <Card className="p-6 text-gray-800">
            <Home size={48} className="mx-auto mb-4 text-indigo-600" />
            <h3 className="text-xl font-semibold mb-2">Quality Listings</h3>
            <p className="text-gray-600">Browse detailed property and roommate information</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Auth Page
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferences: {
      gender: 'male',
      smoking: 'no',
      pets: 'no',
      cleanliness: 'moderate',
      lifestyle: 'moderate'
    },
    budget: { min: 0, max: 5000 },
    location: { city: '', state: '', zipCode: '' }
  });
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          {!isLogin && (
            <>
              <h3 className="text-lg font-semibold mb-3 mt-4 text-gray-700">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                  required
                />
                <Input
                  label="State"
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => setFormData({...formData, location: {...formData.location, state: e.target.value}})}
                  required
                />
              </div>
              <Input
                label="Zip Code"
                type="text"
                value={formData.location.zipCode}
                onChange={(e) => setFormData({...formData, location: {...formData.location, zipCode: e.target.value}})}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Budget"
                  type="number"
                  value={formData.budget.min}
                  onChange={(e) => setFormData({...formData, budget: {...formData.budget, min: parseInt(e.target.value)}})}
                />
                <Input
                  label="Max Budget"
                  type="number"
                  value={formData.budget.max}
                  onChange={(e) => setFormData({...formData, budget: {...formData.budget, max: parseInt(e.target.value)}})}
                />
              </div>
              
              <h3 className="text-lg font-semibold mb-3 mt-4 text-gray-700">Your Preferences</h3>
              
              <Select
                label="Gender"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'no-preference', label: 'No Preference' }
                ]}
                value={formData.preferences.gender}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, gender: e.target.value}})}
              />
              
              <Select
                label="Smoking"
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'occasionally', label: 'Occasionally' }
                ]}
                value={formData.preferences.smoking}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, smoking: e.target.value}})}
              />
              
              <Select
                label="Pets"
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'negotiable', label: 'Negotiable' }
                ]}
                value={formData.preferences.pets}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, pets: e.target.value}})}
              />
              
              <Select
                label="Cleanliness"
                options={[
                  { value: 'very-clean', label: 'Very Clean' },
                  { value: 'clean', label: 'Clean' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'relaxed', label: 'Relaxed' }
                ]}
                value={formData.preferences.cleanliness}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, cleanliness: e.target.value}})}
              />
              
              <Select
                label="Lifestyle"
                options={[
                  { value: 'quiet', label: 'Quiet' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'social', label: 'Social' },
                  { value: 'party', label: 'Party' }
                ]}
                value={formData.preferences.lifestyle}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, lifestyle: e.target.value}})}
              />
            </>
          )}
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition mt-2">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-semibold hover:underline">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </Card>
    </div>
  );
};

// Browse Listings Page
const BrowseListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setListings(data);
      } else if (data.data && Array.isArray(data.data)) {
        // Backend returns {success, count, data: []}
        setListings(data.data);
      } else {
        console.error('Expected array but got:', data);
        setListings([]);
        setError(data.message || 'Failed to load listings');
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setListings([]);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Loading listings...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Browse Listings</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {listings.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          <p>No listings available yet. Be the first to create one!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <Card key={listing._id} className="overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{listing.propertyType}</p>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{listing.location.city}, {listing.location.state}</span>
                </div>
                <div className="flex items-center text-indigo-600 font-bold text-xl mb-4">
                  <DollarSign size={20} />
                  <span>{listing.rentAmount}/month</span>
                </div>
                <div className="flex space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Bed size={16} className="mr-1" />
                    <span>{listing.roomDetails.bedrooms} bed</span>
                  </div>
                  <div className="flex items-center">
                    <Bath size={16} className="mr-1" />
                    <span>{listing.roomDetails.bathrooms} bath</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  <span>Available: {new Date(listing.roomDetails.availableFrom).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Create Listing Page
const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    rentAmount: 0,
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    amenities: [],
    roomDetails: {
      bedrooms: 1,
      bathrooms: 1,
      furnished: false,
      availableFrom: new Date().toISOString().split('T')[0]
    },
    preferences: {
      gender: 'no-preference',
      smoking: 'no-preference',
      pets: 'no'
    }
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Show the actual error message from backend
        console.error('Backend error:', data);
        throw new Error(data.message || data.error || 'Failed to create listing');
      }
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        propertyType: 'apartment',
        rentAmount: 0,
        location: { address: '', city: '', state: '', zipCode: '' },
        amenities: [],
        roomDetails: { bedrooms: 1, bathrooms: 1, furnished: false, availableFrom: new Date().toISOString().split('T')[0] },
        preferences: { gender: 'no-preference', smoking: 'no-preference', pets: 'no' }
      });
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create New Listing</h1>
      <Card className="p-8">
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
            Listing created successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Property Details</h3>
          
          <Input
            label="Listing Title"
            type="text"
            placeholder="e.g., Spacious 2BR apartment in Downtown"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          
          <Select
            label="Property Type"
            options={[
              { value: 'apartment', label: 'Apartment' },
              { value: 'house', label: 'House' },
              { value: 'condo', label: 'Condo' },
              { value: 'townhouse', label: 'Townhouse' },
              { value: 'studio', label: 'Studio' }
            ]}
            value={formData.propertyType}
            onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
          />
          
          <Input
            label="Monthly Rent ($)"
            type="number"
            value={formData.rentAmount}
            onChange={(e) => setFormData({...formData, rentAmount: parseInt(e.target.value) || 0})}
            required
          />
          
          <Input
            label="Address"
            type="text"
            value={formData.location.address}
            onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              type="text"
              value={formData.location.city}
              onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
              required
            />
            <Input
              label="State"
              type="text"
              value={formData.location.state}
              onChange={(e) => setFormData({...formData, location: {...formData.location, state: e.target.value}})}
              required
            />
          </div>
          
          <Input
            label="Zip Code"
            type="text"
            value={formData.location.zipCode}
            onChange={(e) => setFormData({...formData, location: {...formData.location, zipCode: e.target.value}})}
            required
          />

          <h3 className="text-xl font-semibold mb-4 mt-6 text-gray-700">Room Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bedrooms"
              type="number"
              min="1"
              value={formData.roomDetails.bedrooms}
              onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, bedrooms: parseInt(e.target.value)}})}
              required
            />
            <Input
              label="Bathrooms"
              type="number"
              min="1"
              value={formData.roomDetails.bathrooms}
              onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, bathrooms: parseInt(e.target.value)}})}
              required
            />
          </div>
          <Input
            label="Available From"
            type="date"
            value={formData.roomDetails.availableFrom}
            onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, availableFrom: e.target.value}})}
            required
          />
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.roomDetails.furnished}
                onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, furnished: e.target.checked}})}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Furnished</span>
            </label>
          </div>

          <h3 className="text-xl font-semibold mb-4 mt-6 text-gray-700">Description</h3>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe your property and ideal roommate..."
            required
          />

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-md font-semibold hover:bg-indigo-700 transition">
            Create Listing
          </button>
        </form>
      </Card>
    </div>
  );
};

// Dashboard Page
const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const fetchMyListings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/listings/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setListings(data);
      } else if (data.data && Array.isArray(data.data)) {
        // Backend returns {success, count, data: []}
        setListings(data.data);
      } else {
        console.error('Expected array but got:', data);
        setListings([]);
        setError(data.message || 'Failed to load your listings');
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      setListings([]);
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const deleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await fetch(`${API_URL}/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(listings.filter(l => l._id !== id));
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Loading your listings...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Listings</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {listings.length === 0 ? (
        <Card className="p-8 text-center text-gray-600">
          <p className="mb-4">You haven't created any listings yet.</p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
            Create Your First Listing
          </button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {listings.map(listing => (
            <Card key={listing._id} className="p-6">
              <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{listing.propertyType}</p>
              <p className="text-gray-600 mb-2">{listing.location.city}, {listing.location.state}</p>
              <p className="text-indigo-600 font-bold text-xl mb-4">${listing.rentAmount}/month</p>
              <p className="text-gray-700 mb-4 line-clamp-2">{listing.description}</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-indigo-100 text-indigo-600 py-2 rounded hover:bg-indigo-200">
                  Edit
                </button>
                <button onClick={() => deleteListing(listing._id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded hover:bg-red-200">
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>
      <Card className="p-8">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Preferences</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <p className="text-gray-600">{user?.location?.city ? `${user.location.city}, ${user.location.state} ${user.location.zipCode}` : 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Budget Range:</span>
              <p className="text-gray-600">${user?.budget?.min || 0} - ${user?.budget?.max || 0}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Gender Preference:</span>
              <p className="text-gray-600">{user?.preferences?.gender || 'Any'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Smoking:</span>
              <p className="text-gray-600">{user?.preferences?.smoking || 'No'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Pets:</span>
              <p className="text-gray-600">{user?.preferences?.pets || 'No'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Lifestyle:</span>
              <p className="text-gray-600">{user?.preferences?.lifestyle || 'Balanced'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Main App
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if trying to access protected pages
  if (!user && ['browse', 'create', 'dashboard', 'profile'].includes(currentPage)) {
    setCurrentPage('auth');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === 'home' && <LandingPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'auth' && <AuthPage />}
      {currentPage === 'browse' && <BrowseListings />}
      {currentPage === 'create' && <CreateListing />}
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'profile' && <ProfilePage />}
    </div>
  );
};

// Root component with Auth Provider
export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}