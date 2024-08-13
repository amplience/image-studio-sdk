/**
 * Used to capture the Promise resolution reason
 */
export enum ImageStudioReason {
  IMAGE,
  CLOSED,
}

export type ImageResponse = {
  url: string;
  name: string;
}

/**
 * Image Studio launch response
 */
export type ImageStudioLaunchResponse = {
  reason: ImageStudioReason;
  image?: ImageResponse;
};
