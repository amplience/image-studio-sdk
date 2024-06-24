import { StoryObj, Meta } from "@storybook/html";
import {
  AmplienceImageStudio,
  AmplienceImageStudioOptions,
  GenerateImageOptions,
} from "./AmplienceImageStudio";

const meta = {
  title: "AmplienceImageStudio",
  tags: ["autodocs"],
  render: (args) => {
    const imageStudio = new AmplienceImageStudio(args.options);
    const launch = document.createElement("button");
    launch.innerText = "Launch";
    launch.onclick = async () => {
      imageStudio.getImage(args.getImage).then(
        (result) => {
          console.log(`resolved: `, result);
        },
        (error) => {
          console.log(`rejected: `, error);
        }
      );
    };
    return launch;
  },
  argTypes: {},
} satisfies Meta<{
  options: AmplienceImageStudioOptions;
  getImage: GenerateImageOptions;
}>;

export default meta;
type Story = StoryObj<{
  options: AmplienceImageStudioOptions;
  getImage: GenerateImageOptions;
}>;

export const Default: Story = {
  args: {
    options: {
      baseUrl: "http://localhost:5173/image-studio/",
    },
    getImage: {
      srcImageUrl:
        "https://temp-file-upload.amplience-qa.net/1e6f8ee1-00bb-44c7-a683-f4c64b7b604e",
    },
  },
};
