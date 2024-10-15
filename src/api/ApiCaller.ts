import axios, {AxiosInstance, AxiosResponse} from 'axios';

const BASE_URL = 'https://platform.snapedit.app'

export default class ApiCaller {
    private axiosInstance: AxiosInstance;

    constructor(private apiKey: string) {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            headers: {
                'X-API-KEY': `${apiKey}`
            },
        });
    }

    async get(endpoint: string): Promise<AxiosResponse> {
        return this.axiosInstance.get(endpoint);
    }

    async post(endpoint: string, data: any): Promise<AxiosResponse> {
        return this.axiosInstance.post(endpoint, data);
    }
}
