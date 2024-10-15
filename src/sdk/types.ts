// sdk/types.ts
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface SnapEditSdkType {
    handleRemoveBg(data: any): any;
}
