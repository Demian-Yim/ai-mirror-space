import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. Please check your deployment settings.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface AiImageResult {
    image: string | null;
    text: string | null;
    mimeType: string | null;
}

const SYSTEM_INSTRUCTION_FOR_EDITING = `You are an expert photo editor. Your task is to modify the given image based on the user's text prompt.
Key instructions:
- **Preserve Identity**: You MUST preserve the subject's core identity, facial features, and body pose. Do not change the person into someone else.
- **Maintain Composition**: Keep the original image's composition, framing, and angle.
- **Background Consistency**: Retain the background unless the prompt specifically asks to change it.
- **Apply Edits Subtly**: Apply the requested changes (e.g., 'add a hat', 'change hair color') naturally and realistically, integrating them into the original image's style.`;

const processApiResponse = (response: any): AiImageResult => {
    let result: AiImageResult = { image: null, text: null, mimeType: null };

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
    return result;
}


export const editImageWithGemini = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<AiImageResult> => {
    try {
        const response = await ai.models.generateContent({
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
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { text: `User Prompt: ${prompt}. Instruction: Use the subject from the first image and apply the style, background, and overall aesthetic from the second image.` },
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
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
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
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
            },
        });

        const generatedImage = response.generatedImages[0];
        if (!generatedImage || !generatedImage.image.imageBytes) {
            throw new Error("API가 이미지를 반환하지 않았습니다.");
        }

        const base64ImageBytes: string = generatedImage.image.imageBytes;
        const mimeType = 'image/png';

        return {
            image: `data:${mimeType};base64,${base64ImageBytes}`,
            text: null,
            mimeType: mimeType,
        };

    } catch (error) {
        console.error("Error calling Imagen API:", error);
        throw new Error("Imagen API로 이미지 생성에 실패했습니다.");
    }
};