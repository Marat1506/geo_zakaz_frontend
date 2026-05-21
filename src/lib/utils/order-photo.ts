/** Normalize camera uploads from mobile browsers before POST /orders */
export function normalizeCarPhotoForUpload(file: File): File {
  const name = file.name || 'car-photo.jpg';
  const hasImageExt = /\.(jpe?g|png|webp|heic|heif)$/i.test(name);
  const mime = file.type?.toLowerCase() ?? '';

  if (mime.startsWith('image/')) {
    return file;
  }

  if (mime === 'application/octet-stream' && hasImageExt) {
    const ext = name.match(/\.(\w+)$/i)?.[1]?.toLowerCase() ?? 'jpg';
    const mapped =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'heic' || ext === 'heif'
            ? 'image/heic'
            : 'image/jpeg';
    return new File([file], name, { type: mapped, lastModified: file.lastModified });
  }

  if (!mime && hasImageExt) {
    return new File([file], name, { type: 'image/jpeg', lastModified: file.lastModified });
  }

  return file;
}
