import './App.css';
import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { Home, List, PlusCircle, User, LogOut, Search, DollarSign, MapPin, Bed, Bath, Calendar, Filter, Heart, Edit, MessageCircle, Send } from 'lucide-react';

// API Configuration
const API_URL = 'http://localhost:5001/api';

// Indian States and Cities Data
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CITIES_BY_STATE = {
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Delhi': ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  // Add more as needed, or just use these major ones
};

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isNewUser, setIsNewUser] = useState(false);

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
    setIsNewUser(false);
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
    setIsNewUser(true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token, isNewUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Compatibility Badge Component
const CompatibilityBadge = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getColor()}`}>
      <Heart size={14} className="mr-1" fill="currentColor" />
      {score}% Match
    </div>
  );
};

// Navbar Component
const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && token) {
      const fetchUnread = async () => {
        try {
          const res = await fetch(`${API_URL}/messages/unread-count`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setUnreadCount(data.count || 0);
        } catch (err) {
          console.error('Error fetching unread:', err);
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [user, token]);

  return (
    <nav style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 50,
      backgroundColor: '#4f46e5',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button 
              onClick={() => setCurrentPage('home')} 
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Home size={24} />
              <span>RoommateFinder</span>
            </button>
            {user && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setCurrentPage('matches')} 
                  style={{ 
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Heart size={18} />
                  <span>Matches</span>
                </button>
                <button 
                  onClick={() => setCurrentPage('browse')} 
                  style={{ 
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Search size={18} />
                  <span>Browse</span>
                </button>
<button 
  onClick={() => setCurrentPage('messages')} 
  style={{ 
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    position: 'relative'
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
>
  <MessageCircle size={18} />
  <span>Messages</span>
  {unreadCount > 0 && (
    <span style={{
      position: 'absolute',
      top: '-0.25rem',
      right: '-0.25rem',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '9999px',
      padding: '0.125rem 0.375rem',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    }}>
      {unreadCount}
    </span>
  )}
</button>
                <button 
                  onClick={() => setCurrentPage('create')} 
                  style={{ 
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <PlusCircle size={18} />
                  <span>Create</span>
                </button>
                <button 
                  onClick={() => setCurrentPage('dashboard')} 
                  style={{ 
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <List size={18} />
                  <span>My Listings</span>
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <>
                <button 
                  onClick={() => setCurrentPage('profile')}
                  style={{ 
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User size={18} />
                  <span>{user.name}</span>
                </button>
                <button 
                  onClick={logout}
                  style={{ 
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#4338ca',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3730a3'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => setCurrentPage('auth')}
                style={{ 
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Filter Panel Component
const FilterPanel = ({ filters, setFilters, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        <Filter size={18} />
        {isOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      {isOpen && (
        <div style={{
          marginTop: '1rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>City</label>
              <input
                type="text"
                placeholder="Enter city"
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Min Rent</label>
              <input
                type="number"
                placeholder="₹0"
                value={filters.minRent}
                onChange={(e) => setFilters({...filters, minRent: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Max Rent</label>
              <input
                type="number"
                placeholder="₹5000"
                value={filters.maxRent}
                onChange={(e) => setFilters({...filters, maxRent: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Pets</label>
              <select
                value={filters.pets}
                onChange={(e) => setFilters({...filters, pets: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onApply}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setFilters({ city: '', minRent: '', maxRent: '', propertyType: '', bedrooms: '', pets: '' });
                onApply();
              }}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Listing Card Component
const ListingCard = ({ listing, onEdit, onDelete, showCompatibility = false }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s'
    }}>


 <div 
  onClick={() => {
    window.scrollTo(0, 0);
    window.selectedListingId = listing._id;
    window.triggerPageChange('listingDetail');
  }}
  style={{ cursor: 'pointer' }}
>
  {listing.images && listing.images.length > 0 ? (
    <img
      src={listing.images[0]}
      alt={listing.title}
      style={{
        height: '12rem',
        width: '100%',
        objectFit: 'cover'
      }}
    />
  ) : (
    <div style={{
      height: '12rem',
      background: 'linear-gradient(to bottom right, #818cf8, #a855f7)'
    }} />
  )}
</div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
          <h3 
  onClick={() => {
    window.scrollTo(0, 0);
    window.selectedListingId = listing._id;
    window.triggerPageChange('listingDetail');
  }}
  style={{ 
    fontSize: '1.25rem', 
    fontWeight: '600', 
    margin: 0,
    cursor: 'pointer',
    color: '#4f46e5'
  }}
>
  {listing.title}
</h3>
          {showCompatibility && listing.compatibility && (
            <CompatibilityBadge score={listing.compatibility.score} />
          )}
        </div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          {listing.propertyType}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', marginBottom: '0.5rem' }}>
          <MapPin size={16} style={{ marginRight: '0.25rem' }} />
          <span style={{ fontSize: '0.875rem' }}>
            {listing.location.city}, {listing.location.state}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: '#4f46e5', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.25rem' }}>₹</span>
          <span>{listing.rentAmount}/month</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Bed size={16} style={{ marginRight: '0.25rem' }} />
            <span>{listing.roomDetails.bedrooms} bed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Bath size={16} style={{ marginRight: '0.25rem' }} />
            <span>{listing.roomDetails.bathrooms} bath</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <Calendar size={16} style={{ marginRight: '0.25rem' }} />
          <span>Available: {new Date(listing.roomDetails.availableFrom).toLocaleDateString()}</span>
        </div>

         <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {/* View Profile button (always visible) */}
         {listing.user && (
  <>
    <button
      onClick={() => {
        window.scrollTo(0, 0);
        window.viewUserProfile = listing.user._id;
        window.triggerPageChange('viewUser');
      }}
      style={{
        flex: onEdit || onDelete ? 0 : 1,
        padding: '0.5rem',
        backgroundColor: '#e0e7ff',
        color: '#4f46e5',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem'
      }}
    >
      <User size={16} />
      View Profile
    </button>
    <button
      onClick={() => {
        window.scrollTo(0, 0);
        window.contactUser = listing.user._id;
        window.contactListing = listing._id;
        window.triggerPageChange('messages');
      }}
      style={{
        flex: onEdit || onDelete ? 0 : 1,
        padding: '0.5rem',
        backgroundColor: '#e0e7ff',
        color: '#4f46e5',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.25rem'
      }}
    >
      <MessageCircle size={16} />
      Contact
    </button>
    
  </>
)}
          
          {/* Edit/Delete buttons (only for owner) */}
          {onEdit && (
            <button
              onClick={() => onEdit(listing)}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#e0e7ff',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(listing._id)}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Matches Page
const MatchesPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${API_URL}/listings/matches/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setListings(data.data || []);
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [token]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0', color: '#6b7280' }}>Loading matches...</div>;
  }

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Your Best Matches</h1>
      
      {listings.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p>No matches found. Try adjusting your preferences!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} showCompatibility={true} />
          ))}
        </div>
      )}
    </div>
  );
};

// Browse with Filters
const BrowseListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    minRent: '',
    maxRent: '',
    propertyType: '',
    bedrooms: '',
    pets: ''
  });
  const { token } = useAuth();

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const res = await fetch(`${API_URL}/listings/search?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setListings(data.data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Browse Listings</h1>
      
      <FilterPanel filters={filters} setFilters={setFilters} onApply={fetchListings} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#6b7280' }}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <p>No listings found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} showCompatibility={!!token} />
          ))}
        </div>
      )}
    </div>
  );
};

