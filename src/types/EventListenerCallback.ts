import { ImageStudioEventData } from './ImageStudioEventData';
import { ImageStudioEventType } from './ImageStudioEventType';
import { SDKEventType } from './SdkEventType';

/**
 * Callback function definition for Event Listeners
 * @param data The Event Data object that was sent from Image Studio for this event.
 * @returns a valid SDKEventType, or null to signify submitting the default configured response
 */
export type EventListenerCallback = (
  data: ImageStudioEventData,
) => Promise<SDKEventType | null>;

/**
 * Interface for defining SDK response expectations
 * @param default dictates the default SDKEventType to send to image-studio, a special null denotes we should not submit a response to image-studio.
 * @param valid list of valid response types we can accept from custom callbacks.
 */
export interface EventListenerCallbackConfig {
  defaultResponse: SDKEventType | null;
  validResponses: SDKEventType[];
}

/**
 * event listener callback configurations,
 * undefined configurations denote no configuration, and therefore the user cannot create their own custom callbacks.
 */
export const eventListenerCallbackConfig: Record<
  ImageStudioEventType,
  EventListenerCallbackConfig | undefined
> = {
  // BEGIN Intentionally undefined
  [ImageStudioEventType.Connect]: undefined,
  [ImageStudioEventType.Disconnect]: undefined,
  // END Intentionally undefined

  [ImageStudioEventType.ImageSave]: {
    defaultResponse: SDKEventType.Success,
    validResponses: [SDKEventType.Success, SDKEventType.Fail],
  },
};
