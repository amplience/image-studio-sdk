export interface SDKImage {
  url: string;
  name: string;
}

export interface SDKEvent {
  extensionMeta?: {
    exportContext: string;
  };
  inputImages?: SDKImage[];
  focus?: boolean;
}

export interface ImageStudioEvent {
  connect?: boolean;
  disconnect?: boolean;
  exportImageInfo?: SDKImage;
}
