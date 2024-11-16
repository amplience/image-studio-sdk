import { ApplicationBlockedError } from './errors';
import {
  ImageStudioResponse,
  ImageStudioReason,
  ImageStudioEvent,
  SDKImage,
  SDKMetadata,
  ImageStudioEventType,
  SDKEvent,
  SDKEventType,
} from './types';
import {
  ImageSaveEventData,
  ImageStudioEventData,
} from './types/ImageStudioEventData';
import {
  sendLegacySDKEvent,
  translateLegacyImageStudioEvent,
} from './utils/LegacyHelpers';

export type AmplienceImageStudioOptions = {
  domain: string;

  // once set, any options specified will override those in defaultSdkMetadata.
  sdkMetadataOverride?: SDKMetadata;

  windowTarget?: string;
  windowFeatures?: string;
};

export type EventListenerCallback = (data: ImageStudioEventData) => SDKEvent;

export class AmplienceImageStudio {
  private eventListeners: Record<string, EventListenerCallback> = {};
  private defaultMetadata: SDKMetadata = {};

  constructor(protected options: AmplienceImageStudioOptions) {}

  /**
   * Adds an event listener callback
   * @param eventType
   * @param callback
   */
  public withEventListener(
    eventType: ImageStudioEventType,
    callback: EventListenerCallback,
  ): AmplienceImageStudio {
    this.eventListeners[eventType] = callback;
    return this;
  }

  /**
   * Encodes the orgId and sets it in sdkMetadata to be passed to the studio
   * @param orgId - must be decoded plain text string
   * @returns
   */
  public withDecodedOrgId(orgId: string): AmplienceImageStudio {
    this.defaultMetadata.orgId = btoa(`Organization:${orgId}`);
    return this;
  }

  /**
   * Sets the sdkMetadata orgId to be passed to the studio
   * @param orgId - must be Base64 encoded string
   * @returns
   */
  public withEncodedOrgId(orgId: string): AmplienceImageStudio {
    this.defaultMetadata.orgId = orgId;
    return this;
  }

  /**
   * launches image studio to edit the images
   * supports sending images back to the SDK and prevents the user from logging out
   * @returns promise containing the studios response on closure
   */
  public editImages(inputImages: SDKImage[]): Promise<ImageStudioResponse> {
    const instance = this.createInstance<ImageStudioResponse>();
    return instance.launch(
      this.defaultMetadata,
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
      this.defaultMetadata,
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
    return new AmplienceImageStudioInstance<T>(
      this.options,
      this.eventListeners,
    );
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

  private usingLegacyEventFormat: boolean = false;

  constructor(
    protected options: AmplienceImageStudioOptions,
    protected eventListeners: Record<string, EventListenerCallback>,
  ) {
    this.handleEvent = this.handleEvent.bind(this);
  }

  launch(
    defaultSdkMetadata: SDKMetadata,
    actionSdkMetadata: SDKMetadata,
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
        ? {
            ...defaultSdkMetadata,
            ...actionSdkMetadata,
            ...this.options.sdkMetadataOverride,
          }
        : { ...defaultSdkMetadata, ...actionSdkMetadata };

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

  protected handleEvent(event: MessageEvent) {
    if (!(event.data instanceof Object)) {
      return; // any messages without data being an object can be discarded
    }
    // for any events that don't contain the `type` var, these conform to legacy structure.
    let eventData: ImageStudioEvent | null;
    if ('type' in event.data) {
      eventData = event.data as ImageStudioEvent;
    } else {
      eventData = translateLegacyImageStudioEvent((using: boolean) => {
        this.usingLegacyEventFormat = using;
      }, event.data);
    }

    if (eventData?.type) {
      // This listener could receive any sort of message, only accept those with a type we exect
      // Its also still possible to get an eventData object with `type` key inside, so we switch on the ones we care about.
      switch (eventData.type) {
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
          if (!(ImageStudioEventType.ImageSave in this.eventListeners)) {
            // legacy behaviour, only trigger if a user hasnt registered custom logic
            this.handleLegacyExportedImage(
              (eventData.data as ImageSaveEventData).image,
            );
          }
          break;
        default:
          console.log(
            `Event received with unspported ImageStudioEventType: ${eventData.type}`,
          );
          break;
      }

      // If user has registered a callback for this event type, call it.
      if (eventData.type in this.eventListeners) {
        const imageStudioResponse = this.eventListeners[eventData.type]?.(
          eventData.data,
        );
        if (imageStudioResponse) {
          // send a response back to imageStudio, record which event triggered the response
          imageStudioResponse.trigger = eventData.type;
          this.sendSDKEvent(imageStudioResponse);
        } else {
          // we need to store a set of default response types per eventType
        }
      }
    }
  }

  private handleActivate() {
    this.isActive = true;

    this.sendSDKEvent({
      type: SDKEventType.Focus,
      data: {},
    });

    this.sendSDKEvent({
      type: SDKEventType.SDKMetadata,
      data: this.launchProps.sdkMetadata,
    });

    if (this.launchProps.inputImages?.length > 0) {
      this.sendSDKEvent({
        type: SDKEventType.ImageInput,
        data: { images: this.launchProps.inputImages },
      });
    }
  }

  private handleLegacyExportedImage(image: SDKImage) {
    this.resolve({
      reason: ImageStudioReason.IMAGE,
      image,
    } as T);

    // close image-studio once we receive an image
    this.deactivate();
  }

  private sendSDKEvent(event: SDKEvent) {
    if (this.usingLegacyEventFormat) {
      sendLegacySDKEvent(this.instanceWindow, event);
    } else {
      this.instanceWindow?.postMessage(event, '*');
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
