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
## AmplienceImageStudio - Quick Start

### Image Studio Actions

Each action contains a default set of behavioural options:

| Action | Options |
|:----------|:-|
| `editImages` | allowImageSave: true<br>allowLogout: false<br>allowCreate: false |
| `launch` | allowImageSave: false<br>allowLogout: true<br>allowCreate: true |

The user can override the default action behaviours by adding the relevant options to the [`sdkMetadataOverride`](#sdkmetadata) member found within [`AmplienceImageStudioOptions`](#amplienceimagestudiooptions)

#### Edit Images

Image Studio expects an array of images for editing, once the user has editied the images and clicked 'Save Image', the resultant image will be returned within the response object and the Image Studio window will be closed.

_Note: Image Studio currently only uses the first image you submit via this call_

```js
const sdk = new AmplienceImageStudio({
    domain: IMAGE_STUDIO_DOMAIN,
}).withEventListener(ImageStudioEventType.ImageSave, (data) => {
    const imageData = data as ImageSaveEventData;
    // imageData.url = 'https://url-to-your-updated-image',
    // imageData.name = 'updated-image-name',
    // imageData.mimeType = 'image/jpeg',
    return SDKEventType.Success;
});

// This action launches the studio, and resolves a successful promise once the session is closed
await sdk.editImages([{
    url: 'https://url-to-your-image',
    name: 'image-name',
    mimeType: 'image/jpeg',
}]);
```

#### Launch

Launches an Image Studio session standalone, which allows the user to select their own image for editing. Users are _not_ able to save content back to their application and will only be able to download their creations locally.

```js
const sdk = new AmplienceImageStudio({
    domain: IMAGE_STUDIO_DOMAIN,
});

// This action launches the studio in create mode, resolves a successful promise once the session is closed
await sdk.launch();
```


## AmplienceImageStudioOptions

When creating an `AmplienceImageStudio` instance, the constructor takes an `AmplienceImageStudioOptions` object. This defines several options for customizing the behaviour of the studio:

| Key | Description | Default | Optional |
|:----------|:-------------|:-:|:-:|
| domain |  base domain for your image-studio deployment | - | No |
| sdkMetadataOverride |    object containing behavioural overrides for image-studio [SDKMetadata](#sdkmetadata)   | {} | Yes |
| windowTarget | window.open() `target` override, please see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) | '_blank' | Yes |
| windowFeatures | window.open() `windowFeatures` override, please see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) | '' | Yes |

### SDKMetadata

This SDK controls certain behaviours within image-studio through optional enablement flags.

_Failing to submit an option to image-studio will not result in any bad behaviour. Image-Studio determines and controls the default behaviour of every option, however the structure and options available are controlled by this SDK._

| Option | Description | Default |
|:----------|:-|:-:|
| `allowImageSave` | allows content to be saved back to the SDK | `false` |
| `allowLogout` | allows users to logout | `true` |
| `allowCreate` | allows users to create new content | `true` |
|`orgId`*| user organisation ID (used for entitlements and credit consumption) | ''

Along with the above options, some properties can be set following the builder pattern:


```js
const sdk = new AmplienceImageStudio({domain: IMAGE_STUDIO_DOMAIN})
    .withDecodedOrgId('Org_Exampleid');
```

Here are the options that use this approach:

| Option | Description |
|:----------|:-|
| `.withEventListener(ImageStudioEventType.ImageSave, () => {return null;})` | - Allows for users to listen for, and respond to ImageStudioEvents. <br> - User callback must conform to [EventListenerCallback](#eventlistenercallback) <br> - `null` response signifies to use default studio response |
| `.withEncodedOrgId('b3JnYW5pemF0aW9u')` | - Set the user organisation to be used for entitlements and credit consumption. <br> - must provide Base64 encoded ID i.e. GQL data|
| `.withDecodedOrgId('Org_Exampleid')` |  - Set the user organisation to be used for entitlements and credit consumption. <br> - must provide plain text ID i.e. dc-extensions-sdk data|

### EventListenerCallback
Your callback will fire upon receiving the [ImageStudoEventType](./src/types/ImageStudioEventType.ts) that you scubscribed to when registering the callback.

Event Listeners Callbacks must either return a valid SDKEventType or NULL. 
Event Listener Callbacks have [Configurations](./src/types/EventListenerCallback.ts) that dictate the valid SDKEventType's that a user can resolve, once validated an SDKEvent will be fired back to ImageStudio, these allow a user to react to Image Studio events and submit reactive responses to the Studio.
If a user resolves NULL, the SDK will lookup the `default` Image Studio response from the config, if this is `undefined`, then no response is sent to Image Studio.


## Releases

_TLDR `auto` will perform automatic canary builds on `push` and the full release (including version bumping) during PR merge._

This project uses `auto` for the release process, a conventional commits plugin handles version bumping based on the commit history. [Docs](https://intuit.github.io/auto/docs/generated/conventional-commits)

The release process follows the configuration [HERE](https://intuit.github.io/auto/docs/build-platforms/github-actions)

We have also included another plugin, `protected-branch` which works around the fact this repo contains branch protection on `main`. At the time of writing, this plugin isnot documented but the code can be found [HERE](https://github.com/intuit/auto/tree/main/plugins/protected-branch)

This project contains a Ruleset for `main`, with the following options enabled:
```
- Restrict creations
- restrict deletions
- block force pushes
- Requires a pull request before merging
    - approvals: 1
    - dismiss stale pull requests
    - require review from code owners
    - require conversation resolution before merging
```

In order to get around CODEOWNERS being required, we have followed the recommendations for adding @amplience/automation team as owners to `package.json`, `package-lock.json` and `CHANGELOG.md` - this allows `auto` to modify these at release time. The amp automation team also requires `admin` access to this github repo (repo -> settings -> collaborators and teams)

The release process requires a fine grained PAT token to perform the release process: this has been shared to this public repo through `secrets.GH_PUBLIC_REPO_CONTENTS_ACCESS`, the underlying token this references has been scoped to public repo's only. If this pattern is to be used against another project in future, and this is private, please add a PRIVATE variant of this PAT to cover private repos - otherwise add your project to the existing PAT token list of repositories. The purpose of `GH_PUBLIC_REPO_CONTENTS_ACCESS` secret is to cover _only_ public repositories.

The initial part of the release process (checkouts, builds and package write) is controlled by the auto generate `GH_TOKEN` user, we have scoped this user with the correct permissions as found under `permissions:` within [release.yml](.github/workflows/release.yml)

The `GH_PUBLIC_REPO_CONTENTS_ACCESS` PAT is specificially used for the latter `release` portion (ie non-canary builds) and this user requires special privileges to perform package writes, changelog updates and commit's back to the repo itself (this is done via PR). At the time of writing the repository persmissions (through fine grained PAT) are:

```
- actions: read and write
- contents: read and write
- pull-requests: read and write
- issues: read
- metadata: read
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
