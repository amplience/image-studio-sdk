import {
  ImageStudioEvent,
  ImageStudioEventType,
  LegacySDKEvent,
  SDKEvent,
  SDKEventType,
  SDKImageInputEventData,
  SDKMetadata,
} from '../types';

/**
 * translates LegacyImageStudioEvents to ImageStudioEvent
 *
 * @param data should be of type LegacyImageStudioEvent, but could also be any object
 * @returns translated event, otherwise undefined signifies something we don't understand and therefore should not process
 */
export const translateLegacyImageStudioEvent = (
  setUsingLegacyEventFormat: (param: boolean) => void,
  eventData?: Record<string, never>,
): ImageStudioEvent | null => {
  // We cannot be sure of the object we receive as eventData, so look for the keys we're interested in
  if (eventData?.connect) {
    /**
     * To maintain backwards compatability, newer versions of the studio will send both NEW and Legacy message formats for `connect` only
     * Newer studios will hint that they use the newEventFormat, therefore older studios won't send this key in the object.
     * */
    if (eventData?.newEventFormat) {
      // For newer studios supporting the new event format, we should process the new message (Sent seperately), not this duplicate 'legacy' message.
      setUsingLegacyEventFormat(false);
      return null;
    } else {
      // If there is no indicator on this message, we must process it to preserve backwards compatability.
      setUsingLegacyEventFormat(true);
      console.warn('[LEGACY] translating connect message');
      return {
        type: ImageStudioEventType.Connect,
        data: {},
      };
    }
  }

  if (eventData?.disconnect) {
    console.warn('[LEGACY] translating disconnect message');
    return {
      type: ImageStudioEventType.Disconnect,
      data: {},
    };
  }

  if (eventData?.exportImageInfo) {
    console.warn('[LEGACY] translating exportImageInfo message');
    return {
      type: ImageStudioEventType.ImageSave,
      data: { image: eventData.exportImageInfo },
    };
  }

  console.warn(`[LEGACY] unknown message during translation: ${eventData}`);
  return null;
};

/**
 * Maintains backwards compatability with older Image-Studio versions
 */
export const sendLegacySDKEvent = (
  instanceWindow: Window | undefined,
  event: SDKEvent,
) => {
  if (instanceWindow) {
    switch (event.type) {
      case SDKEventType.Focus:
        console.warn(
          `[LEGACY] sending backwards compatible studio event for type: ${event.type}`,
        );
        instanceWindow.postMessage({ focus: true } as LegacySDKEvent, '*');
        break;
      case SDKEventType.SDKMetadata:
        console.warn(
          `[LEGACY] sending backwards compatible studio event for type: ${event.type}`,
        );
        instanceWindow.postMessage(
          { sdkMetadata: event.data as SDKMetadata } as LegacySDKEvent,
          '*',
        );
        break;
      case SDKEventType.ImageInput:
        console.warn(
          `[LEGACY] sending backwards compatible studio event for type: ${event.type}`,
        );
        instanceWindow.postMessage(
          {
            inputImages: (event.data as SDKImageInputEventData).images,
          } as LegacySDKEvent,
          '*',
        );
        break;
      default:
        console.warn(
          `[LEGACY] Potential broken functionality whilst using old image-studio for event with type: ${event.type}`,
        );
        break;
    }
  }
};
