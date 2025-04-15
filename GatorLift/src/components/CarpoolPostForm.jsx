import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CarpoolPostForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        departureLocation: '',
        arrivalLocation: '',
        departureDate: '',
        seatsAvailable: '',
        contactInfo: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('http://localhost:3000/api/carpool-posts', formData, {
                withCredentials: true
            });

            setSuccess('Carpool post created successfully!');
            setFormData({
                departureLocation: '',
                arrivalLocation: '',
                departureDate: '',
                seatsAvailable: '',
                contactInfo: ''
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create carpool post');
        }
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Create Post
                </button>
            </form>
        </div>
    );
};

export default CarpoolPostForm; 