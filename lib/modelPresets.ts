/**
 * 图像模型配置（含「用户输入」模块）
 *
 * 按确认回执：图像模型选型模块需要支持用户自定义输入。
 * 用户可以：① 从预设里选（通义万相 / 即梦 / gpt-image / 本地 SDXL）；
 *          ② 选「自定义」并自己填写模型名、接口地址、API Key、请求模板；
 * 配置保存在浏览器 localStorage（按账号隔离），API Key 只在提交生成时随请求发往服务端，
 * 由服务端转发给模型，不写入代码库、不落库。
 */

export type Provider =
  | 'dashscope'
  | 'jimeng'
  | 'openai'
  | 'local-sdxl'
  | 'custom'
  | 'kling'
  | 'local-svd';

export type ImageProvider = Extract<Provider, 'dashscope' | 'jimeng' | 'openai' | 'local-sdxl' | 'custom'>;
export type VideoProvider = Extract<Provider, 'dashscope' | 'jimeng' | 'kling' | 'local-svd' | 'custom'>;

export interface RightsPolicy {
  /** 署名模板，{user} 会被替换为登录用户昵称 */
  authorTemplate: string;
  /** 授权范围 */
  license: string;
  /** 来源标注 */
  sourceNote: string;
}

export interface ModelConfig {
  provider: Provider;
  /** 展示名 */
  label: string;
  /** 模型名（用户可改） */
  model: string;
  /** 接口地址（自定义 / 本地模型必填） */
  endpoint: string;
  /** 用户临时填写的 API Key（仅存本机浏览器） */
  apiKey: string;
  /** 每轮生成张数（回执：不需要逐张人工挑选，默认 2 张自动择优） */
  count: number;
  /** 是否启用参考图引导（图生图） */
  useReference: boolean;
  /** 质检阈值（低于该分数触发重编译） */
  qualityThreshold: number;
  /** 自动重试次数 */
  maxRetries: number;
  /** 版权与署名规则 */
  rights: RightsPolicy;
  /** 用户补充说明（会追加进提示词） */
  extraPrompt: string;
}

export const DEFAULT_RIGHTS: RightsPolicy = {
  authorTemplate: 'AI 共创 · {user}',
  license: '仅用于学习交流与非商业展示，转载需注明来源与共创者',
  sourceNote: '参考素材：石家庄非遗项目素材包；文化细节以传承人说明为准',
};

export const MODEL_PRESETS: ModelConfig[] = [
  {
    provider: 'dashscope',
    label: '通义万相（阿里云 · 国内直连）',
    model: 'wanx2.1-t2i-turbo',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    apiKey: '',
    count: 2,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 2,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'jimeng',
    label: '即梦（字节 · 需企业接入签名）',
    model: 'jimeng-2.0',
    endpoint: '',
    apiKey: '',
    count: 2,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 2,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'openai',
    label: 'gpt-image（OpenAI）',
    model: 'gpt-image-1',
    endpoint: 'https://api.openai.com/v1/images/generations',
    apiKey: '',
    count: 2,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 2,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'local-sdxl',
    label: '本地 SDXL（Stable Diffusion WebUI / ComfyUI）',
    model: 'sdxl',
    endpoint: 'http://127.0.0.1:7860/sdapi/v1/txt2img',
    apiKey: '',
    count: 2,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 2,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'custom',
    label: '自定义模型 / 自建接口',
    model: '',
    endpoint: '',
    apiKey: '',
    count: 2,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 2,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
];

/** 视频生成模块的模型预设（与图像模型分开，供「视频生成模块工作流」使用） */
export const VIDEO_MODEL_PRESETS: ModelConfig[] = [
  {
    provider: 'dashscope',
    label: '通义万相 · 视频（国内直连）',
    model: 'wanx2.1-t2v-turbo',
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
    apiKey: '',
    count: 1,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 1,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'kling',
    label: '可灵 AI（快手 · 需签名接入）',
    model: 'kling-v1-6',
    endpoint: '',
    apiKey: '',
    count: 1,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 1,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'jimeng',
    label: '即梦视频（字节 · 需企业接入）',
    model: 'jimeng-video-2.0',
    endpoint: '',
    apiKey: '',
    count: 1,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 1,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'local-svd',
    label: '本地视频模型（SVD / AnimateDiff）',
    model: 'svd-xt-1-1',
    endpoint: 'http://127.0.0.1:7860/sdapi/v1/img2vid',
    apiKey: '',
    count: 1,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 1,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
  {
    provider: 'custom',
    label: '自定义视频接口 / 自建服务',
    model: '',
    endpoint: '',
    apiKey: '',
    count: 1,
    useReference: true,
    qualityThreshold: 80,
    maxRetries: 1,
    rights: DEFAULT_RIGHTS,
    extraPrompt: '',
  },
];

export function presetByProvider(provider: ImageProvider): ModelConfig {
  return MODEL_PRESETS.find((preset) => preset.provider === provider) ?? MODEL_PRESETS[0];
}

export function videoPresetByProvider(provider: Provider): ModelConfig {
  return VIDEO_MODEL_PRESETS.find((preset) => preset.provider === provider) ?? VIDEO_MODEL_PRESETS[0];
}

const STORAGE_KEY = 'sjz-ich-model-config';

export function loadModelConfig(user?: string | null, variant: 'image' | 'video' = 'image'): ModelConfig {
  const fallback = variant === 'video' ? VIDEO_MODEL_PRESETS[0] : MODEL_PRESETS[0];
  if (typeof window === 'undefined') return { ...fallback };
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${variant}:${user ?? 'guest'}`);
    if (raw) return { ...fallback, ...(JSON.parse(raw) as Partial<ModelConfig>) };
  } catch {
    /* ignore */
  }
  return { ...fallback };
}

export function saveModelConfig(config: ModelConfig, user?: string | null, variant: 'image' | 'video' = 'image') {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${variant}:${user ?? 'guest'}`, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

/** 该 provider 在服务端对应的环境变量名（提示用） */
export const PROVIDER_ENV_HINT: Record<Provider, string> = {
  dashscope: 'DASHSCOPE_API_KEY',
  jimeng: 'JIMENG_ACCESS_KEY / JIMENG_SECRET_KEY',
  openai: 'OPENAI_API_KEY',
  'local-sdxl': '无需 Key（本地服务）',
  'local-svd': '无需 Key（本地服务）',
  kling: 'KLING_ACCESS_KEY / KLING_SECRET_KEY',
  custom: '按你的接口自定，例如 CUSTOM_IMAGE_API_KEY',
};
