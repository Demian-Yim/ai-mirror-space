
import { GoogleGenAI, Modality, type GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const initAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY 환경 변수가 설정되지 않았습니다. README.md 파일의 배포 안내를 따라 Vercel 또는 다른 호스팅 서비스에 API 키를 설정해주세요.");
    }
    ai = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
};

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("AI client가 초기화되지 않았습니다. App.tsx에서 initAiClient가 먼저 호출되었는지 확인해주세요.");
    }
    return ai;
};

interface AiImageResult {
    image: string;
    text: string | null;
    mimeType: string;
}
interface AiVideoResult {
    videoUrl: string; // blob url
    mimeType: string;
}

const SYSTEM_INSTRUCTION_FOR_EDITING = `You are an expert photo editor. Your task is to modify the given image based on the user's text prompt.
Key instructions:
- **Preserve Identity**: You MUST preserve the subject's core identity, facial features, and body pose. Do not change the person into someone else.
- **Maintain Composition**: Keep the original image's composition, framing, and angle.
- **Background Consistency**: Retain the background unless the prompt specifically asks to change it.
- **Apply Edits Subtly**: Apply the requested changes (e.g., 'add a hat', 'change hair color') naturally and realistically, integrating them into the original image's style.`;

const SYSTEM_INSTRUCTION_FOR_RECOMPOSITION = `You are an expert at image recomposition. Your task is to combine two images based on a user's prompt.
- The **first image** contains the primary subject (e.g., a person). You MUST preserve the identity, features, and pose of this subject.
- The **second image** provides the artistic style, color palette, and background.
- Your goal is to seamlessly transfer the subject from the first image into the style and environment of the second image.
- The user's text prompt provides additional creative direction for this combination.`;

const processApiResponse = (response: GenerateContentResponse): AiImageResult => {
    let result: Partial<AiImageResult> & { text: string | null } = { image: undefined, text: null, mimeType: undefined };

    if (response && response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                result.text = part.text;
            } else if (part.inlineData) {
                const imageMimeType = part.inlineData.mimeType;
                result.mimeType = imageMimeType;
                result.image = `data:${imageMimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    if (!result.image) {
        throw new Error("API가 이미지를 반환하지 않았습니다. 프롬프트가 거부되었을 수 있습니다.");
    }
    return result as AiImageResult;
}


export const editImageWithGemini = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<AiImageResult> => {
    const aiClient = getAiClient();
    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
                systemInstruction: SYSTEM_INSTRUCTION_FOR_EDITING,
            },
        });
        return processApiResponse(response);
    } catch (error) {
        console.error("Error calling Gemini API for editing:", error);
        throw new Error("Gemini API로 이미지 편집에 실패했습니다.");
    }
};

export const recomposeImagesWithGemini = async (
    base64ImageData1: string,
    mimeType1: string,
    base64ImageData2: string,
    mimeType2: string,
    prompt: string
): Promise<AiImageResult> => {
    const aiClient = getAiClient();
    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                     // Provide images first, then the text prompt for better model interpretation.
                    {
                        inlineData: {
                            data: base64ImageData1, // Subject image
                            mimeType: mimeType1,
                        },
                    },
                    {
                        inlineData: {
                            data: base64ImageData2, // Style image
                            mimeType: mimeType2,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
                systemInstruction: SYSTEM_INSTRUCTION_FOR_RECOMPOSITION,
            },
        });
        return processApiResponse(response);
    } catch (error) {
        console.error("Error calling Gemini API for recomposition:", error);
        throw new Error("Gemini API로 이미지 재구성에 실패했습니다.");
    }
};


export const generateImageWithImagen = async (
    prompt: string,
    aspectRatio: string,
): Promise<AiImageResult> => {
    const aiClient = getAiClient();
    try {
        const response = await aiClient.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
            },
        });

        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return {
            image: `data:image/png;base64,${base64ImageBytes}`,
            text: null,
            mimeType: 'image/png'
        };

    } catch (error) {
        console.error("Error calling Imagen API:", error);
        throw new Error("Imagen API로 이미지 생성에 실패했습니다.");
    }
};

export const generateVideoWithVeo = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    onProgress: (message: string) => void
): Promise<AiVideoResult> => {
    const aiClient = getAiClient();
    try {
        onProgress("비디오 생성 요청을 시작합니다...");
        let operation = await aiClient.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: base64ImageData,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
            }
        });

        onProgress("서버에서 비디오를 처리 중입니다...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await aiClient.operations.getVideosOperation({ operation: operation });
        }

        onProgress("비디오 다운로드 링크를 가져오는 중입니다...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("생성된 비디오의 다운로드 링크를 찾을 수 없습니다.");
        }
        
        onProgress("비디오 파일을 다운로드하고 있습니다...");
        // Use the stored API key for the download URL
        const videoResponse = await fetch(`${downloadLink}&key=${currentApiKey}`);
        if (!videoResponse.ok) {
            throw new Error(`비디오 다운로드에 실패했습니다: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        return {
            videoUrl: videoUrl,
            mimeType: videoBlob.type || 'video/mp4',
        };

    } catch (error) {
        console.error("Error calling Veo API:", error);
        throw new Error("Veo API로 비디오 생성에 실패했습니다.");
    }
};
