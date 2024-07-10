import { StoryObj, Meta } from "@storybook/html";
import { FileService } from "@amplience/gql-ai-sdk";
import {
  AmplienceImageStudio,
  AmplienceImageStudioOptions,
  GenerateImageOptions,
} from "../AmplienceImageStudio";

interface AmplienceImageStudioProps {
  token: string,
  serviceUrl: string,
  imageUrl: string,
  options: AmplienceImageStudioOptions;
}

const meta: Meta<AmplienceImageStudioProps> = {
  title: "Amplience Image Studio",
  tags: ["autodocs"],
  render: (args) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';

    const imageStudio = new AmplienceImageStudio(args.options);
    const launch = document.createElement("button");
    launch.innerText = "Launch";
    launch.onclick = async () => {
      const fileService = new FileService(args.serviceUrl).withToken(args.token);
      const tempFileResponse = await fileService.createTempFromUrl(args.imageUrl);
      const getImageOptions: GenerateImageOptions = {
        srcImageUrl: tempFileResponse?.url
      }
      imageStudio.getImage(getImageOptions).then(
        (result) => {
          if(result.url) {
            text.nodeValue = result.url;
          } else {
            text.nodeValue = "Closed without Image";
          }
        },
        (error) => {
          text.nodeValue = `Failed with error: ${error}`;
        }
      );
    };
    wrapper.appendChild(launch);

    const text = document.createTextNode('');
    wrapper.appendChild(text);
    return wrapper;

  },
  argTypes: {},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    token: 'Bearer-Token-Here',
    serviceUrl: 'https://graphql-gateway.amplience-qa.net/graphql',
    imageUrl: 'https://thumbs.amplience-qa.net/r/a124da68-5b5d-46a7-94dc-13a4c45976f8',
    options: {
      baseUrl: "https://app.amplience-qa.net/image-studio/",
    }
  },
};
