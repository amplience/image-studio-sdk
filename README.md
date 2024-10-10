# @amplience/image-studio-sdk

> Official SDK for embedding Amplience Image Studio

This SDK is designed to help embed the Amplience Image Studio into business admin interfaces, allowing merchants, marketers and authors to generate images as part of their existing tools and workflow.


## Installation

Using npm:

```sh
npm install @amplience/image-studio-sdk --save
```

## Usage

ES6:

```js
import { AmplienceImageStudio } from '@amplience/image-studio-sdk';

const sdk = new AmplienceImageStudio();
```

CommonJS:

```js
const { AmplienceImageStudio } = require('@amplience/image-studio-sdk');

const sdk = new AmplienceImageStudio();
```

_Creating a global instance of `AmplienceImageStudio` is advised against, and a new one should be created for each interaction due to shared promise management you may get expected results if you make asynchronous interactions with the same instance._

## ImageStudioOptions
When creating an `AmplienceImageStudio` instance, the constructor takes an `AmplienceImageStudioOptions` object. This defines several options for customizing the behaviour of the studio:

| Key | Description | Default | Optional |
|:----------|:-------------|:-:|:-:|
| domain |  base domain for your image-studio deployment | - | No |
| sdkMetadataOverride |    object containing behavioural overrides for image-studio [SDKMetadata](#sdkmetadata)   | {} | Yes |
| windowTarget | window.open() `target` override, please see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) | '_blank' | Yes |
| windowFeatures | window.open() `windowFeatures` override, please see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) | '' | Yes |

## SDKMetadata

This SDK controls certain behaviours within image-studio through optional enablement flags.

_Failing to submit an option to image-studio will not result in any bad behaviour. Image-Studio determines and controls the default behaviour of every option, however the structure and options available are controlled by this SDK._

| Option | Description | Default |
|:----------|:-|:-:|
| `allowImageSave` | allows content to be saved back to the SDK | `false` |
| `allowLogout` | allows users to logout | `true` |
| `allowCreate` | allows users to create new content | `true` |

## Image Studio Actions

Each action contains a default set of behavioural options:

_Note that not every option is supplied by default._

| Action | Options |
|:----------|:-|
| `editImages` | allowImageSave: true<br>allowLogout: false<br>allowCreate: false |
| `launch` | allowImageSave: false<br>allowLogout: true<br>allowCreate: true |

The user can override the default action behaviours by adding the relevant options to the `sdkMetadataOverride` member foun within `AmplienceImageStudioOptions`

### Edit Images

Image Studio expects an array of images for editing, once the user has editied the images and clicked 'Save Image', the resultant image will be returned within the response object and the Image Studio window will be closed.

_Note: Image Studio currently only uses the first image you submit via this call_

```js
const sdk = new AmplienceImageStudio({
    domain: IMAGE_STUDIO_DOMAIN,
});
const response = await sdk.editImages([{
    url: 'https://url-to-your-image',
    name: 'image-name',
    mimeType: 'image/jpeg', 
}]);

if(response.reason == ImageStudioReason.IMAGE) {
    console.log(response.image);
    // Example Image Response
    // {
    //     url: 'https://url-to-your-updated-image',
    //     name: 'updated-image-name',
    //     mimeType: 'image/jpeg', 
    // }
}
```

### Launch

Launches an Image Studio session standalone, which allows the user to select their own image for editing. Users are _not_ able to save content back to their application and will only be able to download their creations locally.

```js
const sdk = new AmplienceImageStudio({
    domain: IMAGE_STUDIO_DOMAIN,
});
const response = await sdk.launch();

if(response.reason == ImageStudioReason.CLOSED) {
    console.log("Success");
}
```


## License

This software is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0),

Copyright 2024 Amplience

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
