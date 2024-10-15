import ApiCaller from '../api/ApiCaller';

import {User, SnapEditSdkType} from './types';
const { createCanvas, loadImage } = require('canvas');
const { Buffer } = require('buffer');
const FormData = require('form-data');
const sharp = require('sharp');

function base64ToBuffer(base64: string): Buffer {
    const base64String = base64.split(',')[1] || base64;
    return Buffer.from(base64String, 'base64');
}

function getMimeType(base64: string) {
    const mimeType = base64.match(/data:(.*?);base64/);
    return mimeType ? mimeType[1] : 'application/octet-stream'; // Trả về loại MIME hoặc kiểu mặc định
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

const resizeBase64Image = async (base64Image: string): Promise<Buffer> => {
    const [metadata, base64Data] = base64Image.split(';base64,');
    const mimeType = metadata.split(':')[1];

    const imageBuffer = Buffer.from(base64Data, 'base64');

    const resizedImageBuffer = await sharp(imageBuffer)
        .resize({ width: 1280, height: 1280, fit: 'inside' })
        .toBuffer();

    return resizedImageBuffer;
};

export class SnapEditSdk implements SnapEditSdkType {
    private apiCaller: ApiCaller;

    constructor(private apiKey: string) {
        this.apiCaller = new ApiCaller(apiKey);
    }

    async handleRemoveBg(imageBase64: string): Promise<any> {
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
}
