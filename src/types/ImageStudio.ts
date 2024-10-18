import { SDKImage } from './SdkImage';

/**
 * Reason for promise resolution
 */
export enum ImageStudioReason {
  IMAGE,
  CLOSED,
}

/**
 * Image Studio launch response
 */
export type ImageStudioResponse = {
  reason: ImageStudioReason;
  image?: SDKImage;
};
