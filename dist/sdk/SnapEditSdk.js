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
class SnapEditSdk {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiCaller = new ApiCaller_1.default(apiKey);
    }
    handleRemoveBg(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.apiCaller.post('https://platform.snapedit.app/api/background_removal/v1/erase', data);
                return response.data;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.SnapEditSdk = SnapEditSdk;
//# sourceMappingURL=SnapEditSdk.js.map