export interface SDKImage {
  url: string;
  name: string;
}

export interface SDKMetadata {
  allowImageSave: boolean;
  allowLogout: boolean;
}

export interface SDKEvent {
  sdkMetadata?: SDKMetadata;
  inputImages?: SDKImage[];
  focus?: boolean;
}

export interface ImageStudioEvent {
  connect?: boolean;
  disconnect?: boolean;
  exportImageInfo?: SDKImage;
}
