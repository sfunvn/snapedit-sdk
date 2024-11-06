import ApiCaller from '../api/ApiCaller';

import {DetectionResponse, RemoveObjectImage, SnapEditSdkType} from './types';

const {Buffer} = require('buffer');
const FormData = require('form-data');
const sharp = require('sharp');

function base64ToBuffer(base64: string): Buffer {
    const base64String = base64.split(',')[1] || base64;
    return Buffer.from(base64String, 'base64');
}

const getImageDimensions = async (base64: string): Promise<{ width: number; height: number }> => {
    const imageBuffer = Buffer.from(base64.split(',')[1], 'base64');

    const metadata = await sharp(imageBuffer).metadata();

    return {width: metadata.width, height: metadata.height};
};

function getMimeType(base64: string) {
    const mimeType = base64.match(/data:(.*?);base64/);
    return mimeType ? mimeType[1] : 'application/octet-stream';
}

const applyMaskImage = async (base: string, mask: string): Promise<string> => {
    const baseImageBuffer = Buffer.from(base.split(',')[1], 'base64');
    const maskImageBuffer = Buffer.from(mask, 'base64');

    const sourceImage = sharp(baseImageBuffer);
    const maskImage = sharp(maskImageBuffer);

    const {width, height} = await sourceImage.metadata();

    const resizedMaskBuffer = await maskImage
        .resize(width, height)
        .png()
        .toBuffer();

    const outputImageBuffer = await sourceImage
        .composite([{input: resizedMaskBuffer, blend: 'dest-in'}])
        .png()
        .toBuffer();

    return `data:image/png;base64,${outputImageBuffer.toString('base64')}`;
};

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
    if (!imageData) return Buffer.from('');

    try {
        let enhancedImage = sharp(imageData);

        if (faces?.length) {
            const faceImages = await Promise.all(
                faces.map(async (face) => {
                    const faceImageBuffer = Buffer.from(face.png[0], 'base64');
                    return {
                        buffer: faceImageBuffer,
                        box: face.box
                    };
                })
            );

            for (const face of faceImages) {
                const {box, buffer} = face;
                const [x, y, width, height] = box;

                enhancedImage = enhancedImage.composite([{
                    input: buffer,
                    top: y,
                    left: x,
                    blend: 'over'
                }]);
            }
        }

        const output = await enhancedImage.toBuffer();
        return `data:image/png;base64,${output.toString('base64')}`;
    } catch (error) {
        throw new Error(`Error processing enhanced image`);
    }
};

const handleApplyObject = async (imageBase64: string, response: RemoveObjectImage) => {
    const cutoutFollowBackend = async (response: RemoveObjectImage) => {
        if (!response) return '';

        const imageBuffer = Buffer.from(response.image, 'base64');
        const maskBuffer = Buffer.from(response.mask, 'base64');

        const overlayImageWithoutAlpha = await sharp(maskBuffer)
            .blur(1)
            .toBuffer();

        return await sharp(imageBuffer)
            .composite([{input: overlayImageWithoutAlpha, blend: 'dest-in'}])
            .png()
            .toBuffer();
    };


    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    const cutoutImageBase64 = await cutoutFollowBackend(response);

    if (!cutoutImageBase64) return '';
    const { width, height } = await sharp(imageBuffer).metadata();
    const resizedCutoutBuffer = await sharp(cutoutImageBase64)
        .resize(width, height)
        .toBuffer();

    const finalImageBuffer = await sharp(imageBuffer)
        .composite([{ input: resizedCutoutBuffer, blend: 'over' }])
        .toBuffer();

    return `data:image/jpeg;base64,${finalImageBuffer.toString('base64')}`
}

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
        if (!imageBase64) return ''

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
        if (!imageBase64) return ''

        const mimeType = getMimeType(imageBase64);

        const formData = new FormData();
        const {width, height} = await getImageDimensions(imageBase64)

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

    async handleDetectObject(imageBase64: string): Promise<DetectionResponse | null> {
        if (!imageBase64) return null

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

    async handleRemoveObject(imageBase64: string, newMask: string, oldMask?: string): Promise<string> {
        if (!imageBase64) return ''

        const mimeType = getMimeType(imageBase64);

        const formData = new FormData();
        const resizedImageBuffer = await resizeBase64Image(imageBase64, 1200);
        formData.append('original_preview_image', resizedImageBuffer, {
            filename: `image.${mimeType.split('/')[1]}`,
            contentType: mimeType
        });
        const { width, height } = await sharp(resizedImageBuffer).metadata();

        const maskType = getMimeType(newMask);
        const resizedMaskBuffer = await sharp(Buffer.from(newMask.split(',')[1], 'base64'))
            .resize(width, height)
            .png()
            .toBuffer();
        formData.append('mask_brush', resizedMaskBuffer, {
            filename: `mask.${maskType.split('/')[1]}`,
            contentType: maskType
        });

        if (oldMask) {
            const maskType = getMimeType(oldMask);
            const resizedOldMaskBuffer = await sharp(Buffer.from(oldMask.split(',')[1], 'base64'))
                .resize(width, height)
                .png()
                .toBuffer();
            formData.append('mask_base', resizedOldMaskBuffer, {
                filename: `mask.${maskType.split('/')[1]}`,
                contentType: maskType
            });
        }

        try {
            const response = await this.apiCaller.post('https://platform.snapedit.app/api/object_removal/v1/erase', formData)
            return await handleApplyObject(imageBase64, response?.data?.edited_image)
        } catch (error) {
            throw error;
        }
    }
}
