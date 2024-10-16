
# SnapEdit SDK Package

[![NPM version](https://img.shields.io/npm/v/snapedit-sdk.svg)](https://www.npmjs.com/package/snapedit-sdk)
[![License](https://img.shields.io/npm/l/snapedit-sdk.svg)](https://github.com/sfunvn/snapedit-sdk/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/your-username/snapedit-sdk)](https://github.com/sfunvn/snapedit-sdk/issues)

SnapEdit SDK Package is a powerful and lightweight SDK that simplifies common tasks for developers. With its easy-to-use API, you can quickly integrate background removal, image processing, and more into your applications.

## Features

- 🌟 **Background removal**: Effortlessly remove backgrounds from images.
  
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

Here's a quick example of how to use the SDK to remove the background from an image:

```typescript
import { SnapEditSdk } from 'snapedit-sdk';

const sdk = new SnapEditSdk('YOUR_API_KEY');

async function removeBackground(imageBase64: string) {
    const response = await sdk.handleRemoveBg(imageBase64);
    console.log(response); // Image with background removed
}
```

### Image Processing Example

You can also apply a mask to an image:

```typescript
import { applyMaskImage } from 'snapedit-sdk';

async function processImage(baseImage: File, maskBase64: string) {
    const result = await applyMaskImage(baseImage, maskBase64);
    console.log(result); // Processed image as a base64 string
}
```

## API Documentation

### `SnapEditSdk(apiKey: string)`

- **apiKey**: Your API key from the SnapEdit platform.
  
#### `handleRemoveBg(imageBase64: string): Promise<any>`

Removes the background from a Base64 encoded image.

#### `applyMaskImage(base: File, mask: string): Promise<string>`

Applies a mask to the input image and returns a processed image as a Base64 string.

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
