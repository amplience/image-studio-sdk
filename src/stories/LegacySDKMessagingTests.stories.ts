import { StoryObj, Meta } from '@storybook/html';
import { expect } from '@storybook/test';
import {
  AmplienceImageStudio,
  AmplienceImageStudioOptions,
} from '../AmplienceImageStudio';
import { ImageStudioReason, SDKImage } from '../types';

const IMAGE_STUDIO_DOMAIN = 'https://app.amplience-qa.net';
// const IMAGE_STUDIO_DOMAIN = 'http://localhost:5173';

interface LegacyEventHandlerProps {
  imageUrl: string;
  provider: {
    token: string;
    serviceUrl: string;
  };
  options: AmplienceImageStudioOptions;
}

const meta: Meta<LegacyEventHandlerProps> = {
  title: 'Legacy SDK Messaging Tests',
  tags: ['autodocs'],
  argTypes: {},
  render: () => {
    return document.createElement('div');
  },
};

export default meta;
type Story = StoryObj;

export const TryMe: Story = {
  args: {
    imageUrl:
      'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
    imageName: 'elephant-wild-t',
    mimeType: 'image/jpeg',
    options: {
      domain: IMAGE_STUDIO_DOMAIN,
      sdkMetadataOverride: {},
    },
    encodedOrgId: '',
    decodedOrgId: '',
  },
  render: (args) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';

    const imageStudio = new AmplienceImageStudio(args.options);
    if (args.encodedOrgId) {
      imageStudio.withEncodedOrgId(args.encodedOrgId);
    }
    if (args.decodedOrgId) {
      imageStudio.withDecodedOrgId(args.decodedOrgId);
    }
    const launch = document.createElement('button');
    launch.innerText = 'Launch';
    launch.onclick = async () => {
      nameText.nodeValue = '';
      urlText.nodeValue = '';
      mimeTypeText.nodeValue = '';
      const inputImages: SDKImage[] = [
        {
          url: args.imageUrl,
          name: args.imageName,
          mimeType: args.mimeType,
        },
      ];
      imageStudio.editImages(inputImages).then(
        (result) => {
          switch (result?.reason) {
            case ImageStudioReason.IMAGE:
              if (result?.image) {
                nameText.nodeValue = result.image.name;
                urlText.nodeValue = result.image.url;
                mimeTypeText.nodeValue = result.image.mimeType;
              } else {
                nameText.nodeValue = 'Unexpected Response Format';
                urlText.nodeValue = '';
                mimeTypeText.nodeValue = '';
              }
              break;
            case ImageStudioReason.CLOSED:
              nameText.nodeValue = 'Closed without Image';
              urlText.nodeValue = '';
              mimeTypeText.nodeValue = '';
              break;
            default:
              nameText.nodeValue = 'Unknown Image Studio Reason';
              urlText.nodeValue = '';
              mimeTypeText.nodeValue = '';
              break;
          }
        },
        (error) => {
          nameText.nodeValue = `Failed with error: ${error}`;
          urlText.nodeValue = '';
          mimeTypeText.nodeValue = '';
        },
      );
    };
    wrapper.appendChild(launch);

    const nameText = document.createTextNode('');
    wrapper.appendChild(nameText);

    wrapper.appendChild(document.createElement('br'));

    const mimeTypeText = document.createTextNode('');
    wrapper.appendChild(mimeTypeText);

    wrapper.appendChild(document.createElement('br'));

    const urlText = document.createTextNode('');
    wrapper.appendChild(urlText);

    return wrapper;
  },
};

export const CloseImageStudioWithoutSavingImage: Story = {
  play: async () => {
    const inputImages: SDKImage[] = [
      {
        url: 'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
        name: 'elephant-wild-t',
        mimeType: 'image/jpeg',
      },
    ];

    const imageStudio = new AmplienceImageStudio({
      domain: IMAGE_STUDIO_DOMAIN,
    });
    const response = await imageStudio.editImages(inputImages);

    expect(response?.reason).toBe(ImageStudioReason.CLOSED);
  },
};

export const SaveWhitelisedImage_ShouldSucceed: Story = {
  play: async () => {
    const inputImages: SDKImage[] = [
      {
        url: 'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
        name: 'DO-NOT-CHANGE-ME',
        mimeType: 'image/jpeg',
      },
    ];

    const imageStudio = new AmplienceImageStudio({
      domain: IMAGE_STUDIO_DOMAIN,
    });
    const response = await imageStudio.editImages(inputImages);

    expect(response?.reason).toBe(ImageStudioReason.IMAGE);
    // Aslong as the user doesnt make any changes to the image, expected to receive the same URl back as we submitted to the studio
    expect(response?.image?.url).toBe(
      'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
    );
    expect(response?.image?.name).toBe('DO-NOT-CHANGE-ME');
    expect(response?.image?.mimeType).toBe('image/jpeg');
  },
};

export const SaveNonWhitelisedImage_ShouldSucceed: Story = {
  play: async () => {
    const inputImages: SDKImage[] = [
      {
        url: 'https://www.catster.com/wp-content/uploads/2023/11/orange-cat-riding-a-roomba-or-robotic-vacuum_Sharomka_Shutterstock.jpg.webp',
        name: 'DO-NOT-CHANGE-ME',
        mimeType: 'image/webp',
      },
    ];

    const imageStudio = new AmplienceImageStudio({
      domain: IMAGE_STUDIO_DOMAIN,
    });
    const response = await imageStudio.editImages(inputImages);

    expect(response?.reason).toBe(ImageStudioReason.IMAGE);
    // Aslong as the user doesnt make any changes to the image, expected to receive the same URl back as we submitted to the studio
    expect(response?.image?.url).not.toBe(
      'https://www.catster.com/wp-content/uploads/2023/11/orange-cat-riding-a-roomba-or-robotic-vacuum_Sharomka_Shutterstock.jpg.webp',
    );
    expect(response?.image?.name).toBe('DO-NOT-CHANGE-ME');
    expect(response?.image?.mimeType).toBe('image/webp');
  },
};

export const LaunchStandalone: Story = {
  play: async () => {
    const imageStudio = new AmplienceImageStudio({
      domain: IMAGE_STUDIO_DOMAIN,
    });
    const response = await imageStudio.launch();
    expect(response?.reason).toBe(ImageStudioReason.CLOSED);
  },
};
