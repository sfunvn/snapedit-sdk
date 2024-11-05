// sdk/types.ts
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface SnapEditSdkType {
    handleRemoveBg(image: string): string;
    handleEnhanceImage(image: string, zoomFactor: 2 | 4): string;
    handleDetectObject(image: string): DetectionResponse;
    handleRemoveObject(image: string, newMask: string, oldMask: string): RemoveObjectImage;
}

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface DetectedObject {
    accuracy: number;
    box: BoundingBox;
    object_description: string;
    object_type: "person" | "object";
}

export interface DetectionResponse {
    detected_objects: DetectedObject[];
}

export interface RemoveObjectImage {
    image: string;
    mask: string;
}
