import { ApplicationBlockedError } from "./errors";
import { ImageStudioLaunchResponse, SDKEvent, ImageStudioReason, ImageStudioEvent, ImageExport } from "./types";

export type AmplienceImageStudioOptions = {
  baseUrl: string;

  windowTarget?: string;
  windowFeatures?: string;
};

export type LaunchImageStudioOptions = {
  image: {
    url: string;
    name: string;
  }  
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

  protected launchOptions: LaunchImageStudioOptions | undefined;

  protected isActive = false;
  protected instanceWindow: Window | undefined;

  protected pollingInterval: number | undefined;

  constructor(protected options: AmplienceImageStudioOptions) {
    this.handleEvent = this.handleEvent.bind(this);
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  launch(launchOptions: LaunchImageStudioOptions) {
    this.launchOptions = launchOptions;    

    const {
      baseUrl,
      windowTarget = '_blank',
      windowFeatures,
    } = this.options;

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
            reason: ImageStudioReason.CLOSED
          } as T);
        }
      }, 100);
    }    
  }

  protected handleEvent(event: ImageStudioEvent) {
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
    message.extensionMeta = {
      exportContext: 'Content Form',
    };
    message.inputImageUrl = this.launchOptions?.image.url;
    message.inputImageName = this.launchOptions?.image.name;
    message.focus = true;
    
    this.sendSDKEvent(message);
  }

  private handleExportedImage(imageExport: ImageExport) {
    this.resolve({
      reason: ImageStudioReason.IMAGE,
      image: {
        url: imageExport.newImageUrl,
        name: imageExport.newImageName,
      }
    } as T);

    // close image-studio once we receive an image
    this.deactivate();
  }

  protected sendSDKEvent(event: SDKEvent) {
    if (this.instanceWindow) {
      this.instanceWindow.postMessage(event, this.options.baseUrl);
    }
  }

  deactivate() {
    window.removeEventListener("message", this.handleEvent);
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
