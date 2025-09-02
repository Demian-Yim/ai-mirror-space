export interface Style {
    id: string;
    name: string;
    icon: string;
}

export interface GeneratedMedia {
    id: number;
    type: 'image' | 'video';
    src: string; // dataURL for image, blobURL for video
    prompt: string;
    mimeType: string;
}

export interface AspectRatio {
    id: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    name: string;
    icon: string;
}

export interface AppMessage {
    text: string;
    type: 'error' | 'warning' | 'info';
}
