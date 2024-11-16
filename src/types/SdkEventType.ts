/**
 * String Enumerated list of SDK Event Types
 * These events are transmitted from SDK -> ImageStudio
 * This list is not exhaustive, and will grow over time
 *
 * Using String ENUMS reduces breaking changes in future,
 * allowing for addition, deletion and re-ordering without consequence.
 *
 * These values are serialized/deserialized across post messages
 * renaming will cause problems, and should be avoided.
 * You are encouraged to migrate to a new ENUM to enforrce backwards comatability.
 */
export enum SDKEventType {
  Unknown = 'UNKNOWN', //data: {}
  Focus = 'FOCUS', //data: {}
  SDKMetadata = 'SDKMETADATA', //data: SDKMetadata
  ImageInput = 'IMAGE_INPUT', //data: SDKImageInputEventData

  // NoCallback = 'NO_CALLBACK',
  Success = 'SUCCESS', //data: {}
  Fail = 'FAIL', //data: {}
}
