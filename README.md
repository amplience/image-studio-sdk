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
