import { ImageStudioLaunchResponse, SDKEvent, ImageStudioReason, ImageStudioEvent } from "./types";

export type AmplienceImageStudioOptions = {
  baseUrl: string;

  windowTarget?: string;
  windowFeatures?: string;
  modalContainer?: string;
};

export type LaunchImageStudioOptions = {
  srcImageUrl: string;
  srcName: string;
};

export class AmplienceImageStudio {
  constructor(protected options: AmplienceImageStudioOptions) {}

  public launch(
    options: LaunchImageStudioOptions,
  ): Promise<ImageStudioLaunchResponse> {
    const instance = this.createInstance<ImageStudioLaunchResponse>();
    instance.launch(options);
    return instance.promise;
  }

  private createInstance<T>() {
    return new AmplienceImageStudioInstance<T>(this.options);
  }
}

interface MessageData {
  extensionMeta?: boolean;
  srcImageUrl?: string;
  srcImageName?: string;
  focus?: boolean;
}

class AmplienceImageStudioInstance<T> {
  public promise: Promise<T>;
  private _resolve?: (result: T) => void;
  private _reject?: (reason: Error) => void;

  protected imageOptions: LaunchImageStudioOptions | undefined;

  protected isActive = false;
  protected instanceWindow: Window | undefined;

  protected pollingInterval: NodeJS.Timeout | undefined;

  constructor(protected options: AmplienceImageStudioOptions) {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  launch(imageOptions: LaunchImageStudioOptions) {
    const {
      baseUrl,
      windowTarget = '_blank',
      windowFeatures = 'popup=true,status=false,location=false,toolbar=false,menubar=false',
    }: AmplienceImageStudioOptions = this.options;

    const newWindow = window.open(baseUrl, windowTarget, windowFeatures);
    if (!newWindow) {
      this.reject(new Error('Image-Studio failed to launch'));
      return;
    }

    this.instanceWindow = newWindow;
    this.imageOptions = imageOptions;
    newWindow.focus();

    /**
     * Interval to check for a closed image studio
     * When the window is closed, resolve with a CLOSED response
     */
    this.pollingInterval = setInterval(() => {
      if (newWindow.closed) {
        this.resolve({ 
          reason: ImageStudioReason.CLOSED
        } as T);
        this.deactivate();
      }
    }, 100);

    window.addEventListener('message', this.imageStudioMessageListener.bind(this));
  }

  protected imageStudioMessageListener(event: ImageStudioEvent) {
    if (event.data?.exportImageUrl) {
      this.resolve({
        reason: ImageStudioReason.IMAGE,
        url: event.data?.exportImageUrl,
      } as T);
      this.deactivate();
    }

    if (event.data?.connect && !this.isActive) {
      this.isActive = true;
      // on connection, submit the srcImageUrl and extension metadata.
      this.sendSDKEvent({
        extensionMeta: true,
        srcImageUrl: this.imageOptions?.srcImageUrl,
        srcImageName: this.imageOptions?.srcName
      });
    }

    if (event.data.disconnect && this.isActive) {
      this.isActive = false; // window closure is handled by the interval above
    }
  }

  protected sendSDKEvent(messageData: MessageData) {
    if (this.instanceWindow) {
      // process sending messages
      const message: SDKEvent = {};
      if ('extensionMeta' in messageData) {
        message.extensionMeta = {
          exportContext: 'Content Form',
        };
      }

      if ('srcImageUrl' in messageData) {
        message.inputImageUrl = messageData.srcImageUrl;
      }

      if ('srcImageName' in messageData) {
        message.inputImageName = messageData.srcImageName;
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
