/**
 * Used to capture the Promise resolution reason
 */
export enum ImageStudioReason {
  IMAGE,
  CLOSED,
}

/**
 * Image Studio launch response
 */
export type ImageStudioLaunchResponse = {
  reason: ImageStudioReason;
  image?: {
    url: string;
    name: string;
  };
};