// Dashboard with Edit
const Dashboard = ({ setCurrentPage, setEditingListing }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchMyListings = async () => {
    try {
      const res = await fetch(`${API_URL}/listings/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setListings(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await fetch(`${API_URL}/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(listings.filter(l => l._id !== id));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setCurrentPage('edit');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem 0' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>My Listings</h1>
      
      {listings.length === 0 ? (
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>No listings yet.</p>
          <button
            onClick={() => setCurrentPage('create')}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Create First Listing
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {listings.map(listing => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Create/Edit Listing Form
const ListingForm = ({ editingListing, setEditingListing, setCurrentPage }) => {
  const [formData, setFormData] = useState(editingListing ? {
  ...editingListing,
  roomDetails: {
    ...editingListing.roomDetails,
    bedrooms: editingListing.roomDetails?.bedrooms || 1,
    bathrooms: editingListing.roomDetails?.bathrooms || 1
  }
} : {
  title: '',
  description: '',
  propertyType: 'apartment',
  rentAmount: '',
  location: { address: '', city: '', state: '', zipCode: '' },
  roomDetails: { bedrooms: 1, bathrooms: 1, furnished: false, availableFrom: new Date().toISOString().split('T')[0] },
  preferences: { gender: 'no-preference', smoking: 'no-preference', pets: 'no' }
});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  setImageFiles(files);
  
  // Generate previews
  const previews = files.map(file => URL.createObjectURL(file));
  setImagePreviews(previews);
};

const uploadImages = async (listingId) => {
  if (imageFiles.length === 0) return;
  
  const formData = new FormData();
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  try {
    await fetch(`${API_URL}/listings/${listingId}/upload-images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
  } catch (err) {
    console.error('Image upload failed:', err);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess(false);
  try {
    const url = editingListing ? `${API_URL}/listings/${editingListing._id}` : `${API_URL}/listings`;
    const method = editingListing ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to save listing');
    }
    
    const result = await res.json();
    
    // Upload images if new listing or if new images selected
    if (imageFiles.length > 0) {
      await uploadImages(result.data._id);
    }
    
    setSuccess(true);
    setTimeout(() => {
      setEditingListing(null);
      setCurrentPage('dashboard');
    }, 1500);
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        {editingListing ? 'Edit Listing' : 'Create New Listing'}
      </h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '2rem' }}>
        {success && (
          <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {editingListing ? 'Listing updated!' : 'Listing created!'} Redirecting...
          </div>
        )}
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Property Type</label>
            <select
              value={formData.propertyType}
              onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Monthly Rent (₹)</label>
            <input
              type="number"
              required
              value={formData.rentAmount}
              onChange={(e) => setFormData({...formData, rentAmount: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
  <div>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>State</label>
    <input
      list="listing-states"
      required
      value={formData.location.state}
      onChange={(e) => {
        setFormData({...formData, location: {...formData.location, state: e.target.value, city: ''}});
      }}
      placeholder="Select or type state"
      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
    />
    <datalist id="listing-states">
      {INDIAN_STATES.map(state => <option key={state} value={state} />)}
    </datalist>
  </div>
  <div>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>City</label>
    <input
      list="listing-cities"
      required
      value={formData.location.city}
      onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
      placeholder="Select or type city"
      disabled={!formData.location.state}
      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
    />
    <datalist id="listing-cities">
      {CITIES_BY_STATE[formData.location.state]?.map(city => <option key={city} value={city} />)}
    </datalist>
  </div>
</div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Address</label>
            <input
              type="text"
              required
              value={formData.location.address}
              onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
    Zip Code
  </label>
  <input
    type="text"
    required
    value={formData.location.zipCode}
    onChange={(e) =>
      setFormData({
        ...formData,
        location: { ...formData.location, zipCode: e.target.value }
      })
    }
    placeholder="Enter ZIP Code"
    style={{
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem'
    }}
  />
</div>


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Bedrooms</label>
              <input
                type="number"
                min="1"
                required
                value={formData.roomDetails.bedrooms}
                onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, bedrooms: parseInt(e.target.value)}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Bathrooms</label>
              <input
                type="number"
                min="1"
                required
                value={formData.roomDetails.bathrooms}
                onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, bathrooms: parseInt(e.target.value)}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Available From</label>
              <input
                type="date"
                required
                value={formData.roomDetails.availableFrom}
                onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, availableFrom: e.target.value}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.roomDetails.furnished}
                onChange={(e) => setFormData({...formData, roomDetails: {...formData.roomDetails, furnished: e.target.checked}})}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Furnished</span>
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Description</label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
    Property Images (Max 5)
  </label>
  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageChange}
    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
  />
  {imagePreviews.length > 0 && (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
      {imagePreviews.map((preview, idx) => (
        <img
          key={idx}
          src={preview}
          alt={`Preview ${idx + 1}`}
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.375rem' }}
        />
      ))}
    </div>
  )}
</div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {editingListing ? 'Update Listing' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingListing(null);
                setCurrentPage('dashboard');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple Landing Page
const LandingPage = ({ setCurrentPage }) => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #6366f1, #9333ea)' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '5rem 1rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Find Your Perfect Roommate</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Connect with compatible roommates using our smart matching algorithm
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {user ? (
            <>
              <button
                onClick={() => setCurrentPage('matches')}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'white',
                  color: '#4f46e5',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                View Matches
              </button>
              <button
                onClick={() => setCurrentPage('browse')}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#4338ca',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Browse Listings
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentPage('auth')}
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Auth Page (simplified version)
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferences: { gender: 'no-preference', smoking: 'no', pets: 'no', cleanliness: 'moderate', lifestyle: 'moderate' },
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
  <div>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>State</label>
    <input
      list="states"
      required
      value={formData.location.state}
      onChange={(e) => {
        setFormData({...formData, location: {...formData.location, state: e.target.value, city: ''}});
      }}
      placeholder="Select or type state"
      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
    />
    <datalist id="states">
      {INDIAN_STATES.map(state => <option key={state} value={state} />)}
    </datalist>
  </div>
  <div>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>City</label>
    <input
      list="cities"
      required
      value={formData.location.city}
      onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
      placeholder="Select or type city"
      disabled={!formData.location.state}
      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
    />
    <datalist id="cities">
      {CITIES_BY_STATE[formData.location.state]?.map(city => <option key={city} value={city} />)}
    </datalist>
  </div>
</div>

              
            </>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '0.5rem'
            }}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Edit Profile Page
const EditProfilePage = ({ setCurrentPage }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    preferences: {
      gender: user?.preferences?.gender || 'no-preference',
      smoking: user?.preferences?.smoking || 'no',
      pets: user?.preferences?.pets || 'no',
      cleanliness: user?.preferences?.cleanliness || 'moderate',
      lifestyle: user?.preferences?.lifestyle || 'moderate'
    },
    budget: {
      min: user?.budget?.min || '',
      max: user?.budget?.max || ''
    },
    location: {
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      zipCode: user?.location?.zipCode || ''
    }
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.reload(); // Refresh to get updated user data
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Edit Profile</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '2rem' }}>
        {success && (
          <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            Profile updated successfully! Refreshing...
          </div>
        )}
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>

          {/* Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>State</label>
              <input
                list="edit-states"
                required
                value={formData.location.state}
                onChange={(e) => {
                  setFormData({...formData, location: {...formData.location, state: e.target.value, city: ''}});
                }}
                placeholder="Select or type state"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
              <datalist id="edit-states">
                {INDIAN_STATES.map(state => <option key={state} value={state} />)}
              </datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>City</label>
              <input
                list="edit-cities"
                required
                value={formData.location.city}
                onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                placeholder="Select or type city"
                disabled={!formData.location.state}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
              <datalist id="edit-cities">
                {CITIES_BY_STATE[formData.location.state]?.map(city => <option key={city} value={city} />)}
              </datalist>
            </div>
          </div>

          

          {/* Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Min Budget (₹)</label>
              <input
                type="number"
                required
                value={formData.budget.min}
                onChange={(e) => setFormData({...formData, budget: {...formData.budget, min: parseInt(e.target.value) || ''}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Max Budget (₹)</label>
              <input
                type="number"
                required
                value={formData.budget.max}
                onChange={(e) => setFormData({...formData, budget: {...formData.budget, max: parseInt(e.target.value) || ''}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
            </div>
          </div>

          {/* Preferences */}
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', marginTop: '1.5rem' }}>Preferences</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Gender Preference</label>
              <select
                value={formData.preferences.gender}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, gender: e.target.value}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="no-preference">No Preference</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Smoking</label>
              <select
                value={formData.preferences.smoking}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, smoking: e.target.value}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="occasionally">Occasionally</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Pets</label>
              <select
                value={formData.preferences.pets}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, pets: e.target.value}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Cleanliness</label>
              <select
                value={formData.preferences.cleanliness}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, cleanliness: e.target.value}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="very-clean">Very Clean</option>
                <option value="clean">Clean</option>
                <option value="moderate">Moderate</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Lifestyle</label>
              <select
                value={formData.preferences.lifestyle}
                onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, lifestyle: e.target.value}})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="quiet">Quiet</option>
                <option value="moderate">Moderate</option>
                <option value="social">Social</option>
                <option value="party">Party</option>
              </select>
            </div>
          </div>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: loading ? '#9ca3af' : '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('profile')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Other User's Profile Component
const ViewUserProfile = ({ userId, setCurrentPage }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/user/${userId}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }
        
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
        </div>
        <button
          onClick={() => setCurrentPage('browse')}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Back to Browse
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <button
        onClick={() => setCurrentPage('browse')}
        style={{
          padding: '0.5rem 1.5rem',
          backgroundColor: '#e5e7eb',
          color: '#374151',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontWeight: '600',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ← Back to Listings
      </button>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '5rem',
            height: '5rem',
            backgroundColor: '#4f46e5',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginRight: '1rem'
          }}>
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{profile.name}</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Roommate Preferences</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>📍 Location:</span>
              <p style={{ color: '#6b7280', margin: 0 }}>
                {profile.location?.city ? `${profile.location.city}, ${profile.location.state}` : 'Not specified'}
              </p>
            </div>

            <div>
              <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>💰 Budget Range:</span>
              <p style={{ color: '#6b7280', margin: 0 }}>
                ₹{profile.budget?.min || 0} - ₹{profile.budget?.max || 0}
              </p>
            </div>

            <div>
              <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>👤 Gender Preference:</span>
              <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                {profile.preferences?.gender?.replace('-', ' ') || 'Not specified'}
              </p>
            </div>

            <div>
              <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>🚬 Smoking:</span>
              <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                {profile.preferences?.smoking || 'Not specified'}
              </p>
            </div>

            <div>
              <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>🐾 Pets:</span>
              <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                {profile.preferences?.pets || 'Not specified'}
              </p>
            </div>

            <div>
              <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>🧹 Cleanliness:</span>
              <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                {profile.preferences?.cleanliness?.replace('-', ' ') || 'Not specified'}
              </p>
            </div>

            <div>
              <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>🎉 Lifestyle:</span>
              <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                {profile.preferences?.lifestyle || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Profile Page
const ProfilePage = ({ setCurrentPage }) => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>My Profile</h1>
        <button
          onClick={() => setCurrentPage('editProfile')}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Edit size={18} />
          Edit Profile
        </button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '5rem',
            height: '5rem',
            backgroundColor: '#4f46e5',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginRight: '1rem'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{user?.name}</h2>
            <p style={{ color: '#6b7280' }}>{user?.email}</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Preferences</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontWeight: '500', color: '#374151' }}>Location:</span>
              <p style={{ color: '#6b7280' }}>
                {user?.location?.city ? `${user.location.city}, ${user.location.state}` : 'Not specified'}
              </p>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: '#374151' }}>Smoking:</span>
              <p style={{ color: '#6b7280' }}>{user?.preferences?.smoking || 'No'}</p>
            </div>
            <div>
              <span style={{ fontWeight: '500', color: '#374151' }}>Pets:</span>
              <p style={{ color: '#6b7280' }}>{user?.preferences?.pets || 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Messaging Component
const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Handle contact from listing
    if (window.contactUser) {
      setSelectedUser({ _id: window.contactUser, name: 'Loading...' });
      window.contactUser = null;
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      const interval = setInterval(() => fetchMessages(selectedUser._id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient: selectedUser._id,
          content: newMessage,
          listingId: window.contactListing || null
        })
      });
      window.contactListing = null;
      setNewMessage('');
      fetchMessages(selectedUser._id);
      fetchConversations();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem', height: 'calc(100vh - 4rem)' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Messages</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', height: 'calc(100% - 4rem)', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        {/* Conversations List */}
        <div style={{ borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              <MessageCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv._id._id}
                onClick={() => setSelectedUser(conv._id)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  backgroundColor: selectedUser?._id === conv._id._id ? '#f3f4f6' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{conv._id.name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '9999px',
                      padding: '0.125rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Messages Thread */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedUser ? (
            <>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{selectedUser.name}</h3>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {messages.map(msg => (
                  <div
                    key={msg._id}
                    style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: msg.sender._id === user._id ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: msg.sender._id === user._id ? '#4f46e5' : '#f3f4f6',
                      color: msg.sender._id === user._id ? 'white' : '#1f2937'
                    }}>
                      <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.content}</p>
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Send size={18} />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Listing Detail Page Component
const ListingDetailPage = ({ listingId, setCurrentPage }) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/listings/${listingId}`, { headers });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Failed to load listing');
        
        setListing(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (listingId) fetchListing();
  }, [listingId, token]);

  if (loading) {
    return (
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error || 'Listing not found'}
        </div>
        <button
          onClick={() => setCurrentPage('browse')}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <button
        onClick={() => setCurrentPage('browse')}
        style={{
          padding: '0.5rem 1.5rem',
          backgroundColor: '#e5e7eb',
          color: '#374151',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontWeight: '600',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ← Back to Listings
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Hero Section - Placeholder for images */}
          {/* Hero Section - Images */}
{listing.images && listing.images.length > 0 ? (
  <div style={{
    height: '24rem',
    borderRadius: '0.5rem',
    marginBottom: '2rem',
    overflow: 'hidden',
    position: 'relative'
  }}>
    <img
      src={listing.images[0]}
      alt={listing.title}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
    {listing.images.length > 1 && (
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
        fontWeight: '600'
      }}>
        +{listing.images.length - 1} more photos
      </div>
    )}
  </div>
) : (
  <div style={{
    height: '24rem',
    background: 'linear-gradient(to bottom right, #818cf8, #a855f7)',
    borderRadius: '0.5rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '600'
  }}>
    No Images Available
  </div>
)}

          {/* Title & Price */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{listing.title}</h1>
              {listing.compatibility && (
                <CompatibilityBadge score={listing.compatibility.score} />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#4f46e5', fontWeight: 'bold', fontSize: '2rem', marginBottom: '1rem' }}>
              <span>₹{listing.rentAmount}</span>
              <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>/month</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '1rem' }}>
              <MapPin size={20} style={{ marginRight: '0.5rem' }} />
              <span>{listing.location.address}, {listing.location.city}, {listing.location.state} - {listing.location.zipCode}</span>
            </div>
          </div>

          {/* Description */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Description</h2>
            <p style={{ color: '#374151', lineHeight: '1.6' }}>{listing.description}</p>
          </div>

          {/* Room Details */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Room Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bed size={20} color="#4f46e5" />
                <span><strong>{listing.roomDetails.bedrooms}</strong> Bedroom{listing.roomDetails.bedrooms > 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bath size={20} color="#4f46e5" />
                <span><strong>{listing.roomDetails.bathrooms}</strong> Bathroom{listing.roomDetails.bathrooms > 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="#4f46e5" />
                <span>Available: <strong>{new Date(listing.roomDetails.availableFrom).toLocaleDateString()}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{listing.roomDetails.furnished ? '✅' : '❌'} {listing.roomDetails.furnished ? 'Furnished' : 'Unfurnished'}</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {listing.amenities.map((amenity, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981' }}>✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {listing.preferences && (
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Roommate Preferences</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Gender Preference:</span>
                  <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                    {listing.preferences?.gender?.replace('-', ' ') || 'No preference'}
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Smoking:</span>
                  <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                    {listing.preferences?.smoking?.replace('-', ' ') || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Pets:</span>
                  <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                    {listing.preferences?.pets || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>Lifestyle:</span>
                  <p style={{ color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>
                    {listing.preferences?.lifestyle || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
  onClick={() => {
    window.scrollTo(0, 0);
    window.contactUser = listing.user._id;
    window.contactListing = listing._id;
    window.triggerPageChange('messages');
  }}
  style={{
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}
>
  <MessageCircle size={18} />
  Message Owner
</button>
        </div>

        {/* Sidebar */}
        <div>
          {/* Owner Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', position: 'sticky', top: '5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Contact Owner</h3>
            {listing.user && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#4f46e5',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {listing.user.name?.charAt(0).toUpperCase()}
                </div>
                <p style={{ fontWeight: '600', margin: 0 }}>{listing.user.name}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{listing.user.email}</p>
              </div>
            )}
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                window.contactUser = listing.user._id;
                window.contactListing = listing._id;
                window.triggerPageChange('messages');
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageCircle size={18} />
              Message Owner
            </button>
            {listing.user && (
              <button
                onClick={() => {
                  window.viewUserProfile = listing.user._id;
                  window.triggerPageChange('viewUser');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#e0e7ff',
                  color: '#4f46e5',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <User size={18} />
                View Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [editingListing, setEditingListing] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const { user, loading, isNewUser } = useAuth();

  useEffect(() => {
  if (user && currentPage === 'auth') {
    if (isNewUser) {
      setCurrentPage('editProfile'); // New users fill out preferences
    } else {
      setCurrentPage('browse'); // Existing users go to browse
    }
  }
}, [user, isNewUser, currentPage]);

  // Setup global page change trigger
  useEffect(() => {
  window.triggerPageChange = (page) => {
    if (page === 'viewUser' && window.viewUserProfile) {
      setViewingUserId(window.viewUserProfile);
      setCurrentPage('viewUser');
    } else if (page === 'messages') {
      setCurrentPage('messages');
    } else if (page === 'listingDetail' && window.selectedListingId) {
      setSelectedListingId(window.selectedListingId);
      setCurrentPage('listingDetail');
    }
  };
}, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '2px solid #4f46e5',
            borderTopColor: 'transparent',
            borderRadius: '9999px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && ['matches', 'browse', 'create', 'dashboard', 'profile', 'edit'].includes(currentPage)) {
    setCurrentPage('auth');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === 'home' && <LandingPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'auth' && <AuthPage />}
      {currentPage === 'matches' && <MatchesPage />}
      {currentPage === 'browse' && <BrowseListings />}
      {currentPage === 'create' && <ListingForm setEditingListing={setEditingListing} setCurrentPage={setCurrentPage} />}
      {currentPage === 'edit' && <ListingForm editingListing={editingListing} setEditingListing={setEditingListing} setCurrentPage={setCurrentPage} />}
      {currentPage === 'dashboard' && <Dashboard setCurrentPage={setCurrentPage} setEditingListing={setEditingListing} />}
      {currentPage === 'profile' && <ProfilePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'editProfile' && <EditProfilePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'viewUser' && <ViewUserProfile userId={viewingUserId} setCurrentPage={setCurrentPage} />}
      {currentPage === 'messages' && <MessagingPage />}
      {currentPage === 'listingDetail' && <ListingDetailPage listingId={selectedListingId} setCurrentPage={setCurrentPage} />}
    </div>
  );
};

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}