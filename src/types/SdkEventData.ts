import { SDKImage } from './SdkImage';
import { SDKMetadata } from './SdkMetadata';

export interface SDKImageInputEventData {
  images: SDKImage[];
}

// intended to be a union type of the above interfaces, otherwise an empty Record (object)
export type SDKEventData =
  | SDKImageInputEventData
  | SDKMetadata
  | Record<string, never>;
