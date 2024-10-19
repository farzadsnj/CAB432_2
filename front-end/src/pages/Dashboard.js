import React, { useState, useEffect } from 'react';
import VideoUpload from '../components/VideoUpload';
import VideoList from '../components/VideoList';
import axios from 'axios';
import { getToken, getRole } from '../extensions/auth';


function Dashboard() {
    const [videos, setVideos] = useState([]);
    const role = getRole();  // Get the role from auth middleware
    useEffect(() => {
        async function fetchVideos() {
            const token = getToken();
            if (!token) {
                window.location.href = '/login'; // Redirect to login if no token
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/video`, {
                    headers: {
                        'x-access-token': token
                    }
                });
                setVideos(response.data);
            } catch (err) {
                console.error('Error fetching videos:', err);
            }
        }

        fetchVideos();
    }, []);


    const handleUploadComplete = (newVideo) => {
        setVideos([newVideo, ...videos]);
    };

    return (
        <div className="custom-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Dashboard</h1>
            </div>
            <VideoUpload onUploadComplete={handleUploadComplete} />
            <VideoList videos={videos}/>
        </div>
    );
}

export default Dashboard;
