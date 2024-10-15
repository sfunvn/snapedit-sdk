import { User, SnapEditSdkType } from './types';
export declare class SnapEditSdk implements SnapEditSdkType {
    private apiKey;
    private apiCaller;
    constructor(apiKey: string);
    handleRemoveBg(data: any): Promise<User[]>;
}
