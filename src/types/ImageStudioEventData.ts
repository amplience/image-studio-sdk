import { SDKImage } from './SdkImage';

export interface ImageSaveEventData {
  image: SDKImage;
}

// intended to be a union type of the above interfaces, otherwise an empty Record (object)
export type ImageStudioEventData = ImageSaveEventData | Record<string, never>;
