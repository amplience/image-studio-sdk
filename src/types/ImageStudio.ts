import { SDKImage } from './SdkImage';

/**
 * @deprecated
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
  /**
   * @deprecated
   */
  reason?: ImageStudioReason;

  /**
   * @deprecated
   */
  image?: SDKImage;
};
