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
