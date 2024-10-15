"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapEditSdk = void 0;
const ApiCaller_1 = __importDefault(require("../api/ApiCaller"));
const { createCanvas, loadImage } = require('canvas');
const { Buffer } = require('buffer');
const FormData = require('form-data');
const sharp = require('sharp');
function base64ToBuffer(base64) {
    const base64String = base64.split(',')[1] || base64;
    return Buffer.from(base64String, 'base64');
}
function getMimeType(base64) {
    const mimeType = base64.match(/data:(.*?);base64/);
    return mimeType ? mimeType[1] : 'application/octet-stream'; // Trả về loại MIME hoặc kiểu mặc định
}
const applyMaskImage = (base, mask) => __awaiter(void 0, void 0, void 0, function* () {
    const [sourceImg, maskImg] = yield Promise.all([
        loadImage(base),
        loadImage(`data:image/png;base64,${mask}`),
    ]);
    const canvas = createCanvas(sourceImg.width, sourceImg.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceImg, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskImg, 0, 0, sourceImg.width, sourceImg.height);
    return canvas.toDataURL('image/png');
});
const resizeBase64Image = (base64Image) => __awaiter(void 0, void 0, void 0, function* () {
    const [metadata, base64Data] = base64Image.split(';base64,');
    const mimeType = metadata.split(':')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const resizedImageBuffer = yield sharp(imageBuffer)
        .resize({ width: 1280, height: 1280, fit: 'inside' })
        .toBuffer();
    return resizedImageBuffer;
});
class SnapEditSdk {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiCaller = new ApiCaller_1.default(apiKey);
    }
    handleRemoveBg(imageBase64) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!imageBase64)
                return;
            const formData = new FormData();
            const resizedImage = yield resizeBase64Image(imageBase64);
            const mimeType = getMimeType(imageBase64);
            formData.append('input_image', resizedImage, {
                filename: `image.${mimeType.split('/')[1]}`,
                contentType: mimeType
            });
            try {
                const response = yield this.apiCaller.post('https://platform.snapedit.app/api/background_removal/v1/erase', formData);
                return yield applyMaskImage(imageBase64, (_a = response.data) === null || _a === void 0 ? void 0 : _a.output);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.SnapEditSdk = SnapEditSdk;
//# sourceMappingURL=SnapEditSdk.js.map