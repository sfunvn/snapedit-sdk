import ApiCaller from '../api/ApiCaller';

import {DetectionResponse, RemoveObjectImage, SnapEditSdkType} from './types';

const {createCanvas, loadImage} = require('canvas');
const {Buffer} = require('buffer');
const FormData = require('form-data');
const sharp = require('sharp');

function base64ToBuffer(base64: string): Buffer {
    const base64String = base64.split(',')[1] || base64;
    return Buffer.from(base64String, 'base64');
}

function getMimeType(base64: string) {
    const mimeType = base64.match(/data:(.*?);base64/);
    return mimeType ? mimeType[1] : 'application/octet-stream';
}

const applyMaskImage = async (
    base: string,
    mask: string,
) => {
    const [sourceImg, maskImg] = await Promise.all([
        loadImage(base),
        loadImage(`data:image/png;base64,${mask}`),
    ]);

    const canvas = createCanvas(sourceImg.width, sourceImg.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(sourceImg, 0, 0);

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskImg, 0, 0, sourceImg.width, sourceImg.height);

    return canvas.toDataURL('image/png')
}

const resizeBase64Image = async (base64Image: string, size = 1280): Promise<Buffer> => {
    const [metadata, base64Data] = base64Image.split(';base64,');
    const mimeType = metadata.split(':')[1];

    const imageBuffer = Buffer.from(base64Data, 'base64');

    const resizedImageBuffer = await sharp(imageBuffer)
        .resize({width: size, height: size, fit: 'inside'})
        .toBuffer();

    return resizedImageBuffer;
};

export const removeBase64Prefix = (base64String: string) => {
    if (!base64String) {
        return null;
    }

    return base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
}

const handleEnhanceLargeImage = async (
    imageData: Buffer,
    faces?: { box: number[]; png: string[] }[]
): Promise<string> => {
    if (!imageData) return '';

    try {
        const image = await loadImage(imageData);

        const canvas = createCanvas(image.width, image.height);
        const context = canvas.getContext('2d');

        context.drawImage(image, 0, 0, image.width, image.height);

        if (!faces?.length) {
            return canvas.toDataURL();
        }

        for (const face of faces) {
            const [x, y, width, height] = face.box;
            const faceImageBuffer = Buffer.from(face.png[0], 'base64');
            const faceImage = await loadImage(faceImageBuffer);


            context.drawImage(faceImage, x, y, width, height);
        }


        return canvas.toDataURL();
    } catch (error) {
        throw new Error(`Error processing enhanced image: ${error.message}`);
    }
};

export const FILE = {
    MAX_SIZE_DOWNLOAD: 3000,
    MAX_SIZE: 1400,
}


export class SnapEditSdk implements SnapEditSdkType {
    private apiCaller: ApiCaller;

    constructor(private apiKey: string) {
        this.apiCaller = new ApiCaller(apiKey);
    }

    async handleRemoveBg(imageBase64: string): Promise<string> {
        if (!imageBase64) return

        const formData = new FormData();

        const resizedImage = await resizeBase64Image(imageBase64)

        const mimeType = getMimeType(imageBase64);

        formData.append('input_image', resizedImage, {
            filename: `image.${mimeType.split('/')[1]}`,
            contentType: mimeType
        });

        try {
            const response = await this.apiCaller.post('https://platform.snapedit.app/api/background_removal/v1/erase', formData);
            return await applyMaskImage(imageBase64, response.data?.output)
        } catch (error) {
            throw error;
        }
    }

    async handleEnhanceImage(imageBase64: string, zoomFactor: 2 | 4): Promise<string> {
        if (!imageBase64) return

        const mimeType = getMimeType(imageBase64);

        const formData = new FormData();
        const {width, height} = await loadImage(imageBase64)

        const largestSide = Math.max(width, height)
        let postImageData = null
        let realScale: number = zoomFactor

        if (largestSide < FILE.MAX_SIZE) {
            realScale = zoomFactor
            postImageData = await resizeBase64Image(imageBase64, largestSide)
        } else if (
            FILE.MAX_SIZE <= largestSide &&
            largestSide <= FILE.MAX_SIZE_DOWNLOAD
        ) {
            postImageData = await resizeBase64Image(imageBase64, FILE.MAX_SIZE)
            realScale = zoomFactor
        } else {
            realScale = zoomFactor / 2
            postImageData = await resizeBase64Image(imageBase64, FILE.MAX_SIZE_DOWNLOAD)
        }
        formData.append('input_image', postImageData, {
            filename: `image.${mimeType.split('/')[1]}`,
            contentType: mimeType
        });
        formData.append('zoom_factor', realScale)
        formData.append('face_model_ids', '0')

        try {
            const response = await this.apiCaller.post('https://platform.snapedit.app/api/image_enhancement/v1/enhance', formData);
            return `data:image/png;base64,${response?.data?.output_images?.[0] ||
            removeBase64Prefix(
                await handleEnhanceLargeImage(postImageData, response?.data?.faces)
            )}`
        } catch (error) {
            throw error;
        }
    }

    async handleDetectObject(imageBase64: string): Promise<DetectionResponse> {
        if (!imageBase64) return

        const mimeType = getMimeType(imageBase64);

        const formData = new FormData();

        formData.append('original_preview_image', await resizeBase64Image(imageBase64, 1200), {
            filename: `image.${mimeType.split('/')[1]}`,
            contentType: mimeType
        });

        try {
            const response = await this.apiCaller.post('https://platform.snapedit.app/api/object_removal/v1/auto_suggest', formData)
            return response.data
        } catch (error) {
            throw error;
        }
    }

    async handleRemoveObject(imageBase64: string, newMask: string, oldMask?: string): Promise<RemoveObjectImage> {
        if (!imageBase64) return

        const mimeType = getMimeType(imageBase64);

        const formData = new FormData();

        formData.append('original_preview_image', await resizeBase64Image(imageBase64, 1200), {
            filename: `image.${mimeType.split('/')[1]}`,
            contentType: mimeType
        });

        const maskType = getMimeType(newMask);
        formData.append('mask_brush', await resizeBase64Image(newMask, 1200), {
            filename: `mask.${maskType.split('/')[1]}`,
            contentType: maskType
        });

        if (oldMask) {
            const maskType = getMimeType(oldMask);
            formData.append('mask_base', await resizeBase64Image(oldMask, 1200), {
                filename: `mask.${maskType.split('/')[1]}`,
                contentType: maskType
            });
        }

        try {
            const response = await this.apiCaller.post('https://platform.snapedit.app/api/object_removal/v1/super_erase', formData)
            return response.data
        } catch (error) {
            throw error;
        }
    }
}
