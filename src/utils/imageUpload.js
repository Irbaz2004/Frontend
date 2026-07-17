export const MAX_UPLOAD_IMAGE_BYTES = 100 * 1024;
export const MAX_UPLOAD_IMAGE_DIMENSION = 1400;

export const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes)) return '0 KB';
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const getCompressedFileName = (fileName, mimeType) => {
    const baseName = (fileName || 'image').replace(/\.[^.]+$/, '');
    const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';
    return `${baseName}-compressed.${extension}`;
};

const loadImageFromFile = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Unable to read selected image'));
    };
    img.src = url;
});

const canvasToBlob = (canvas, mimeType, quality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Unable to compress selected image'));
    }, mimeType, quality);
});

export async function compressImageForUpload(file, maxBytes = MAX_UPLOAD_IMAGE_BYTES) {
    if (!(file instanceof File) || !file.type.startsWith('image/')) return file;
    if (file.size <= maxBytes) return file;

    const sourceImage = await loadImageFromFile(file);
    const outputType = 'image/jpeg';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) throw new Error('Image compression is not supported on this device');

    const largestSide = Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight);
    let scale = Math.min(1, MAX_UPLOAD_IMAGE_DIMENSION / largestSide);
    let bestBlob = null;

    for (let resizeAttempt = 0; resizeAttempt < 8; resizeAttempt++) {
        canvas.width = Math.max(1, Math.round(sourceImage.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(sourceImage.naturalHeight * scale));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

        for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42, 0.34, 0.28, 0.22]) {
            const blob = await canvasToBlob(canvas, outputType, quality);
            bestBlob = !bestBlob || blob.size < bestBlob.size ? blob : bestBlob;
            if (blob.size <= maxBytes) {
                return new File([blob], getCompressedFileName(file.name, outputType), {
                    type: outputType,
                    lastModified: Date.now(),
                });
            }
        }

        scale *= 0.82;
    }

    if (bestBlob && bestBlob.size <= maxBytes) {
        return new File([bestBlob], getCompressedFileName(file.name, outputType), {
            type: outputType,
            lastModified: Date.now(),
        });
    }

    throw new Error(`Could not compress image below ${formatFileSize(maxBytes)}. Please choose a smaller image.`);
}

export function openImagePicker(onFile) {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;z-index:-1;';
        document.body.appendChild(input);

        let handled = false;

        const cleanup = () => {
            try { document.body.removeChild(input); } catch { }
        };

        const handleChange = async (e) => {
            if (handled) return;
            const file = e.target.files?.[0];
            if (file) {
                handled = true;
                try {
                    const compressedFile = await compressImageForUpload(file);
                    const url = URL.createObjectURL(compressedFile);
                    const meta = {
                        compressed: compressedFile !== file,
                        originalSize: file.size,
                        finalSize: compressedFile.size,
                    };
                    onFile(compressedFile, url, meta);
                    resolve({ file: compressedFile, url, ...meta });
                } catch (error) {
                    reject(error);
                }
            }
            cleanup();
        };

        input.addEventListener('change', handleChange);
        input.addEventListener('input', handleChange);

        window.addEventListener('focus', function onFocus() {
            window.removeEventListener('focus', onFocus);
            setTimeout(() => {
                if (!handled) {
                    cleanup();
                    resolve(null);
                }
            }, 500);
        }, { once: true });

        setTimeout(() => {
            try { input.click(); } catch {
                input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
        }, 50);
    });
}
