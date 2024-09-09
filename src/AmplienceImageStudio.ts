import { ApplicationBlockedError } from './errors';
import {
  ImageStudioResponse,
  SDKEvent,
  ImageStudioReason,
  ImageStudioEvent,
  SDKImage,
  SDKMetadata,
} from './types';

export type AmplienceImageStudioOptions = {
  baseUrl: string;

  windowTarget?: string;
  windowFeatures?: string;
};

export class AmplienceImageStudio {
  constructor(protected options: AmplienceImageStudioOptions) {}

  /**
   * launches image studio to edit the images
   * supports sending images back to the SDK and prevents the user from logging out
   * @returns promise containing the studios response on closure
   */
  public editImages(inputImages: SDKImage[]): Promise<ImageStudioResponse> {
    const instance = this.createInstance<ImageStudioResponse>();
    return instance.launch(
      {
        allowImageSave: true,
        allowLogout: false,
      },
      inputImages,
    );
  }

  /**
   * launches image studio standalone
   * does not support sending images back to the SDK and allows the user to logout
   * @returns promise that contains the studios response on closure
   */
  public launch(): Promise<ImageStudioResponse> {
    const instance = this.createInstance<ImageStudioResponse>();
    return instance.launch(
      {
        allowImageSave: false,
        allowLogout: true,
      },
      [],
    );
  }

  private createInstance<T>() {
    return new AmplienceImageStudioInstance<T>(this.options);
  }
}

class AmplienceImageStudioInstance<T> {
  private _resolve?: (result: T) => void;
  private _reject?: (reason: Error) => void;

  private launchProps: {
    sdkMetadata: SDKMetadata;
    inputImages: SDKImage[];
  };

  protected isActive = false;
  protected instanceWindow: Window | undefined;

  protected pollingInterval: number | undefined;

  constructor(protected options: AmplienceImageStudioOptions) {
    this.handleEvent = this.handleEvent.bind(this);
  }

  launch(sdkMetadata: SDKMetadata, inputImages: SDKImage[]): Promise<T> {
    const promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    const { baseUrl, windowTarget = '_blank', windowFeatures } = this.options;

    const newWindow = window.open(baseUrl, windowTarget, windowFeatures);
    if (!newWindow) {
      this.reject(new ApplicationBlockedError());
    } else {
      this.launchProps = {
        sdkMetadata,
        inputImages,
      };

      this.instanceWindow = newWindow;
      window.addEventListener('message', this.handleEvent);
      newWindow.focus();

      /**
       * Interval to check for closure of image studio
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

    // on connection/activation, submit the metadata and any input images.
    const message: SDKEvent = {};
    message.sdkMetadata = this.launchProps.sdkMetadata;
    message.inputImages = this.launchProps.inputImages;
    message.focus = true;

    this.sendSDKEvent(message);
  }

  private handleExportedImage(image: SDKImage) {
    this.resolve({
      reason: ImageStudioReason.IMAGE,
      image,
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
