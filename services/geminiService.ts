
import { GoogleGenAI, Modality, type GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const initAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY 환경 변수가 설정되지 않았습니다. API 키를 설정해주세요.");
    }
    ai = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
};

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("AI client가 초기화되지 않았습니다.");
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

const SYSTEM_INSTRUCTION_FOR_EDITING = `You are an expert aesthetic photo editor. Your task is to modify the given image based on the user's text prompt.
Key instructions:
- **Preserve Identity**: You MUST preserve the subject's core identity, facial features, and body pose.
- **Aesthetic Quality**: Ensure the final output has high artistic value, suitable for a refined portfolio.
- **Maintain Composition**: Keep the original image's composition unless asked otherwise.
- **Natural Integration**: Apply changes subtly and realistically.`;

const SYSTEM_INSTRUCTION_FOR_RECOMPOSITION = `You are a visionary art director specializing in image synthesis.
- **Source 1 (Subject)**: Preserve the identity and key features.
- **Source 2 (Style/Bg)**: Extract the mood, lighting, and artistic style.
- **Goal**: Create a seamless masterpiece that blends the subject into the new world.`;

const processApiResponse = (response: GenerateContentResponse): AiImageResult => {
    let result: Partial<AiImageResult> & { text: string | null } = { image: undefined, text: null, mimeType: undefined };

    if (response && response.candidates && response.candidates.length > 0) {
        // Nano Banana Pro creates images in parts. Check all parts.
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                result.text = part.text;
            } 
            if (part.inlineData) {
                const imageMimeType = part.inlineData.mimeType;
                result.mimeType = imageMimeType;
                result.image = `data:${imageMimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    if (!result.image) {
        throw new Error("이미지가 생성되지 않았습니다. 프롬프트를 확인해주세요.");
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
        // Using Nano Banana Pro (gemini-3-pro-image-preview) for High-Quality Editing
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-pro-image-preview',
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
                // responseModalities not strictly required for this model if implied, but good practice.
                systemInstruction: SYSTEM_INSTRUCTION_FOR_EDITING,
            },
        });
        return processApiResponse(response);
    } catch (error) {
        console.error("Error calling Gemini API for editing:", error);
        throw new Error("이미지 편집에 실패했습니다. (Gemini 3 Pro)");
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
        // Using Nano Banana Pro for Recomposition
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData1,
                            mimeType: mimeType1,
                        },
                    },
                    {
                        inlineData: {
                            data: base64ImageData2,
                            mimeType: mimeType2,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_FOR_RECOMPOSITION,
            },
        });
        return processApiResponse(response);
    } catch (error) {
        console.error("Error calling Gemini API for recomposition:", error);
        throw new Error("이미지 재구성에 실패했습니다. (Gemini 3 Pro)");
    }
};

export const generateImageWithImagen = async (
    prompt: string,
    aspectRatio: string,
): Promise<AiImageResult> => {
    const aiClient = getAiClient();
    try {
        // Updated to use gemini-3-pro-image-preview (Nano Banana Pro) as requested by Demian
        // Note: aspect ratio mapping for Gemini 3 Pro is string based (e.g. "1:1")
        
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
                    imageSize: "1K" 
                }
            },
        });

        return processApiResponse(response);

    } catch (error) {
        console.error("Error calling Gemini Generation API:", error);
        throw new Error("이미지 생성에 실패했습니다. (Gemini 3 Pro)");
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
        onProgress("Demian의 스튜디오에서 영상을 렌더링합니다...");
        
        // Upgraded to Veo 3.1 Fast
        let operation = await aiClient.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: base64ImageData,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9' // Veo 3.1 specific
            }
        });

        onProgress("AI가 프레임을 그리고 있습니다...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await aiClient.operations.getVideosOperation({ operation: operation });
        }

        onProgress("영상을 마무리하는 중입니다...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("비디오 링크를 생성하지 못했습니다.");
        }
        
        const videoResponse = await fetch(`${downloadLink}&key=${currentApiKey}`);
        if (!videoResponse.ok) {
            throw new Error(`다운로드 실패: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        return {
            videoUrl: videoUrl,
            mimeType: videoBlob.type || 'video/mp4',
        };

    } catch (error) {
        console.error("Error calling Veo API:", error);
        throw new Error("비디오 생성에 실패했습니다. (Veo 3.1)");
    }
};