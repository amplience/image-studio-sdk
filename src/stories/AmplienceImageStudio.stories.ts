import { StoryObj, Meta } from '@storybook/html';
import { expect } from '@storybook/test';
import {
  AmplienceImageStudio,
  AmplienceImageStudioOptions,
} from '../AmplienceImageStudio';
import {
  ImageSaveEventData,
  ImageStudioEventType,
  SDKEventType,
  SDKImage,
} from '../types';

// const IMAGE_STUDIO_DOMAIN = 'https://app.amplience.net';
const IMAGE_STUDIO_DOMAIN = 'http://localhost:5173';

interface AmplienceImageStudioProps {
  imageUrl: string;
  provider: {
    token: string;
    serviceUrl: string;
  };
  options: AmplienceImageStudioOptions;
}

const meta: Meta<AmplienceImageStudioProps> = {
  title: 'Amplience Image Studio',
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

    const launch = document.createElement('button');
    launch.innerText = 'Launch';
    launch.onclick = async () => {
      nameText.nodeValue = 'Launched';
      urlText.nodeValue = '';
      mimeTypeText.nodeValue = '';
      const inputImages: SDKImage[] = [
        {
          url: args.imageUrl,
          name: args.imageName,
          mimeType: args.mimeType,
        },
      ];

      const imageStudio = new AmplienceImageStudio(
        args.options,
      ).withEventListener(ImageStudioEventType.ImageSave, (data) => {
        const imageData = data as ImageSaveEventData;
        nameText.nodeValue = imageData?.image.name;
        urlText.nodeValue = imageData?.image.url;
        mimeTypeText.nodeValue = imageData?.image.mimeType;
        return SDKEventType.Success;
      });

      if (args.encodedOrgId) {
        imageStudio.withEncodedOrgId(args.encodedOrgId);
      }
      if (args.decodedOrgId) {
        imageStudio.withDecodedOrgId(args.decodedOrgId);
      }
      await imageStudio.editImages(inputImages);
      nameText.nodeValue = 'Closed';
      urlText.nodeValue = '';
      mimeTypeText.nodeValue = '';
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
    }).withEventListener(ImageStudioEventType.ImageSave, () => {
      expect(true).toBeFalsy(); //cause a failure if the user presses save
      return SDKEventType.Fail;
    });
    await imageStudio.editImages(inputImages);
  },
};

export const SaveWhitelisedImage_ShouldReportSuccess: Story = {
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
    }).withEventListener(ImageStudioEventType.ImageSave, (data) => {
      // Aslong as the user doesnt make any changes to the image, expected to receive the same URl back as we submitted to the studio
      const imageData = data as ImageSaveEventData;
      expect(imageData?.image?.url).toBe(
        'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
      );
      expect(imageData?.image?.name).toBe('DO-NOT-CHANGE-ME');
      expect(imageData?.image?.mimeType).toBe('image/jpeg');
      return SDKEventType.Success;
    });
    await imageStudio.editImages(inputImages);
  },
};

export const SaveNonWhitelisedImage_ShouldReportSuccees: Story = {
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
    }).withEventListener(ImageStudioEventType.ImageSave, (data) => {
      // Aslong as the user doesnt make any changes to the image, expected to receive the same URl back as we submitted to the studio
      const imageData = data as ImageSaveEventData;
      expect(imageData?.image?.url).not.toBe(
        'https://www.catster.com/wp-content/uploads/2023/11/orange-cat-riding-a-roomba-or-robotic-vacuum_Sharomka_Shutterstock.jpg.webp',
      );
      expect(imageData?.image?.name).toBe('DO-NOT-CHANGE-ME');
      expect(imageData?.image?.mimeType).toBe('image/webp');
      return SDKEventType.Success;
    });
    await imageStudio.editImages(inputImages);
  },
};

export const SaveImage_ShouldReportFailure: Story = {
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
    }).withEventListener(ImageStudioEventType.ImageSave, () => {
      // Intenionally send a failure back to image-studio
      return SDKEventType.Fail;
    });
    await imageStudio.editImages(inputImages);
  },
};

export const EventListener_NullResponseShouldTriggerDefaultResponse: Story = {
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
    }).withEventListener(ImageStudioEventType.ImageSave, () => {
      return null; // should resolve SDKEventType.Success
    });
    await imageStudio.editImages(inputImages);
  },
};

export const LaunchStandalone: Story = {
  play: async () => {
    const imageStudio = new AmplienceImageStudio({
      domain: IMAGE_STUDIO_DOMAIN,
    });
    await imageStudio.launch();
  },
};
