export interface SDKEvent {
    extensionMeta?: {
      exportContext: string;
    };
    inputImageUrl?: string;
    inputImageName?: string;
    focus?: boolean;
  }
  
  export interface ImageExport {
      newImageUrl: string;
      newImageName: string;
  }

  export interface ImageStudioEvent {
    data: {
      connect?: boolean;
      disconnect?: boolean;
      exportImageInfo?: ImageExport
    };
  }