import {DeleteFacesCommand, DetectFacesCommand, IndexFacesCommand, ListCollectionsCommand, ListFacesCommand, RekognitionClient, SearchFacesByImageCommand} from "@aws-sdk/client-rekognition";
import dotenv from "dotenv";
import fs from "fs";
import sharp from "sharp";

dotenv.config({path: "../../.env"});


class AwsService {
    constructor() {
        this.collectionID = process.env.COLLECTION_ID;
        this.client = new RekognitionClient({
                                                region: process.env.AWS_REGION,
                                                credentials: {
                                                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                                                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                                                }
                                            });
    }
    
    async #resizeImage(imageBytes, resizeQuality = 90) {
        let resizedImageBytes = imageBytes;
        while (resizedImageBytes.length > 5242880) { // 5MB in bytes
            resizedImageBytes = await sharp(resizedImageBytes)
                .jpeg({quality: resizeQuality})
                .toBuffer();
        }
        return resizedImageBytes;
    }
    
    async listCollections() {
        const params = {};
        const command = new ListCollectionsCommand(params);
        const response = await this.client.send(command);
        return response['CollectionIds'];
    }
    
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
    
    async searchFacesByImage(collectionId, imagePath, faceMatchThreshold = 99) {
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
    
    async indexFaces(collectionId, imagePath, imageName = undefined) {
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
    
    async listFaces(collectionId, faceIds = []) {
        try {
            const params = {
                CollectionId: collectionId,
                MaxResults: 10
            };
            const command = new ListFacesCommand(params);
            const response = await this.client.send(command);
            console.log(JSON.stringify(response, null, 2));
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    
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


export default AwsService;

const aws = new AwsService();
aws.listFaces(aws.collectionID).then(console.log("done"));