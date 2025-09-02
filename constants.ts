import type { Style, AspectRatio } from './types';

export const STYLES: Style[] = [
    { id: 'photorealistic', name: '포토리얼', icon: '📷' },
    { id: 'figure', name: '피규어', icon: '🤖' },
    { id: 'profile', name: '프로필', icon: '🪪' },
    { id: 'drawing', name: '드로잉', icon: '✍️' },
    { id: 'poster', name: '포스터', icon: '📰' },
    { id: 'watercolor', name: '수채화', icon: '🎨' },
    { id: 'oil-painting', name: '유화', icon: '🖼️' },
    { id: 'cinematic', name: '시네마틱', icon: '🎬' },
    { id: 'anime-manga', name: '애니메이션', icon: '🪄' },
];

export const ASPECT_RATIOS: AspectRatio[] = [
    { id: '1:1', name: '정사각형', icon: '■' },
    { id: '16:9', name: '가로', icon: '▭' },
    { id: '9:16', name: '세로', icon: '▯' },
    { id: '4:3', name: '가로 (4:3)', icon: '▭' },
    { id: '3:4', name: '세로 (3:4)', icon: '▯' },
];

export const ENHANCEMENT_PROMPTS: Record<string, string> = {
    photorealistic: "photorealistic, 8k, ultra-detailed, sharp focus",
    figure: "3d model, toy figure, miniature, detailed textures, studio lighting",
    profile: "professional profile picture, portrait, studio lighting, high resolution",
    drawing: "charcoal drawing, sketch, detailed lines, artistic shading",
    poster: "movie poster, graphic design, bold typography, vibrant colors",
    watercolor: "watercolor painting, wet-on-wet technique, soft edges, pastel colors",
    'oil-painting': "oil painting, thick brush strokes, impasto style, rich colors",
    cinematic: "cinematic shot, dramatic lighting, movie still, anamorphic lens flare",
    'anime-manga': "anime style, manga, key visual, vibrant, dynamic lines",
};

export const POST_PROCESSING_PROMPTS: Record<string, string> = {
    upscale: "Upscale to 4k resolution, enhance details, sharpen image",
    pretty: "Enhance the subject's beauty with a focus on natural, glowing skin, subtle and elegant makeup, and soft, flattering lighting. If appropriate, add a simple, tasteful accessory like a small earring or a delicate necklace to complement the look. Make the overall atmosphere more dreamy and aesthetically pleasing.",
    cool: "Transform the subject to look cooler and more stylish. Give them a confident expression, add dynamic, high-contrast lighting, and sharpen the details. If appropriate, add a suitable accessory like modern sunglasses or a leather jacket. The overall mood should be more edgy and dynamic.",
    joy: "Change the expression to joyful and happy 😊",
    sadness: "Change the expression to sad and melancholic 😢",
    anger: "Change the expression to angry and furious 😠",
    neutral: "Change the expression to a neutral, calm look 😐",
}

export const INSPIRATION_PROMPTS: string[] = [
    "프로필 사진용으로, 부드러운 조명 아래에서 촬영",
    "나를 판타지 세계의 엘프 캐릭터처럼 만들어줘, 뾰족한 귀와 신비로운 숲 배경",
    "80년대 레트로 스타일의 인물 사진, 네온 조명과 빈티지 자켓",
    "소셜 미디어 아바타로 사용할 귀여운 애니메이션 캐리커처",
    "강렬한 흑백 대비가 돋보이는 드라마틱한 인물 사진",
    "나만의 커스텀 코스튬을 입은 슈퍼히어로의 모습으로 재구성",
    "따뜻한 스웨터를 입고 커피잔을 들고 있는, 아늑한 가을 테마의 인물 사진",
    "로봇 부품과 미래적인 도시를 배경으로 한 사이버펑크 스타일",
    "빈센트 반 고흐의 화풍으로 그린 초상화",
    "내 얼굴을 미니멀한 라인 아트로 드로잉"
];

export const VIDEO_LOADING_MESSAGES: string[] = [
    "애니메이션 엔진을 준비 중입니다...",
    "페르소나의 키프레임을 스케치하고 있습니다...",
    "디지털 촬영 감독과 상의 중입니다...",
    "초반 몇 초의 움직임을 렌더링하고 있습니다...",
    "고급 시각 효과를 적용하고 있습니다...",
    "마지막 프레임을 다듬고 있습니다...",
    "거의 다 왔습니다. 시사회를 준비하세요!"
];