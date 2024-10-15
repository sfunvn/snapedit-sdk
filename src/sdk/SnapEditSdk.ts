import ApiCaller from '../api/ApiCaller';

import {User, SnapEditSdkType} from './types';

export class SnapEditSdk implements SnapEditSdkType {
    private apiCaller: ApiCaller;

    constructor(private apiKey: string) {
        this.apiCaller = new ApiCaller(apiKey);
    }

    async handleRemoveBg(data:any): Promise<User[]> {
        try {
            const response = await this.apiCaller.post('https://platform.snapedit.app/api/background_removal/v1/erase', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}
