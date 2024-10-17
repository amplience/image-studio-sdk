import { SDKImage } from './ImageStudio';

/**
 * Metadata object that is sent to ImageStudio on successful connection
 * Contains configurable image-studio behaviour.
 * All behaviours are optional to reduce the need for breaking changes in future.
 */
export interface SDKMetadata {
  allowImageSave?: boolean;
  allowLogout?: boolean;
  allowCreate?: boolean;
}

/**
 * Interface for Events sent to ImageStudio from the SDK
 */
export interface SDKEvent {
  sdkMetadata?: SDKMetadata;
  inputImages?: SDKImage[];
  focus?: boolean;
}

/**
 * Interface for Events sent to the SDK from ImageStudio
 */
export interface ImageStudioEvent {
  connect?: boolean;
  disconnect?: boolean;
  exportImageInfo?: SDKImage;
}
