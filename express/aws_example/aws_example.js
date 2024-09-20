import dotenv from "dotenv";
import fs from "fs";
import sharp from "sharp";
dotenv.config() // Please set up a .env file that contains things like this:
/*
* AWS_ACCESS_KEY_ID=<>
* AWS_SECRET_ACCESS_KEY=<Your Acess Key>
* AWS_REGION=us-east-1
* */

const collectionID = "my-face-collection"

import {
  DeleteFacesCommand,
  DetectFacesCommand, IndexFacesCommand,
  ListCollectionsCommand, ListFacesCommand,
  RekognitionClient,
  SearchFacesByImageCommand
} from "@aws-sdk/client-rekognition";

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/** Resize image to be under 5MB, otherwise AWS complains.
* @param imageBytes - Raw bytes of an image. Can be Base64 or Uint8Array Buffer
* @param resizeQuality - (Optional, default=90) The % of quality maintained each iteration. Higer values will gain higher
* quality, but slower in time.
* @example
* const imageBytesBuffer = await resizeImage(fs.readFileSync(imagePath));
* @returns The resized image buffer.
* */
async function resizeImage(imageBytes, resizeQuality=90){
  let resizedImageBytes = imageBytes;
  while (resizedImageBytes.length > 5242880) { // 5MB in bytes
    // Resize image iteratively
    resizedImageBytes = await sharp(resizedImageBytes)
      .jpeg({ quality: resizeQuality })
      .toBuffer();
  }
  return resizedImageBytes;
}

/** List all collections.
 *
 * @returns {Promise<*>}
 */
async function listCollections(){
  const params = {}
  const command = new ListCollectionsCommand(params);
  const response = await client.send(command);
  return response['CollectionIds']
}

/** Detect attributes in a face. Will resize automatically if image is > 5MB.
 *
 * @param imagePath - The path to the image.
 * @returns {Promise<Boolean>} - Returns **true** if success, **false** if failed.
 */
async function detectFaces(imagePath){
  try {
    const imageBytesBuffer = await resizeImage(fs.readFileSync(imagePath));
    const params = {
      Image: {
        Bytes: imageBytesBuffer
      },
      Attributes: ["ALL"]
    };
    const command = new DetectFacesCommand(params);
    const response = await client.send(command);
    console.log(JSON.stringify(response, null, 2));
    return true;
  }catch (err){
    console.log(err);
    return false;
  }
}

async function searchFacesByImage(collectionId, imagePath, faceMatchThreshold=99){
  try{
    const imageBytesBuffer = await resizeImage(fs.readFileSync(imagePath));
    const params = {
      CollectionId: collectionId,
      FaceMatchThreshold: faceMatchThreshold,
      Image: {
        Bytes: imageBytesBuffer
      },
      MaxFaces: 1,
      QualityFilter: null
    }
    const command = new SearchFacesByImageCommand(params);
    const response = await client.send(command);
    const faceMatchInfo = response['FaceMatches']
    // console.log("Face Match: " + JSON.stringify(faceMatchInfo,null,2));
    console.log(JSON.stringify(response, null, 2));
  }catch (err){
    console.log(err);
  }
}

/** Index faces and upload them to a collection. Returns **true** if success and **false** if fail
 *
 * @param collectionId - The collection id.
 * @param imagePath - The path to the image.
 * @param imageName - (Optional) The name you would like it to appear on "externalImageId". If not specified, it will be
 * the file name of the image with extension.
 * @returns {Promise<boolean>} - True if success, false if error.
 */
async function indexFaces(collectionId, imagePath, imageName =undefined){
  try {
    const imageBytesBuffer = await resizeImage(fs.readFileSync(imagePath));
    let externalImageIdSplit;
    let externalImageId;
    if (imageName === undefined){
      externalImageIdSplit = imagePath.split("/");
      externalImageId = externalImageIdSplit[externalImageIdSplit.length - 1];
    }
    console.log(imageName === undefined ? externalImageId : imageName);
    const params = {
      CollectionId: collectionId,
      DetectionAttributes: ["ALL"],
      ExternalImageId: imageName === undefined ? externalImageId : imageName,
      Image: {
        Bytes: imageBytesBuffer
      },
      MaxFaces: 1,
      QualityFilter: null
    }
    const command = new IndexFacesCommand(params);
    const response = await client.send(command);
    return true;
  } catch(err){
    console.log(err);
    return false;
  }

}

async function listFaces(collectionId, faceIds=[]){
  try {
    const params = {
      CollectionId: collectionId,
      MaxResults: 10
    }
    const command = new ListFacesCommand(params);
    const response = await client.send(command);
    console.log(JSON.stringify(response, null, 2));
    return true;
  }catch (err){
    console.log(err);
    return false;
  }
}

async function deleteFaces(collectionId, faceIds){
  try {
    const params = {
      CollectionId: collectionId,
      FaceIds: faceIds
    }
    const command = new DeleteFacesCommand(params);
    const response = await client.send(command);
    console.log(JSON.stringify(response, null, 2));
    return true;
  }catch (e) {
    console.log(e);
    return false;
  }
}


const ok = await indexFaces(collectionID, "./lib/zj1.jpg");
// if (ok) {
//   await listFaces("my-face-collection");
// }

await searchFacesByImage(collectionID,"./lib/zj3.jpg");
// const ok = await listFaces("my-face-collection");
// if (ok){
//   await deleteFaces("my-face-collection", ["793d4f9c-0e82-462d-ae30-2345a8be3228"])
// }
// await listCollections();
