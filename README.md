
# SnapEdit SDK Package

[![NPM version](https://img.shields.io/npm/v/snapedit-sdk.svg)](https://www.npmjs.com/package/snapedit-sdk)
[![License](https://img.shields.io/npm/l/snapedit-sdk.svg)](https://github.com/sfunvn/snapedit-sdk/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/your-username/snapedit-sdk)](https://github.com/sfunvn/snapedit-sdk/issues)

The SnapEdit SDK Package is a powerful and lightweight software development kit that streamlines the integration of complex functionalities into applications. Its easy-to-use API allows developers to quickly incorporate features such as background removal, object detection, object removal, and image enhancement. Designed to boost productivity, SnapEdit SDK supports various tasks, making it ideal for rapid development and deployment of image-based applications.

## Features

- 🌟 **Background removal**: Effortlessly remove backgrounds from images.
- ✨ **Image Enhancement**: Enhances image quality, including face enhancement.
- 🎨 **Object Detection**: Automatically detects objects within an image.
- 🖌 **Object Removal**: Allows removal of unwanted objects with customizable masks.
  
## Installation

You can install the SDK via npm:

```bash
npm install snapedit-sdk
```

Or yarn:

```bash
yarn add snapedit-sdk
```

## Usage

Here's a quick example of how to use the SDK:

```typescript
import { SnapEditSdk } from 'snapedit-sdk';

const sdk = new SnapEditSdk('YOUR_API_KEY');

// Remove background Example
async function removeBackground(imageBase64: string) {
    const response = await sdk.handleRemoveBg(imageBase64);
    console.log(response); // Image with background removed
}

// Image Enhancement Example
async function enhanceImage(imageBase64: string, zoomFactor: 2 | 4) {
    const response = await sdk.handleEnhanceImage(imageBase64, zoomFactor);
    console.log(response); // Enhanced image data URL
}

// Object Detection Example
async function detectObjects(imageBase64: string) {
    const detectionResults = await sdk.handleDetectObject(imageBase64);
    console.log(detectionResults); // Outputs detected objects and their coordinates
}

// Object Removal Example
async function removeObject(imageBase64: string, maskBase64: string) {
    const newMask = maskBase64; // Base64 encoded mask for the area to remove
    const response = await sdk.handleRemoveObject(imageBase64, newMask);
    console.log(response); // Image with object removed
}
```

## API Documentation

### `SnapEditSdk(apiKey: string)`

- **apiKey**: Your API key from the SnapEdit platform.
  
#### `handleRemoveBg(imageBase64: string): Promise<string>`

Removes the background from a Base64 encoded image.

- **imageBase64**: A Base64 encoded string of the image you want to remove background.


#### `handleEnhanceImage(imageBase64: string, zoomFactor: 2 | 4): Promise<string>`

Enhances the image quality by scaling up using AI techniques. Depending on the input `zoomFactor`, the image can be enhanced by 2x or 4x, improving clarity and detail.

- **imageBase64**: A Base64 encoded string of the image you want to enhance.
- **zoomFactor**: The factor by which the image should be scaled. Can be either 2 or 4.


#### `handleDetectObject(imageBase64: string): Promise<DetectionResponse>`

Detects objects within an image and returns their bounding boxes and other relevant data. Useful for applications requiring automation in object recognition and tracking.

- **imageBase64**: A Base64 encoded string of the image for object detection.


#### `handleRemoveObject(imageBase64: string, newMask: string, oldMask?: string): Promise<RemoveObjectImage>`

Removes an object from the image based on a mask that defines the area to clear. This function allows for precise control over object removal, which can be tailored to specific needs such as removing unwanted items or editing image content.

- **imageBase64**: A Base64 encoded string of the image from which the object is to be removed.
- **newMask**: A Base64 encoded string of the mask that highlights the object to remove.
- **oldMask**: Optional. A Base64 encoded string of a previous mask, if applicable, to refine the removal process.


## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/sfunvn/snapedit-sdk/issues) if you want to contribute.

1. Fork this repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit them: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/sfunvn/snapedit-sdk/blob/main/LICENSE) file for details.

## Support

For any issues, please visit the [GitHub Issues](https://github.com/sfunvn/snapedit-sdk/issues) page or contact us at [contact@silverai.com](mailto:your-email@example.com).

---

Made with ❤️ by [SilverAI](https://github.com/minhquyen96)
