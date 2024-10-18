import { ApplicationBlockedError } from './errors';
import {
  ImageStudioResponse,
  SDKEvent,
  ImageStudioReason,
  ImageStudioEvent,
  SDKImage,
  SDKMetadata,
  ImageStudioEventType,
} from './types';
import { ImageSaveEventData } from './types/ImageStudioEventData';

export type AmplienceImageStudioOptions = {
  domain: string;

  // once set, any options specified will override those in defaultSdkMetadata.
  sdkMetadataOverride?: SDKMetadata;

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
        allowCreate: false,
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
        allowCreate: true,
      },
      [],
      'create',
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
    imageStudioUrl: string;
    sdkMetadata: SDKMetadata;
    inputImages: SDKImage[];
  };

  protected isActive = false;
  protected instanceWindow: Window | undefined;

  protected pollingInterval: number | undefined;

  constructor(protected options: AmplienceImageStudioOptions) {
    this.handleEvent = this.handleEvent.bind(this);
  }

  launch(
    defaultSdkMetadata: SDKMetadata,
    inputImages: SDKImage[],
    route: string = '',
  ): Promise<T> {
    const promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    const { domain, windowTarget = '_blank', windowFeatures } = this.options;

    const imageStudioUrl =
      route && route.trim().length > 0
        ? `${domain}/image-studio/${route.trim()}`
        : `${domain}/image-studio`;

    const newWindow = window.open(imageStudioUrl, windowTarget, windowFeatures);
    if (!newWindow) {
      this.reject(new ApplicationBlockedError());
    } else {
      // If the user specified sdkMetadataOverride in their AmplienceImageStudioOptions, merge with the defaults and prioritze the overridden options.
      // SDKMetadata contains optional parameters, so both arrays might not contain everything. ImageStudio should cope with partial options being sent.
      const sdkMetadata: SDKMetadata = this.options?.sdkMetadataOverride
        ? { ...defaultSdkMetadata, ...this.options.sdkMetadataOverride }
        : defaultSdkMetadata;

      this.launchProps = {
        imageStudioUrl,
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

  /**
   * Legacy translation layer to allow older versions of Image-Studio to work with newer SDK.
   * This code can be removed once v1.5.0 of image-studio has been released.
   * @param event
   */
  private translateLegacyImageStudioEvent(event: { data: ImageStudioEvent }) {
    console.warn('[LEGACY] An old version of Image Studio is being used');

    if (event.data?.connect) {
      event.data.type = ImageStudioEventType.Connect;
    }

    if (event.data?.disconnect) {
      event.data.type = ImageStudioEventType.Disconnect;
    }

    if (event.data?.exportImageInfo) {
      event.data.type = ImageStudioEventType.ImageSave;
      event.data.data = { image: event.data.exportImageInfo };
    }
  }

  protected handleEvent(event: { data: ImageStudioEvent }) {
    if (event.data && !('type' in event.data)) {
      // for any events that don't contain the `type` var, these conform to legacy structure.
      this.translateLegacyImageStudioEvent(event);
    }

    switch (event.data?.type) {
      case ImageStudioEventType.Connect:
        if (!this.isActive) {
          this.handleActivate();
        }
        break;
      case ImageStudioEventType.Disconnect:
        if (this.isActive) {
          this.isActive = false; // window closure is handled by the interval above
        }
        break;
      case ImageStudioEventType.ImageSave:
        if ((event.data?.data as ImageSaveEventData)?.image) {
          this.handleExportedImage(
            (event.data?.data as ImageSaveEventData).image,
          );
        }
        break;
      default:
        console.log(
          `Event received with unspported ImageStudioEventType: ${event.data?.type}`,
        );
        break;
    }
  }

  private handleActivate() {
    this.isActive = true;

    // on connection/activation, submit the metadata and any input images.
    const message: SDKEvent = {};
    message.focus = true;
    message.sdkMetadata = this.launchProps.sdkMetadata;

    if (this.launchProps.inputImages?.length > 0) {
      message.inputImages = this.launchProps.inputImages;
    }

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
      this.instanceWindow.postMessage(event, '*');
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
