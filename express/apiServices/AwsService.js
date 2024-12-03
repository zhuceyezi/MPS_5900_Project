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
     * @returns {Promise<{result: boolean, error}>} - True if faces are deleted, false otherwise.
     */
    async deleteAllFaces() {
        const faceIds = [];
        const faceList = await this.listFaces(process.env.COLLECTION_ID);
        console.log(faceList);
        for (const face of faceList.Faces) {
            faceIds.push(face.FaceId);
        }
        console.log(faceIds);
        return this.deleteFaces(process.env.COLLECTION_ID, faceIds);
    }
    
    /**
     * Searches for faces in an image buffer within a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {Buffer} imageBuffer - The image buffer.
     * @param {number} [faceMatchThreshold=99] - The face match threshold.
     * @returns {Promise<string[]|undefined>} - [imageId, FaceId] if found, otherwise undefined.
     */
    async searchFacesByImage(imageBuffer, faceMatchThreshold = 99) {
        try {
            const imageBytesBuffer = await this.#resizeImage(imageBuffer);
            const params = {
                CollectionId: process.env.COLLECTION_ID,
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
                return [response.FaceMatches[0].Face.ImageId, response.FaceMatches[0].Face.FaceId];
            }
            return undefined;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
    
    /**
     * Indexes faces in an image buffer within a collection.
     * @param {string} collectionId - The ID of the collection.
     * @param {Buffer} imageBuffer - The image buffer.
     * @param employeeName - The name of the employee.
     * @returns {Promise<string[]|undefined>} - [imageId, FaceId] if indexed, otherwise undefined.
     */
    async indexFaces(imageBuffer, employeeName = null) {
        try {
            const imageBytesBuffer = await this.#resizeImage(imageBuffer);
            const params = {
                CollectionId: process.env.COLLECTION_ID,
                DetectionAttributes: ["ALL"],
                Image: {
                    Bytes: imageBytesBuffer
                },
                MaxFaces: 1,
                ExternalImageId: employeeName.replace(" ", "_"),
                QualityFilter: null
            };
            const command = new IndexFacesCommand(params);
            const response = await this.client.send(command);
            if (!(response.FaceRecords && response.FaceRecords.length > 0 && response.FaceRecords[0].Face)) {
                return undefined;
            }
            console.log(JSON.stringify(response, 2, null));
            return [response.FaceRecords[0].Face.FaceId, response.FaceRecords[0].Face.ImageId];
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
    async listFaces(faceIds = []) {
        try {
            const params = {
                CollectionId: process.env.COLLECTION_ID,
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
     * @param {string[]} faceIds - The list of face IDs to delete.
     * @returns {Promise<{result: boolean, error}>} - True if faces are deleted, false otherwise.
     */
    async deleteFaces(faceIds) {
        try {
            const params = {
                CollectionId: process.env.COLLECTION_ID,
                FaceIds: faceIds
            };
            const command = new DeleteFacesCommand(params);
            const response = await this.client.send(command);
            console.log(JSON.stringify(response, null, 2));
            return {result: true};
        } catch (e) {
            console.log(e);
            return {result: false, error: e};
        }
    }
}


module.exports = AwsService;