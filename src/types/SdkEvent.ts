import { SDKImage } from './SdkImage';
import { SDKMetadata } from './SdkMetadata';

/**
 * Interface for Events sent to ImageStudio from the SDK
 */
export interface SDKEvent {
  sdkMetadata?: SDKMetadata;
  inputImages?: SDKImage[];
  focus?: boolean;
}
