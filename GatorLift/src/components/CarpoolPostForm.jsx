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
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
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
            
            const response = await axios.post('http://localhost:3000/api/carpool-posts', postData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Post response:', response);
            setSuccess('Carpool post created successfully!');
            setFormData({
                departureLocation: '',
                arrivalLocation: '',
                departureDate: '',
                seatsAvailable: '',
                contactInfo: ''
            });
            setShowConfirmation(false);
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
        </div>
    );
};

export default CarpoolPostForm; 