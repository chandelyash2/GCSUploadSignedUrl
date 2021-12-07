const express = require('express');

const {Storage} = require('@google-cloud/storage');
const dotenv = require('dotenv');
const crypto = require('crypto');
const app = express();
const path = require('path');
dotenv.config();

const serviceKey = path.join(__dirname, 'gcs json file here');
const projectID = process.env.GOOGLE_PROJECT_ID;
const BucketName = process.env.BUCKET_NAME;
// Instantiate a storage client
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: `${projectID}`,
});
const generateSignedUploadUrl = async (imageName, imageId, mediaType) => {
  try {
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const remoteFilePath = `${mediaType}/${imageId}${imageName}`;

    const [url] = await storage
      .bucket(`${BucketName}`, {})
      .file(remoteFilePath)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 30 * 60 * 1000, // 30 minutes
      });

    return url;
  } catch (err) {
    console.log('err', err);
  }
};

router.post('/postUpload', async (req, res) => {
  const imageId = crypto.randomBytes(6).toString('hex');
  const imageName = req.body.fileName;

  let mediaType = '';
  
  const data = await generateSignedUploadUrl(imageName, imageId, mediaType);
  //  console.log(data,'dataa')
  const response = {
    signedUrl: data,
    publicUrl: `https://storage.googleapis.com/curve/${mediaType}/${imageId}${imageName}`,
  };
  res.send(response);
});

app.listen(5000, () => {
  console.log(`App listening on port 5000`);
});
