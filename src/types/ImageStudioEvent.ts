import { ImageStudioEventData } from './ImageStudioEventData';
import { ImageStudioEventType } from './ImageStudioEventType';
import { SDKImage } from './SdkImage';

/**
 * Interface for Events sent to the SDK from ImageStudio
 */
export interface ImageStudioEvent {
  /**
   * Event Type
   */
  type: ImageStudioEventType;

  /**
   * Event Data
   */
  data: ImageStudioEventData;
}

/**
 * @deprecated
 * Legacy Interface for Events sent to the SDK from ImageStudio
 */
export interface LegacyImageStudioEvent {
  connect?: boolean;
  disconnect?: boolean;
  exportImageInfo?: SDKImage;

  /** new optional param so we can explicitly distinguish whether the studio supports new messages.
   * The SDK will listen for this on connection
   */
  newEventFormat?: boolean;
}
