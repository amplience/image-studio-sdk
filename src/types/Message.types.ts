export interface SDKEvent {
    extensionMeta?: {
      exportContext: string;
    };
    inputImageUrl?: string;
    focus?: boolean;
  }
  
  export interface ImageStudioEvent {
    data: {
      exportImageUrl?: string;
      connect?: boolean;
      disconnect?: boolean;
    };
  }