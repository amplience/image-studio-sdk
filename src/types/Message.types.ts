export interface SDKEvent {
    extensionMeta?: {
      exportContext: string;
    };
    inputImageUrl?: string;
    inputImageName?: string;
    focus?: boolean;
  }
  
  export interface ImageStudioEvent {
    data: {
      connect?: boolean;
      disconnect?: boolean;
      exportImageInfo?: {
        newImageUrl: string;
        newImageName: string;
      }
    };
  }