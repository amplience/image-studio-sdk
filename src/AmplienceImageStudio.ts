import { ApplicationBlockedError } from './errors';
import {
  ImageStudioResponse,
  SDKEvent,
  ImageStudioReason,
  ImageStudioEvent,
  SDKImage,
} from './types';

export type AmplienceImageStudioOptions = {
  baseUrl: string;

  windowTarget?: string;
  windowFeatures?: string;
};

export class AmplienceImageStudio {
  constructor(protected options: AmplienceImageStudioOptions) {}

  public editImages(inputImages: SDKImage[]): Promise<ImageStudioResponse> {
    const instance = this.createInstance<ImageStudioResponse>();
    return instance.launch(inputImages);
  }

  public launch(): Promise<ImageStudioResponse> {
    const instance = this.createInstance<ImageStudioResponse>();
    return instance.launch();
  }

  private createInstance<T>() {
    return new AmplienceImageStudioInstance<T>(this.options);
  }
}

class AmplienceImageStudioInstance<T> {
  private _resolve?: (result: T) => void;
  private _reject?: (reason: Error) => void;

  protected inputImages?: SDKImage[] | undefined;

  protected isActive = false;
  protected instanceWindow: Window | undefined;

  protected pollingInterval: number | undefined;

  constructor(protected options: AmplienceImageStudioOptions) {
    this.handleEvent = this.handleEvent.bind(this);
  }

  launch(inputImages?: SDKImage[]): Promise<T> {
    const promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    const { baseUrl, windowTarget = '_blank', windowFeatures } = this.options;

    const newWindow = window.open(baseUrl, windowTarget, windowFeatures);
    if (!newWindow) {
      this.reject(new ApplicationBlockedError());
    } else {
      this.instanceWindow = newWindow;
      window.addEventListener('message', this.handleEvent);
      newWindow.focus();

      /**
       * Interval to check for a closed image studio
       * When the window is closed, resolve with a CLOSED response
       */
      this.pollingInterval = window.setInterval(() => {
        if (newWindow.closed) {
          this.deactivate();
          this.resolve({
            reason: ImageStudioReason.CLOSED,
          } as T);
        }
      }, 100);

      this.inputImages = inputImages;
    }

    return promise;
  }

  protected handleEvent(event: { data: ImageStudioEvent }) {
    if (event.data?.exportImageInfo) {
      this.handleExportedImage(event.data?.exportImageInfo);
    }

    if (event.data?.connect && !this.isActive) {
      this.handleActivate();
    }

    if (event.data.disconnect && this.isActive) {
      this.isActive = false; // window closure is handled by the interval above
    }
  }

  private handleActivate() {
    this.isActive = true;

    // on connection/activation, submit the activation message.
    const message: SDKEvent = {};
    message.sdkMetadata = {
      allowImageSave: true,
      allowLogout: false,
    };
    message.inputImages = this.inputImages;
    message.focus = true;

    this.sendSDKEvent(message);
  }

  private handleExportedImage(image: SDKImage) {
    this.resolve({
      reason: ImageStudioReason.IMAGE,
      image: {
        url: image.url,
        name: image.name,
      },
    } as T);

    // close image-studio once we receive an image
    this.deactivate();
  }

  private sendSDKEvent(event: SDKEvent) {
    if (this.instanceWindow) {
      this.instanceWindow.postMessage(event, this.options.baseUrl);
    }
  }

  deactivate() {
    window.removeEventListener('message', this.handleEvent);
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
