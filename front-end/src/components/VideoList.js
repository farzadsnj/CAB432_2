import React, { useEffect, useState } from 'react';
import { getVideos } from '../extensions/api';
import '../styles/VideoList.css';

function VideoList() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        async function fetchVideos() {
            const fetchedVideos = await getVideos();
            setVideos(fetchedVideos);
        }
        fetchVideos();
    }, []);

    return (
        <div className="video-list">
            <h3>Uploaded Videos</h3>
            <div className="videos-container">


                {videos.map(video => (
                    <div key={video.id} className="video-item">
                        <h4>{video.name}</h4>
                        <p><strong>Status:</strong> {video.status}</p>
                        <p><strong>Uploaded At:</strong> {new Date(video.createdAt).toLocaleString()}</p>



                        {video.thumbnailPath && (
                            <div className="thumbnail-container">
                                <img
                                    src={video.thumbnailPath}
                                    alt="Thumbnail"
                                    className="video-thumbnail"
                                />
                                <a href={video.thumbnailPath} download>
                                    <button className="btn btn-primary">Download Thumbnail</button>
                                </a>
                            </div>
                        )}


                        {video.signedUrl && (
                            <div className="download-container">
                                <a href={video.signedUrl} download>
                                    <button className="btn btn-primary">Download Video</button>
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}


export default VideoList;
