const { PutCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const stream = require('stream');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = 'n10937668-VideosTable';


// Generating a pre-signed URL for uploading video
exports.generateUploadUrl = async (req, res) => {
    const { title } = req.body;
    const videoId = Date.now().toString(); //random


    const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${videoId}-${title}`,
        ContentType: 'video/*',
        ACL: 'private',
    };

    try {
        const signedUrl = await getSignedUrl(s3Client, new PutObjectCommand(uploadParams), { expiresIn: 3600 });

        const videoItem = {
            id: videoId,
            'qut-username': 'n10937668@qut.edu.au',
            name: title,
            status: 'pending', //when uploading
            createdAt: new Date().toISOString(),
        };
        await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: videoItem }));

        return res.json({ signedUrl, videoId });
    } catch (err) {
        console.error('Error generating signed URL:', err);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
};

// Transcoding Video and Generating url for download
exports.processVideo = (req, res, next) => {
    const { videoId, title } = req.body;

    const videoKey = `uploads/${videoId}-${title}`; // s3 bucket

    const tempVideoPath = `/tmp/${videoId}-${title}`; //local

    const outputFilename = `transcoded-${Date.now()}-${title}.mp4`;

    const transcodedKey = `transcoded/${outputFilename}`; // S3 bucket folder

    const thumbnailFilename = `thumbnail-${Date.now()}-${path.basename(title, path.extname(title))}.png`;



    const passThroughStream = new stream.PassThrough();



    const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: transcodedKey,
        Body: passThroughStream,
    };


    // Downloading the video a temporary location from s3
    const downloadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: videoKey,
    };


    s3Client.send(new GetObjectCommand(downloadParams)).then((data) => {

        const fileStream = fs.createWriteStream(tempVideoPath); //create write stream

        data.Body.pipe(fileStream); // file

        fileStream.on('close', () => {
            const upload = new Upload({
                client: s3Client,
                params: s3Params,
            });


            // transcoding
            ffmpeg(tempVideoPath)
                .outputOptions(`-f matroska`)
                .on('start', commandLine => {
                    console.log('FFmpeg command: ', commandLine);
                })
                .on('stderr', stderrLine => {
                    console.log('FFmpeg stderr output:', stderrLine);
                })
                .on('error', err => {
                    console.error('Error during transcoding:', err);
                    return next(err);
                })
                .pipe(passThroughStream);

            upload.done()
                .then(async () => {
                    console.log('Video uploaded to S3 successfully.'); //after uploading

                    // video signurl
                    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: transcodedKey,
                    }), { expiresIn: 3600 });

                    // Generating thumbnail
                    const thumbnailPath = `/tmp/${thumbnailFilename}`; //local file
                    ffmpeg(tempVideoPath)
                        .screenshots({
                            timestamps: ['50%'],
                            filename: thumbnailFilename,
                            folder: '/tmp',
                        })
                        .on('end', async () => {
                            console.log("Thumbnail generated.");
                            const thumbnailS3Params = {
                                Bucket: process.env.S3_BUCKET_NAME,
                                Key: `thumbnails/${thumbnailFilename}`,
                                Body: fs.createReadStream(thumbnailPath),
                                ACL: 'private',
                                ContentType: 'image/png',
                            };

                            await s3Client.send(new PutObjectCommand(thumbnailS3Params)); //uploading to s3
                            console.log("Thumbnail uploaded to S3.");

                            // thumnail signed url
                            const thumbnailSignedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
                                Bucket: process.env.S3_BUCKET_NAME,
                                Key: `thumbnails/${thumbnailFilename}`,
                            }), { expiresIn: 3600 });


                            // Updating DynamoDB
                            const updateParams = {
                                TableName: TABLE_NAME,
                                Key: { 'qut-username': 'n10937668@qut.edu.au', name: title },
                                UpdateExpression: 'SET transcodedPath = :tpath, s3Key = :skey, signedUrl = :surl, thumbnailPath = :thumb, #status = :status',
                                ExpressionAttributeValues: {
                                    ':tpath': `/transcoded/${outputFilename}`,
                                    ':skey': transcodedKey,
                                    ':surl': signedUrl,
                                    ':thumb': thumbnailSignedUrl,
                                    ':status': 'completed',
                                },
                                ExpressionAttributeNames: {
                                    '#status': 'status',
                                },
                            };

                            await docClient.send(new UpdateCommand(updateParams));
                            console.log('DynamoDB updated with video details.');

                            fs.unlinkSync(tempVideoPath);

                            return res.json({ signedUrl, thumbnailSignedUrl });
                        });
                });
        });
    });
};


// Fetch all videos from db
exports.getVideos = async (req, res, next) => {
    try {
        const params = {
            TableName: TABLE_NAME,
        };
        const videos = await docClient.send(new ScanCommand(params));
        res.json(videos.Items);
    } catch (err) {
        console.error('Error fetching videos:', err);
        next(err);
    }
};
