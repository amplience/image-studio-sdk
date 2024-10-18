import { ImageStudioEventType } from './ImageStudioEventType';
import { SDKImage } from './SdkImage';

/**
 * Interface for Events sent to the SDK from ImageStudio
 */
export interface ImageStudioEvent {
  /**
   * Event Type
   * undefined signifies legacy vars will exist
   */
  type: ImageStudioEventType;

  /**
   * Event Data
   */
  data?: unknown;

  // BEGIN Legacy vars
  connect?: boolean;
  disconnect?: boolean;
  exportImageInfo?: SDKImage;
  // END Legacy vars
}
