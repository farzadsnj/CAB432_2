import React, { useEffect, useState } from 'react';
import { getPexelsVideos } from '../extensions/api';

function PexelsVideos() {
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchPexelsVideos() {
            try {
                const data = await getPexelsVideos();
                setVideos(data.videos);
            } catch (err) {
                console.error('Failed to fetch videos:', err);
                if (err.message === 'No token found, please login first.') {
                    setError('Please log in to view Pexels videos.');
                } else {
                    setError('Failed to fetch videos. Please try again later.');
                }
            }
        }
        fetchPexelsVideos();
    }, []);

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }



    return (
        <div>
            {videos.map(video => (
                <div key={video.id}>
                    <h3>{video.user.name}</h3>
                    <video width="320" height="240" controls>
                        <source src={video.video_files[0].link} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ))}
        </div>
    );
}


export default PexelsVideos;
