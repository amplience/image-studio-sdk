import { StoryObj, Meta } from '@storybook/html';
import { expect } from '@storybook/test';
import {
  AmplienceImageStudio,
  AmplienceImageStudioOptions,
} from '../AmplienceImageStudio';
import { ImageStudioReason, SDKImage } from '../types';

const IMAGE_STUDIO_URL = 'http://localhost:5173/image-studio/';
// const IMAGE_STUDIO_URL = 'https://app.amplience-qa.net/image-studio/';

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
    options: {
      baseUrl: IMAGE_STUDIO_URL,
    },
  },
  render: (args) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';

    const imageStudio = new AmplienceImageStudio(args.options);
    const launch = document.createElement('button');
    launch.innerText = 'Launch';
    launch.onclick = async () => {
      const inputImages: SDKImage[] = [
        {
          url: args.imageUrl,
          name: args.imageName,
        },
      ];
      imageStudio.editImages(inputImages).then(
        (result) => {
          switch (result?.reason) {
            case ImageStudioReason.IMAGE:
              if (result?.image) {
                nameText.nodeValue = result.image.name;
                urlText.nodeValue = result.image.url;
              } else {
                nameText.nodeValue = 'Unexpected Response Format';
                urlText.nodeValue = '';
              }
              break;
            case ImageStudioReason.CLOSED:
              nameText.nodeValue = 'Closed without Image';
              urlText.nodeValue = '';
              break;
            default:
              nameText.nodeValue = 'Unknown Image Studio Reason';
              urlText.nodeValue = '';
              break;
          }
        },
        (error) => {
          nameText.nodeValue = `Failed with error: ${error}`;
          urlText.nodeValue = '';
        },
      );
    };
    wrapper.appendChild(launch);

    const nameText = document.createTextNode('');
    wrapper.appendChild(nameText);

    const br = document.createElement('br');
    wrapper.appendChild(br);

    const urlText = document.createTextNode('');
    wrapper.appendChild(urlText);

    return wrapper;
  },
};

export const EditImages_CloseWithoutSendingImage: Story = {
  play: async () => {
    const inputImages: SDKImage[] = [
      {
        url: 'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
        name: 'elephant-wild-t',
      },
    ];
    const imageStudio = new AmplienceImageStudio({
      baseUrl: IMAGE_STUDIO_URL,
    });
    const response = await imageStudio.editImages(inputImages);

    expect(response?.reason).toBe(ImageStudioReason.CLOSED);
  },
};

export const EditImages_SaveWhitelisedImageToContentForm: Story = {
  play: async () => {
    const inputImages: SDKImage[] = [
      {
        url: 'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
        name: 'DO-NOT-CHANGE-ME',
      },
    ];
    const imageStudio = new AmplienceImageStudio({
      baseUrl: IMAGE_STUDIO_URL,
    });
    const response = await imageStudio.editImages(inputImages);

    expect(response?.reason).toBe(ImageStudioReason.IMAGE);
    // Aslong as the user doesnt make any changes to the image, expected to receive the same URl back as we submitted to the studio
    expect(response?.image?.url).toBe(
      'https://thumbs.amplience-qa.net/r/53ac8ad8-b4a5-40a2-a613-d10a9ef0c225',
    );
    expect(response?.image?.name).toBe('DO-NOT-CHANGE-ME');
  },
};

export const EditImages_SaveNonWhitelisedImageToContentForm: Story = {
  play: async () => {
    const inputImages: SDKImage[] = [
      {
        url: 'https://www.catster.com/wp-content/uploads/2023/11/orange-cat-riding-a-roomba-or-robotic-vacuum_Sharomka_Shutterstock.jpg.webp',
        name: 'DO-NOT-CHANGE-ME',
      },
    ];
    const imageStudio = new AmplienceImageStudio({
      baseUrl: IMAGE_STUDIO_URL,
    });
    const response = await imageStudio.editImages(inputImages);

    expect(response?.reason).toBe(ImageStudioReason.IMAGE);
    // Aslong as the user doesnt make any changes to the image, expected to receive the same URl back as we submitted to the studio
    expect(response?.image?.url).not.toBe(
      'https://www.catster.com/wp-content/uploads/2023/11/orange-cat-riding-a-roomba-or-robotic-vacuum_Sharomka_Shutterstock.jpg.webp',
    );
    expect(response?.image?.name).toBe('DO-NOT-CHANGE-ME');
  },
};

export const LaunchStandalone: Story = {
  play: async () => {
    const imageStudio = new AmplienceImageStudio({
      baseUrl: IMAGE_STUDIO_URL,
    });
    const response = await imageStudio.launch();
    expect(response?.reason).toBe(ImageStudioReason.CLOSED);
  },
};
