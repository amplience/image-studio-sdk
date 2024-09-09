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

### Edit Images

Image Studio expects an array of images for editing, once the user has editied the images and clicked 'Save Image', the resultant image will be returned within the response object and the Image Studio window will be closed.

_Note: Image Studio currently only uses the first image you submit via this call_

```js
const sdk = new AmplienceImageStudio();
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
const sdk = new AmplienceImageStudio();
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
