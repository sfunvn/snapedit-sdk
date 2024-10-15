import { AxiosResponse } from 'axios';
export default class ApiCaller {
    private apiKey;
    private axiosInstance;
    constructor(apiKey: string);
    get(endpoint: string): Promise<AxiosResponse>;
    post(endpoint: string, data: any): Promise<AxiosResponse>;
}
