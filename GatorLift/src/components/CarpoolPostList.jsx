import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CarpoolPostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/carpool-posts');
                setPosts(response.data);
            } catch (err) {
                setError('Failed to fetch carpool posts');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div>Loading carpool posts...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    if (posts.length === 0) return <div>No carpool posts available.</div>;

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Available Carpool Rides</h2>
            <div className="divide-y divide-gray-300">
                {posts.map((post, idx) => (
                    <div
                        key={post.id}
                        className={`p-4 bg-white rounded-lg border border-gray-300 shadow-sm transition-colors hover:bg-blue-50 hover:border-blue-400 ${idx !== 0 ? 'mt-6' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-lg whitespace-nowrap">{post.departure_location} → {post.arrival_location}</span>
                            <span className="text-sm text-gray-500 flex-shrink-0">&nbsp;{new Date(post.departure_date).toLocaleString()}</span>
                        </div>
                        <div className="mb-1">Seats Available: <b>{post.seats_available}</b></div>
                        {post.contact_info && <div className="mb-1">Contact: {post.contact_info}</div>}
                        <div className="text-xs text-gray-400">Posted by: {post.userEmail}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarpoolPostList; 