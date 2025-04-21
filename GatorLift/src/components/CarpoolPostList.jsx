import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CarpoolPostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [acceptedCounts, setAcceptedCounts] = useState({});

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const [postsResponse, countsResponse] = await Promise.all([
                    axios.get('http://localhost:3000/api/carpool-posts', {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }),                      
                    axios.get('http://localhost:3000/api/accepted-counts', {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })                      
                ]);
    
                setPosts(postsResponse.data);
                setAcceptedCounts(countsResponse.data);
            } catch (err) {
                setError('Failed to fetch carpool posts');
            } finally {
                setLoading(false);
            }
        };
    
        fetchPosts();
    }, []);
    

    const handleAcceptPost = async (postId) => {
        if (!window.confirm("Are you sure you want to accept this ride?")) {
            return;
        }
    
        try {
            const response = await axios.post(`http://localhost:3000/api/carpool-posts/${postId}/accept`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            const { acceptedCount } = response.data;
    
            setAcceptedCounts((prev) => ({
                ...prev,
                [postId]: acceptedCount
            }));
    
            const post = posts.find(p => p.id === postId);
            if (post && acceptedCount >= post.seats_available) {
                setPosts((prevPosts) => prevPosts.filter(p => p.id !== postId));
            } else {
                setPosts((prevPosts) => prevPosts.filter(p => p.id !== postId));
            }
        } catch (error) {
            // 400 = already accepted, 409 = ride full
            if (
              error.response &&
              (error.response.status === 400 || error.response.status === 409)
            ) {
              setPosts(prev => prev.filter(p => p.id !== postId));
              return;          // silently ignore
            }
          
            console.error('Error accepting post:', error);
            setError('Unexpected network error — please try again.');
          }
          
          
    };
    
    
    

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
                        <div className="mb-1">Seats Offered: <b>{post.seats_available}</b></div>
                        {post.contact_info && <div className="mb-1">Contact: {post.contact_info}</div>}
                        <div className="text-xs text-gray-400">Posted by: {post.userEmail}</div>
                        <button onClick={() => handleAcceptPost(post.id)} className="mt-2 text-sm text-blue-500 hover:text-blue-700">Accept</button>
                        <p className="mt-1 text-sm text-gray-500">Accepted by: {acceptedCounts[post.id] || 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarpoolPostList; 