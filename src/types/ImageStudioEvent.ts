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
 * Legacy Interface for Events sent to the SDK from ImageStudio
 */
export interface LegacyImageStudioEvent {
  connect?: boolean;
  disconnect?: boolean;
  exportImageInfo?: SDKImage;
}
