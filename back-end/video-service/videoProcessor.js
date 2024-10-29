require('dotenv').config();
const express = require('express');
const multer = require('multer'); // Middleware for handling file uploads
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { exec } = require('child_process'); // For FFmpeg commands
const path = require('path');
const fs = require('fs');

const app = express();

// Configure AWS S3 client
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Multer setup to handle in-memory video uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// **Route 1**: Upload video to S3 directly using presigned URL
app.post('/upload', upload.single('video'), async (req, res) => {
    const { originalname, buffer } = req.file;
    const videoKey = `uploads/${Date.now()}_${originalname}`;

    try {
        // Upload video to S3
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: videoKey,
            Body: buffer,
            ContentType: 'video/mp4',
            ACL: 'private',
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Video uploaded successfully to S3: ${videoKey}`);

        return res.json({ message: 'Video uploaded', key: videoKey });
    } catch (error) {
        console.error('Error uploading to S3:', error);
        return res.status(500).json({ error: 'Failed to upload video to S3.' });
    }
});

// **Route 2**: Transcode video and upload processed file to S3
app.post('/transcode', upload.single('video'), async (req, res) => {
    const { originalname } = req.file;
    const inputPath = path.join(__dirname, 'uploads', originalname);
    const outputFilename = `processed_${Date.now()}_${originalname}`;
    const outputPath = path.join(__dirname, 'uploads', outputFilename);
    const transcodedKey = `transcoded/${outputFilename}`;

    try {
        // Save the uploaded file locally
        fs.writeFileSync(inputPath, req.file.buffer);

        // Transcode the video using FFmpeg
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vcodec h264 ${outputPath}`, (err) => {
                if (err) {
                    console.error('Error during transcoding:', err);
                    reject(err);
                } else {
                    console.log('Video transcoded successfully.');
                    resolve();
                }
            });
        });

        // Upload transcoded video to S3
        const transcodedParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: transcodedKey,
            Body: fs.createReadStream(outputPath),
            ContentType: 'video/mp4',
            ACL: 'private',
        };
        await s3Client.send(new PutObjectCommand(transcodedParams));
        console.log('Transcoded video uploaded to S3.');

        // Cleanup local files
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);

        // Generate presigned URL for the uploaded transcoded video
        const signedUrl = await getSignedUrl(
            s3Client,
            new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: transcodedKey,
            }),
            { expiresIn: 3600 }
        );

        res.json({ message: 'Video transcoded and uploaded', url: signedUrl });
    } catch (error) {
        console.error('Error during video processing:', error);
        return res.status(500).json({ error: 'Video processing failed.' });
    }
});

// **Route 3**: Health check for the video service
app.get('/health', (req, res) => {
    res.json({ status: 'Video Service is running' });
});

// Start the video service on port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Video Service running on port ${PORT}`));
