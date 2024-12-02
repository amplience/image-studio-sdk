import { ImageStudioEventType } from './ImageStudioEventType';
import { SDKEventData } from './SdkEventData';
import { SDKEventType } from './SdkEventType';
import { SDKImage } from './SdkImage';
import { SDKMetadata } from './SdkMetadata';

/**
 * Interface for Events sent to ImageStudio from the SDK
 */
export interface SDKEvent {
  /**
   * SDK Event Type
   */
  type: SDKEventType;

  /**
   * SDK Event Data
   */
  data: SDKEventData;

  /**
   * Image Studio Event that Triggered this Event
   */
  trigger?: ImageStudioEventType;
}

/**
 * @deprecated
 * Legacy Interface for Events sent to ImageStudio from the SDK
 */
export interface LegacySDKEvent {
  sdkMetadata?: SDKMetadata;
  inputImages?: SDKImage[];
  focus?: boolean;
}
