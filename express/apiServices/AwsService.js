const {
    DeleteFacesCommand,
    DetectFacesCommand,
    IndexFacesCommand,
    ListCollectionsCommand,
    ListFacesCommand,
    RekognitionClient,
    SearchFacesByImageCommand
} = require('@aws-sdk/client-rekognition');

const dotenv = require("dotenv");
const fs = require("fs");
const sharp = require("sharp");

dotenv.config({path: "../../.env"});


/**
 * AwsService class to interact with AWS Rekognition service.
 */
class AwsService {
    /**
     * Creates an instance of AwsService.
     */
    constructor() {
        this.collectionID = "my-face-collection"; // dummy collection. TODO: replace this.
        this.client = new RekognitionClient({
                                                region: process.env.AWS_REGION,
                                                credentials: {
                                                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                                                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                                                }
                                            });
    }
    
    /**
     * Resizes the image to be under 5MB.
     * @param {Buffer} imageBytes - The image bytes to resize.
     * @param {number} [resizeQuality=90] - The quality of the resized image.
     * @returns {Promise<Buffer>} - The resized image bytes.
     * @private
     */
    async #resizeImage(imageBytes, resizeQuality = 90) {
        let resizedImageBytes = imageBytes;
        while (resizedImageBytes.length > 5242880) { // 5MB in bytes
            resizedImageBytes = await sharp(resizedImageBytes)
                .jpeg({quality: resizeQuality})
                .toBuffer();
        }
        return resizedImageBytes;
    }
    
    /**
     * Lists all collections in AWS Rekognition.
     * @returns {Promise<string[]>} - The list of collection IDs.
     */
    async listCollections() {
        const params = {};
        const command = new ListCollectionsCommand(params);
        const response = await this.client.send(command);
        return response['CollectionIds'];
    }
    
    /**
     * Detects faces in an image.
     * @param {string} imagePath - The path to the image file.
     * @returns {Promise<boolean>} - True if faces are detected, false otherwise.
     */
    async detectFaces(imagePath) {
        try {
            const imageBytesBuffer = await this.#resizeImage(fs.readFileSync(imagePath));
            const params = {
                Image: {
                    Bytes: imageBytesBuffer
                },
                Attributes: ["ALL"]
            };
            const command = new DetectFacesCommand(params);
            const response = await this.client.send(command);
            console.log(JSON.stringify(response, null, 2));
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    
    /**
     * Deletes all faces in a collection.
     * @param {string} collectionId - The ID of the collection.
     * @returns {Promise<boolean>} - True if faces are deleted, false otherwise.
     */
    async deleteAllFaces(collectionId) {
        const faceIds = [];
        const faceList = await this.listFaces(collectionId);
        console.log(faceList);
        for (const face of faceList.Faces) {
            faceIds.push(face.FaceId);
        }
        console.log(faceIds);
        return this.deleteFaces(collectionId, faceIds);
    }
    
    /**
     * Searches for faces in an image within a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} imagePath - The path to the image file.
     * @param {number} [faceMatchThreshold=99] - The face match threshold.
     * @returns {Promise<void>}
     */
    async #searchFacesByImage(collectionId, imagePath, faceMatchThreshold = 99) {
        try {
            const imageBytesBuffer = await this.#resizeImage(fs.readFileSync(imagePath));
            const params = {
                CollectionId: collectionId,
                FaceMatchThreshold: faceMatchThreshold,
                Image: {
                    Bytes: imageBytesBuffer
                },
                MaxFaces: 1,
                QualityFilter: null
            };
            const command = new SearchFacesByImageCommand(params);
            const response = await this.client.send(command);
            const faceMatchInfo = response['FaceMatches'];
            console.log(JSON.stringify(response, null, 2));
        } catch (err) {
            console.log(err);
        }
    }
    
    /**
     * Searches for faces in an image buffer within a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {Buffer} imageBuffer - The image buffer.
     * @param {number} [faceMatchThreshold=99] - The face match threshold.
     * @returns {Promise<string|undefined>} - The face ID if found, otherwise undefined.
     */
    async searchFacesByImage(collectionId, imageBuffer, faceMatchThreshold = 99) {
        try {
            const imageBytesBuffer = await this.#resizeImage(imageBuffer);
            const params = {
                CollectionId: collectionId,
                FaceMatchThreshold: faceMatchThreshold,
                Image: {
                    Bytes: imageBytesBuffer
                },
                MaxFaces: 1,
                QualityFilter: null
            };
            const command = new SearchFacesByImageCommand(params);
            const response = await this.client.send(command);
            console.log(JSON.stringify(response, null, 2));
            if (response.FaceMatches && response.FaceMatches.length > 0 && response.FaceMatches[0].Face) {
                return response.FaceMatches[0].Face.FaceId;
            }
            return undefined;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
    
    /**
     * Indexes faces in an image within a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string} imagePath - The path to the image file.
     * @param {string} [imageName] - The name of the image.
     * @returns {Promise<boolean>} - True if faces are indexed, false otherwise.
     */
    async #indexFaces(collectionId, imagePath, imageName = undefined) {
        try {
            const imageBytesBuffer = await this.#resizeImage(fs.readFileSync(imagePath));
            let externalImageIdSplit;
            let externalImageId;
            if (imageName === undefined) {
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
            };
            const command = new IndexFacesCommand(params);
            const response = await this.client.send(command);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    
    /**
     * Indexes faces in an image buffer within a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {Buffer} imageBuffer - The image buffer.
     * @returns {Promise<string|undefined>} - The face ID if indexed, otherwise undefined.
     */
    async indexFaces(collectionId, imageBuffer) {
        try {
            const imageBytesBuffer = await this.#resizeImage(imageBuffer);
            const params = {
                CollectionId: collectionId,
                DetectionAttributes: ["ALL"],
                Image: {
                    Bytes: imageBytesBuffer
                },
                MaxFaces: 1,
                QualityFilter: null
            };
            const command = new IndexFacesCommand(params);
            const response = await this.client.send(command);
            if (response.FaceRecords && response.FaceRecords.length > 0 && response.FaceRecords[0].Face) {
                return response.FaceRecords[0].Face.FaceId;
            }
            console.log(JSON.stringify(response));
            return undefined;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
    
    /**
     * Lists faces in a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string[]} [faceIds=[]] - The list of face IDs.
     * @returns {Promise<Object|null>} - The response from AWS Rekognition or null if an error occurs.
     */
    async listFaces(collectionId, faceIds = []) {
        try {
            const params = {
                CollectionId: collectionId,
                MaxResults: 10
            };
            const command = new ListFacesCommand(params);
            const response = await this.client.send(command);
            //console.log(JSON.stringify(response, null, 2));
            return response;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    
    /**
     * Deletes faces from a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {string[]} faceIds - The list of face IDs to delete.
     * @returns {Promise<boolean>} - True if faces are deleted, false otherwise.
     */
    async deleteFaces(collectionId, faceIds) {
        try {
            const params = {
                CollectionId: collectionId,
                FaceIds: faceIds
            };
            const command = new DeleteFacesCommand(params);
            const response = await this.client.send(command);
            console.log(JSON.stringify(response, null, 2));
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}


module.exports = AwsService;

const aws = new AwsService();
aws.listFaces(aws.collectionID).then(console.log("done"));