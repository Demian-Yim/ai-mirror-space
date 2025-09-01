
export interface Style {
    id: string;
    name: string;
    icon: string;
}

export interface GeneratedImage {
    id: number;
    src: string;
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
