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
      exportImageUrl?: string;
      connect?: boolean;
      disconnect?: boolean;
    };
  }