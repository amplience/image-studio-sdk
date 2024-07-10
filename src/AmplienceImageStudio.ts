export type AmplienceImageStudioOptions = {
  baseUrl: string;

  windowTarget?: string;
  windowFeatures?: string;
  modalContainer?: string;
};

export type GenerateImageOptions = {
  srcImageUrl: string;
};

export type GenerateImageResponse = {
  url: string | null;
};

interface WindowMessageDataOut {
  extensionMeta?: {
    exportContext: string;
  };
  inputImageUrl?: string;
  focus?: boolean;
}

interface WindowMessageDataIn {
  data: {
    exportImageUrl?: string;
    connect?: boolean;
    disconnect?: boolean;
  };
}

export class AmplienceImageStudio {
  constructor(protected options: AmplienceImageStudioOptions) {}

  public getImage(
    options: GenerateImageOptions,
  ): Promise<GenerateImageResponse> {
    const instance = this.createInstance<GenerateImageResponse>();
    instance.activate(options);
    return instance.promise;
  }

  public getFileExtensionFromMimeType = (
    mimeType: string | null,
  ): string | undefined => {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/bmp':
        return 'bmp';
      case 'image/gif':
        return 'gif';
      case 'image/tiff':
        return 'tif';
      case 'image/webp':
        return 'webp';
      case 'image/jp2':
        return 'jp2';
      case 'image/avif':
        return 'avif';
      default:
        return undefined;
    }
  };

  private createInstance<T = unknown>() {
    return new AmplienceImageStudioInstance<T>(this.options);
  }
}

interface MessageData {
  extensionMeta?: boolean;
  srcImageUrl?: string;
  focus?: boolean;
}

class AmplienceImageStudioInstance<T = unknown> {
  public promise: Promise<T>;
  private _resolve?: (result: T) => void;
  private _reject?: (reason: Error) => void;

  protected imageOptions: GenerateImageOptions | undefined;

  protected isActive = false;
  protected instanceWindow: Window | undefined;

  protected pollingInterval: NodeJS.Timeout | undefined;

  constructor(protected options: AmplienceImageStudioOptions) {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  activate(imageOptions: GenerateImageOptions) {
    const {
      baseUrl,
      windowTarget = '_blank',
      windowFeatures = 'popup=true,status=false,location=false,toolbar=false,menubar=false',
    }: AmplienceImageStudioOptions = this.options;

    const newWindow = window.open(baseUrl, windowTarget, windowFeatures);
    if (!newWindow) {
      this.reject('Image-Studio failed to launch');
      return;
    }

    this.instanceWindow = newWindow;
    this.imageOptions = imageOptions;
    newWindow.focus();

    /**
     * Interval to check for a closed image studio
     * When the window is closed, resolve with a null url
     */
    this.pollingInterval = setInterval(() => {
      if (newWindow.closed) {
        this.resolve({ url: null } as T);
        this.deactivate();
      }
    }, 100);

    window.addEventListener('message', this.listener.bind(this));
  }

  protected listener(event: WindowMessageDataIn) {
    if (event.data?.exportImageUrl) {
      this.resolve({
        url: event.data?.exportImageUrl,
      } as T);
      this.deactivate();
    }

    if (event.data?.connect && !this.isActive) {
      this.isActive = true;
      // on connection, submit the srcImageUrl and extension metadata.
      this.sendWindowMessages({
        extensionMeta: true,
        srcImageUrl: this.imageOptions?.srcImageUrl,
      });
    }

    if (event.data.disconnect && this.isActive) {
      this.isActive = false; // window closure is handled by the interval above
    }
  }

  protected sendWindowMessages(messageData: MessageData) {
    if (this.instanceWindow) {
      // process sending messages
      const message: WindowMessageDataOut = {};
      if ('extensionMeta' in messageData) {
        message.extensionMeta = {
          exportContext: 'Content Form',
        };
      }

      if ('srcImageUrl' in messageData) {
        message.inputImageUrl = messageData.srcImageUrl;
      }

      if ('focus' in messageData) {
        message.focus = true;
      }

      this.instanceWindow.postMessage(message, this.options.baseUrl);
    }
  }

  deactivate() {
    if (this.instanceWindow) {
      this.instanceWindow.close();
    }
    clearInterval(this.pollingInterval);
  }

  protected resolve(value: T) {
    this._resolve && this._resolve(value);
    this._resolve = undefined;
    this._reject = undefined;
  }

  protected reject(reason: Error) {
    this._reject && this._reject(reason);
    this._resolve = undefined;
    this._reject = undefined;
  }
}
