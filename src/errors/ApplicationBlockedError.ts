export class ApplicationBlockedError extends Error {
    constructor() {
      super("Application was blocked by the browser");
    }
  }
  