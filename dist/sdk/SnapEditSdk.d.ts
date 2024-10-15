import { SnapEditSdkType } from './types';
export declare class SnapEditSdk implements SnapEditSdkType {
    private apiKey;
    private apiCaller;
    constructor(apiKey: string);
    handleRemoveBg(imageBase64: string): Promise<any>;
}
