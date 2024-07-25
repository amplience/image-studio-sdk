export const getFileExtensionFromMimeType = (
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