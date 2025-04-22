import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CarpoolPostForm = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        departureLocation: '',
        arrivalLocation: '',
        departureDate: '',
        seatsAvailable: '',
        contactInfo: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [editingId, setEditingId] = useState(null);


    const resetForm = () => setFormData({
             departureLocation: '',
             arrivalLocation:  '',
             departureDate:    '',
             seatsAvailable:   (userProfile?.seatsAvailable ?? '').toString(),
             contactInfo:      userProfile?.contactInfo ?? ''
        });

    // Ensure user is logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUserProfile(data);
                    // Autofill contact info and seats available if they exist
                    setFormData(prev => ({
                        ...prev,
                        contactInfo: data.contactInfo || prev.contactInfo,
                        seatsAvailable: data.seatsAvailable || prev.seatsAvailable
                    }));
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };

        if (currentUser) {
            fetchProfile();
            fetchMyPosts();
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const fetchMyPosts = async () => {
            const res = await axios.get('http://localhost:3000/api/my-carpool-posts', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMyPosts(res.data);
        };

    const handleShowConfirmation = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.departureLocation || !formData.arrivalLocation || 
            !formData.departureDate || !formData.seatsAvailable) {
            setError('Please fill out all required fields');
            return;
        }

        // Validate departure date is in the future
        const departureDate = new Date(formData.departureDate);
        if (departureDate <= new Date()) {
            setError('Departure date must be in the future');
            return;
        }

        setError('');
        setShowConfirmation(true);
    };

    const handleCancelConfirmation = () => {
        setShowConfirmation(false);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Format seats as a number
            const postData = {
                ...formData,
                seatsAvailable: parseInt(formData.seatsAvailable, 10)
            };

            // Get token from localStorage using the correct key
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('You must be logged in to create a post. Please log in again.');
                setShowConfirmation(false);
                navigate('/login');
                return;
            }
            
            console.log('Sending request with token:', token);
            
            const url = editingId 
            ? `http://localhost:3000/api/carpool-posts/${editingId}` : 'http://localhost:3000/api/carpool-posts';
            const method = editingId ? 'put' : 'post';
            const response = await axios[method](url, postData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Post response:', response);
            setSuccess('Carpool post created successfully!');
            setTimeout(() => setSuccess(''), 4000);
            setFormData({
                departureLocation: '',
                arrivalLocation: '',
                departureDate: '',
                seatsAvailable:     (userProfile?.seatsAvailable ?? '').toString(),
                contactInfo:        userProfile?.contactInfo ?? ''
            });
            setShowConfirmation(false);
            setEditingId(null);
            fetchMyPosts();
        } catch (err) {
            console.error('Error creating post:', err);
            let errorMessage = 'Failed to create carpool post';
            
            if (err.response) {
                console.log('Error response:', err.response);
                
                if (err.response.status === 401) {
                    // Authentication error
                    errorMessage = 'Authentication failed. Please log in again.';
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response.data && err.response.data.errors) {
                    // Validation errors
                    errorMessage = err.response.data.errors.join(', ');
                } else if (err.response.data && err.response.data.error) {
                    // Server error with message
                    errorMessage = err.response.data.error;
                } else if (err.response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                }
            }
            
            setError(errorMessage);
            setShowConfirmation(false);
        }
    };

    // Format date for display in confirmation
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString();
    };


    const handleDelete = async (id) => {
            if (!window.confirm('Delete this post?')) return;
            await axios.delete(`http://localhost:3000/api/carpool-posts/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMyPosts(p => p.filter(x => x.id !== id));
        };
        
        const handleEdit = (p) => {
            setFormData({
                departureLocation: p.departure_location,
                arrivalLocation:   p.arrival_location,
                departureDate:     new Date( 
                    new Date(p.departure_date).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16),
                seatsAvailable:    p.seats_available.toString(),
                contactInfo:       p.contact_info || ''
            });
            setEditingId(p.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Carpool Post</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    {success}
                </div>
            )}

            {!showConfirmation ? (
                <form onSubmit={handleShowConfirmation} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Departure Location
                        </label>
                        <input
                            type="text"
                            name="departureLocation"
                            value={formData.departureLocation}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Arrival Location
                        </label>
                        <input
                            type="text"
                            name="arrivalLocation"
                            value={formData.arrivalLocation}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Departure Date and Time
                        </label>
                        <input
                            type="datetime-local"
                            name="departureDate"
                            value={formData.departureDate}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Number of Seats Available
                        </label>
                        <input
                            type="number"
                            name="seatsAvailable"
                            value={formData.seatsAvailable}
                            onChange={handleChange}
                            required
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Contact Information (Optional)
                        </label>
                        <input
                            type="text"
                            name="contactInfo"
                            value={formData.contactInfo}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-blue-600"
                        style={{ backgroundColor: '#0d6efd', color: 'white' }}
                    >
                        Continue
                    </button>
                    {editingId && (<button type="button" onClick={() => { setEditingId(null); resetForm(); }}
                        className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none">Cancel Edit
                        </button>
                    )}
                </form>
            ) : (
                <div className="confirmation-dialog">
                    <h3 className="text-xl font-semibold mb-4">Confirm Your Carpool Post</h3>
                    <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded">
                        <p><strong>From:</strong> {formData.departureLocation}</p>
                        <p><strong>To:</strong> {formData.arrivalLocation}</p>
                        <p><strong>When:</strong> {formatDate(formData.departureDate)}</p>
                        <p><strong>Available Seats:</strong> {formData.seatsAvailable}</p>
                        {formData.contactInfo && <p><strong>Contact:</strong> {formData.contactInfo}</p>}
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleCancelConfirmation}
                            className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 border border-green-600"
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                        >
                            Confirm Post
                        </button>
                    </div>
                </div>
            )}

            {myPosts.length > 0 && (
                <div className="mt-10">
                    <h3 className="text-xl font-semibold mt-5 text-center">Your Posts</h3>
                    <div className="space-y-6">
                        {myPosts.map(post => (
                            <div key={post.id}
                                    className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold">{post.departure_location} → {post.arrival_location}
                                    </span>
                                    <span className="text-sm text-gray-500"> {new Date(post.departure_date).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm mb-1">
                                    Seats&nbsp;{post.seats_available} – Accepted&nbsp;{post.acceptedCount}
                                </div>
                                {post.contact_info && (
                                    <div className="text-xs text-gray-400">{post.contact_info}</div>
                                )}
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleEdit(post)}
                                            className="filter-element px-2 py-1 text-sm">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(post.id)}
                                            className="filter-element px-2 py-1 text-sm">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarpoolPostForm; 