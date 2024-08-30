/**
 * Reason for promise resolution
 */
export enum ImageStudioReason {
  IMAGE,
  CLOSED,
}

/**
 * container interface for image representation
 */
export interface SDKImage {
  url: string;
  name: string;
}

/**
 * Image Studio launch response
 */
export type ImageStudioResponse = {
  reason: ImageStudioReason;
  image?: SDKImage;
};
