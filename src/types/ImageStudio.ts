/**
 * Reason for promise resolution
 */
export enum ImageStudioReason {
  IMAGE,
  CLOSED,
}

/**
 * Container interface for image representation
 */
export interface SDKImage {
  url: string;
  name: string;
  mimeType: string;
}

/**
 * Image Studio launch response
 */
export type ImageStudioResponse = {
  reason: ImageStudioReason;
  image?: SDKImage;
};
