import { StoryObj, Meta } from '@storybook/html';
import { expect } from '@storybook/test';
import { FetchProvider, FileService, FileServiceResponse } from '@amplience/gql-ai-sdk';
import {
  AmplienceImageStudio,
  AmplienceImageStudioOptions,
  LaunchImageStudioOptions,
} from '../AmplienceImageStudio';
import { ImageStudioReason } from '../types';

interface AmplienceImageStudioProps {
  imageUrl: string;
  provider: {
    token: string;
    serviceUrl: string;
  }
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
    provider: {
      token: 'Bearer-Token-Here',
      serviceUrl: 'https://graphql-gateway.amplience-qa.net/graphql',
    },
    imageUrl:
      'https://thumbs.amplience-qa.net/r/a124da68-5b5d-46a7-94dc-13a4c45976f8',
    imageName: 'TestImageName',
    options: {
      baseUrl: 'https://qa-mandelbrot-image-studio.amplience-qa.net/image-studio/',
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
      const fetchProvider = new FetchProvider(args.provider.serviceUrl).withToken(args.provider.token)
      const fileService = new FileService(fetchProvider);
      const tempFileResponse: FileServiceResponse = await fileService.createTempFromUrl(
        args.imageUrl,
      );
      const launchOptions: LaunchImageStudioOptions = {
        image: {
          url: tempFileResponse?.url,
          name: args.imageName,
        }
      };
      imageStudio.launch(launchOptions).then(
        (result) => {
          switch(result?.reason) {
            case ImageStudioReason.IMAGE:
              if(result?.image) {
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

export const CloseWithoutSendingImage: Story = {
  play: async () => {
    const fetchProvider = new FetchProvider('https://graphql-gateway.amplience-qa.net/graphql').withToken('Bearer-Token-Here')
    const fileService = new FileService(fetchProvider);
    const tempFileResponse: FileServiceResponse = await fileService.createTempFromUrl('https://thumbs.amplience-qa.net/r/a124da68-5b5d-46a7-94dc-13a4c45976f8');
    const getImageOptions: LaunchImageStudioOptions = {
      image: {
        url: tempFileResponse?.url,
        name: 'TestImageName'
      }
    };
    const imageStudio = new AmplienceImageStudio({
      baseUrl: 'https://qa-mandelbrot-image-studio.amplience-qa.net/image-studio/',
    });
    const response = await imageStudio.launch(getImageOptions);

    expect(response?.reason).toBe(ImageStudioReason.CLOSED);
  },
};

export const SaveImageToContentForm: Story = {
  play: async () => {
    const fetchProvider = new FetchProvider('https://graphql-gateway.amplience-qa.net/graphql').withToken('Bearer-Token-Here')
    const fileService = new FileService(fetchProvider);
    const tempFileResponse: FileServiceResponse = await fileService.createTempFromUrl('https://thumbs.amplience-qa.net/r/a124da68-5b5d-46a7-94dc-13a4c45976f8');
    const getImageOptions: LaunchImageStudioOptions = {
      image: {
        url: tempFileResponse?.url,
        name: 'DO-NOT-CHANGE-ME'
      }
    };
    const imageStudio = new AmplienceImageStudio({
      baseUrl: 'https://qa-mandelbrot-image-studio.amplience-qa.net/image-studio/',
    });
    const response = await imageStudio.launch(getImageOptions);

    expect(response?.reason).toBe(ImageStudioReason.IMAGE);
    expect(response?.image?.url).not.toBe(tempFileResponse?.url);
    expect(response?.image?.name).toBe('DO-NOT-CHANGE-ME');
  },
};
