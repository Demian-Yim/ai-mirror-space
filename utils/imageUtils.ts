export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const getMimeType = (file: File): string => {
    return file.type || 'image/png';
};

export const dataUrlToFile = async (dataUrl: string, fileName: string, mimeType?: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const finalMimeType = mimeType || blob.type;
    return new File([blob], fileName, { type: finalMimeType });
};
