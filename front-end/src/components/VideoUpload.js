import React, { useState } from 'react';
import axios from 'axios';
import ProgressBar from './ProgressBar';
function VideoUpload({ onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [format, setFormat] = useState('mp4'); // default format

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFormatChange = (e) => {
        setFormat(e.target.value);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        try { //requesting a url
            const { data: { signedUrl, videoId } } = await axios.post(`${process.env.REACT_APP_API_URL}/video/upload`, {
                title: file.name,
            });

            // uploading directly to s3
            await axios.put(signedUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

// send to server that video is uploaded and ready to transcode
            const processResponse = await axios.post(`${process.env.REACT_APP_API_URL}/video/transcode`, {
                videoId,
                title: file.name,
                format,
            });

            // send to dashboard
            onUploadComplete(processResponse.data);
        } catch (err) {
            console.error('Error uploading video:', err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setFile(null);
        }
    };

    return (
        <div className="video-upload mb-4">
            <h3>Upload Video</h3>
            <div className="input-group mb-3">
                <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                />
                <select className="form-select" value={format} onChange={handleFormatChange}>
                    <option value="mp4">MP4</option>
                    <option value="avi">AVI</option>
                    <option value="mkv">MKV</option>
                </select>
                <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    Upload
                </button>
            </div>
            {uploading && <ProgressBar progress={uploadProgress} />}
        </div>
    );
}

export default VideoUpload;
