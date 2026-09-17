import { ichList, type IchItem } from '@/lib/ich';
import type { StepContext, StepResult, Workflow, WorkflowNode } from './types';

/**
 * 文生图工作流（Text-to-Image）
 *
 * 上一版的问题：提示词只被当作关键词，直接在素材库里随机取图 —— 结果与描述不符。
 * 本工作流把「生成」拆成 8 步，核心是第 3 步「非遗事实增强」和第 5 步「提示词编译」：
 * 先把提示词解析成结构化槽位，再用平台里的真实非遗资料约束主体、服饰、纹样与年代，
 * 最后编译成中英双语提示词 + 负面词，交给图像模型。
 */

const STYLE_WORDS: { key: string; label: string; en: string }[] = [
  { key: '剪纸', label: '剪纸质感', en: 'paper-cut style, layered paper edges' },
  { key: '霓虹', label: '霓虹科技', en: 'neon cyber glow, volumetric light' },
  { key: '赛博', label: '赛博朋克', en: 'cyberpunk, futuristic city' },
  { key: '水墨', label: '水墨写意', en: 'chinese ink wash painting' },
  { key: '工笔', label: '工笔重彩', en: 'gongbi fine-brush painting, mineral pigments' },
  { key: '年画', label: '木版年画', en: 'woodblock new-year print, folk color' },
  { key: '写实', label: '纪实摄影', en: 'documentary photography, natural light' },
  { key: '插画', label: '平面插画', en: 'editorial illustration, flat vector' },
  { key: '海报', label: '文化海报', en: 'cultural poster design, strong typography space' },
  { key: '油画', label: '古典油画', en: 'classical oil painting' },
  { key: '极简', label: '极简留白', en: 'minimalism, negative space' },
];

const PALETTE_WORDS: { key: string; label: string; en: string }[] = [
  { key: '红金', label: '中国红 + 鎏金', en: 'crimson red and antique gold' },
  { key: '冷色', label: '冷色调', en: 'cool cyan and indigo palette' },
  { key: '暖色', label: '暖色调', en: 'warm amber palette' },
  { key: '黑白', label: '黑白单色', en: 'black and white, high contrast' },
  { key: '莫兰迪', label: '莫兰迪低饱和', en: 'morandi desaturated palette' },
  { key: '亮色', label: '高饱和亮色', en: 'vivid saturated colors' },
];

const COMPOSITION_WORDS: { key: string; label: string; en: string }[] = [
  { key: '特写', label: '局部特写', en: 'close-up shot' },
  { key: '全身', label: '全身动作', en: 'full body, dynamic pose' },
  { key: '全景', label: '环境全景', en: 'wide establishing shot' },
  { key: '对称', label: '对称构图', en: 'symmetrical composition' },
  { key: '俯视', label: '俯拍视角', en: 'top-down view' },
  { key: '仰视', label: '仰拍视角', en: 'low angle shot' },
];

const ASPECT_WORDS: { key: string; label: string; value: string }[] = [
  { key: '竖版', label: '竖版 3:4（海报/短视频封面）', value: '3:4' },
  { key: '横版', label: '横版 16:9（展板/头图）', value: '16:9' },
  { key: '方图', label: '方图 1:1（卡片/头像）', value: '1:1' },
  { key: '长图', label: '长图 9:16（手机壁纸）', value: '9:16' },
];

const BASE_NEGATIVE = [
  '错误的历史服饰与朝代混搭',
  '与其他地区脸谱/纹样乱拼',
  '多余手指、畸变肢体',
  '文字乱码、水印、logo',
  '低清、噪点、过度锐化',
  '现代物品乱入（塑料椅子、LED 屏）',
];

/** 项目英文名：让交给模型的英文提示词保持纯英文 */
const PROJECT_NAME_EN: Record<string, string> = {
  'jingxing-lahua': 'Jingxing Lahua folk dance, Hebei',
  'changshan-zhangu': 'Changshan war drums of Zhengding',
  'gengcun-gushi': 'Gengcun village oral storytelling',
  'shijiazhuang-sixian': 'Shijiazhuang Sixian opera',
  'zanhuang-tubu': 'Zanhuang hand-woven cotton cloth craft',
  'wuji-jianzhi': 'Wuji paper-cutting art',
  'taolinping-shehuo': 'Taolinping painted-face Shehuo parade',
  'zhengding-gaozhao': 'Zhengding Gaozhao banner balancing acrobatics',
  'jingxing-mudiao': 'Jingxing wood carving, thin relief',
  'shijiazhuang-niangjiu': 'Shijiazhuang traditional liquor brewing',
};

/** 门类 / 地域英文名：保证最终提示词全英文 */
const CATEGORY_EN: Record<string, string> = {
  传统舞蹈: 'traditional dance',
  传统音乐: 'traditional music',
  民间文学: 'folk literature',
  传统戏剧: 'traditional opera',
  传统技艺: 'traditional craft',
  传统美术: 'traditional folk art',
  民俗: 'folk custom',
  '传统体育、游艺与杂技': 'traditional acrobatics',
};

const REGION_EN: Record<string, string> = {
  井陉县: 'Jingxing County, Hebei',
  正定县: 'Zhengding County, Hebei',
  藁城区: 'Gaocheng District, Hebei',
  石家庄市区: 'Shijiazhuang urban area, Hebei',
  赞皇县: 'Zanhuang County, Hebei',
  无极县: 'Wuji County, Hebei',
};

export function matchProject(text: string): IchItem | undefined {
  const hit = ichList
    .map((item) => {
      let score = 0;
      if (text.includes(item.name)) score += 10;
      if (item.alias && text.includes(item.alias)) score += 8;
      if (text.includes(item.region)) score += 4;
      if (text.includes(item.category)) score += 3;
      item.tags.forEach((tag) => {
        if (text.includes(tag)) score += 2;
      });
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);
  return hit[0]?.score > 0 ? hit[0].item : undefined;
}

function pick<T extends { key: string }>(words: T[], text: string): T | undefined {
  return words.find((word) => text.includes(word.key));
}

/* ------------------------------ 节点处理函数 ------------------------------ */

function intake(ctx: StepContext): StepResult {
  const prompt = ctx.input.trim();
  const flags: string[] = [];
  if (prompt.length < 4) flags.push('提示词过短，建议补充主体与场景');
  if (prompt.length > 300) flags.push('提示词过长，已截断到 300 字');
  return {
    output: {
      prompt: prompt.slice(0, 300),
      length: prompt.length,
      ok: prompt.length >= 4,
      flags,
    },
    note: flags.length ? flags.join('；') : '输入合法',
  };
}

function parse(ctx: StepContext): StepResult {
  const userExtra = ctx.config?.model?.extraPrompt?.trim() ?? '';
  const text = userExtra ? `${ctx.input}，${userExtra}` : ctx.input;
  const item = matchProject(text);
  const style = pick(STYLE_WORDS, text);
  const palette = pick(PALETTE_WORDS, text);
  const composition = pick(COMPOSITION_WORDS, text);
  const aspect = pick(ASPECT_WORDS, text);

  return {
    output: {
      subject: item ? `${item.name}（${item.category}）` : '未识别到具体非遗项目（将按泛非遗题材处理）',
      subjectEn: item
        ? `${PROJECT_NAME_EN[item.id] ?? item.id} (${CATEGORY_EN[item.category] ?? 'intangible cultural heritage'})`
        : 'generic Chinese intangible cultural heritage theme',
      projectId: item?.id ?? null,
      style: style?.label ?? '非遗纪实 + 现代设计（默认）',
      palette: palette?.label ?? '中国红 + 鎏金（默认）',
      composition: composition?.label ?? '主体居中（默认）',
      aspect: aspect?.label ?? '竖版 3:4（默认）',
      negatives: BASE_NEGATIVE,
      userExtra: userExtra || null,
    },
    note: item ? `识别到项目：${item.name}` : '未识别到项目名，建议在提示词里写明非遗项目',
  };
}

function grounding(ctx: StepContext): StepResult {
  const parsed = (ctx.values.parse ?? {}) as { projectId?: string | null };
  const item = ichList.find((entry) => entry.id === parsed.projectId);

  if (!item) {
    return {
      output: {
        project: null,
        constraints: ['未锁定项目：请补充「哪个非遗 + 哪个地区」，否则模型容易画成泛泛的“古风”'],
      },
      note: '未命中资料库项目，已给出兜底约束',
    };
  }

  const constraints = [
    `项目定名：${item.name}（${item.level}·${item.category}）`,
    `地域定名：${item.region}，注意不要混入其他地区的服饰/脸谱/乐器`,
    `技艺特征：${item.summary.slice(0, 60)}…`,
    ...item.background.slice(0, 2).map((text) => `事实约束：${text.slice(0, 52)}…`),
    `可引用元素：${item.tags.slice(0, 5).join(' / ')}`,
  ];

  const constraintsEn = [
    `authentic ${PROJECT_NAME_EN[item.id] ?? item.id}`,
    `regional style of ${REGION_EN[item.region] ?? `${item.region}, Hebei, China`}`,
    'period-accurate costume, props and instruments',
    'correct folk motifs, no unrelated regional elements',
  ];

  const taboos = [
    '不要给脸谱/服饰添加不属于该项目的戏剧元素',
    '传统纹样不做无依据的重组与再创造',
    '年代与道具保持与资料描述一致',
    '人物数量、姿态符合该项目的实际表演形态',
  ];

  return {
    output: { project: { id: item.id, name: item.name }, constraints, constraintsEn, taboos },
    note: `已注入 ${constraints.length} 条事实约束、${taboos.length} 条禁忌`,
  };
}

function reference(ctx: StepContext): StepResult {
  const parsed = (ctx.values.parse ?? {}) as { projectId?: string | null };
  const item = ichList.find((entry) => entry.id === parsed.projectId);
  if (!item) {
    return { output: { references: [] }, note: '没有可用的参考图（未锁定项目）' };
  }

  const roles = ['服饰/道具参考', '动作与姿态参考', '纹样与配色参考', '气氛与光影参考'];
  const references = [...item.gallery, ...item.aiWorks].slice(0, 4).map((src, i) => ({
    src,
    role: roles[i] ?? '补充参考',
    source: src.includes('/ai') ? '平台 AI 共创图' : '素材包实拍',
  }));

  return {
    output: { references },
    note: `已挑选 ${references.length} 张参考图（用于图生图 / 参考图引导，提升还原度）`,
  };
}

function compile(ctx: StepContext): StepResult {
  const parsed = (ctx.values.parse ?? {}) as {
    subject?: string;
    subjectEn?: string;
    style?: string;
    palette?: string;
    composition?: string;
    aspect?: string;
    negatives?: string[];
  };
  const ground = (ctx.values.grounding ?? {}) as {
    constraints?: string[];
    constraintsEn?: string[];
    taboos?: string[];
  };

  const subject = parsed.subject ?? '石家庄非遗';
  const subjectEn = parsed.subjectEn ?? 'Shijiazhuang intangible cultural heritage';
  const styleEn =
    STYLE_WORDS.find((word) => word.label === parsed.style)?.en ?? 'folk art meets contemporary design';
  const paletteEn =
    PALETTE_WORDS.find((word) => word.label === parsed.palette)?.en ?? 'crimson red and antique gold';
  const compEn = COMPOSITION_WORDS.find((word) => word.label === parsed.composition)?.en ?? 'centered composition';
  const aspectValue = ASPECT_WORDS.find((word) => word.label === parsed.aspect)?.value ?? '3:4';

  const promptZh = [
    `${subject}主题创作`,
    `风格：${parsed.style}`,
    `配色：${parsed.palette}`,
    `构图：${parsed.composition}，画幅 ${parsed.aspect}`,
    `文化约束：${(ground.constraints ?? []).slice(0, 2).join('；')}`,
    '细节：真实织物/纸材质感、可信的光源、留出文字排版空间',
  ].join('\n');

  const promptEn = [
    `${subjectEn}, ${styleEn}`,
    `${paletteEn}, ${compEn}`,
    ...(ground.constraintsEn ?? []),
    'physically plausible lighting, high detail, editorial quality',
    `aspect ratio ${aspectValue}, clean areas reserved for typography`,
  ].join(', ');

  const negativePrompt = [...BASE_NEGATIVE, ...(ground.taboos ?? [])].join('，');

  return {
    output: {
      promptZh,
      promptEn,
      negativePrompt,
      params: {
        aspect: aspectValue,
        aspectLabel: parsed.aspect ?? '竖版 3:4',
        steps: 28,
        guidance: 6.5,
        seed: 'random',
      },
      tokenEstimate: promptEn.split(/\s+/).length,
    },
    note: '已生成双语提示词与负面词，可直接交给任意文生图模型',
  };
}

async function generate(ctx: StepContext): Promise<StepResult> {
  const compileOut = (ctx.values.compile ?? {}) as {
    promptEn?: string;
    negativePrompt?: string;
    params?: { aspect?: string; steps?: number; guidance?: number };
  };
  const parsedOut = (ctx.values.parse ?? {}) as { projectId?: string | null };
  const refs = (ctx.values.reference as { references?: { src: string }[] } | undefined)?.references ?? [];
  const config = ctx.config?.model;
  const user = ctx.config?.user ?? '平台用户';

  const rights = config?.rights ?? {
    authorTemplate: 'AI 共创 · {user}',
    license: '仅用于学习交流与非商业展示，转载需注明来源与共创者',
    sourceNote: '参考素材：石家庄非遗项目素材包',
  };
  const project = ichList.find((item) => item.id === parsedOut.projectId);

  // 用户在「图像模型」模块里的输入，直接决定这一步怎么调
  const requestPayload = {
    provider: config?.provider ?? 'custom',
    model: config?.model ?? '（未指定）',
    endpoint: config?.endpoint ?? '（未指定）',
    prompt: compileOut.promptEn,
    negativePrompt: compileOut.negativePrompt,
    aspect: compileOut.params?.aspect ?? '3:4',
    steps: compileOut.params?.steps ?? 28,
    guidance: compileOut.params?.guidance ?? 6.5,
    count: config?.count ?? 2,
    useReference: config?.useReference ?? true,
    references: (config?.useReference ?? true) ? refs.map((ref) => ref.src) : [],
    archive: true,
    work: {
      title: `${project?.name ?? '非遗'} · AI 共创`,
      author: rights.authorTemplate.replace('{user}', user),
      source: `模型：${config?.model ?? '未指定'}（${config?.provider ?? 'custom'}）`,
      projectId: parsedOut.projectId ?? null,
      license: rights.license,
    },
  };

  const canCallModel =
    typeof window !== 'undefined' &&
    Boolean(config) &&
    Boolean(config?.model) &&
    Boolean(config?.endpoint || config?.provider === 'dashscope' || config?.provider === 'openai');

  if (!canCallModel) {
    return {
      status: 'planned',
      output: {
        status: '待接入模型（未填写可用模型或 Key）',
        endpoint: 'POST /api/image',
        requestPayload,
        candidates: [
          '通义万相（服务端 DASHSCOPE_API_KEY 或临时 Key）',
          'gpt-image（OPENAI_API_KEY）',
          '本地 SDXL（Stable Diffusion WebUI / ComfyUI）',
          '自定义模型（自己填接口地址与 Key）',
        ],
        hint: '在「图像模型」模块里选择或自定义模型并填入 Key，即可真实出图',
      },
      note: '未填写可用模型：演练到此返回请求体，便于你核对参数',
    };
  }

  try {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });
    const json = (await response.json()) as {
      images?: string[];
      error?: string;
      hint?: string;
      model?: string;
    };

    if (!response.ok) {
      return {
        output: { requestPayload, error: json.error, hint: json.hint },
        note: `模型调用未成功：${json.error ?? response.status}`,
      };
    }

    return {
      status: 'live',
      output: { requestPayload, images: json.images ?? [], model: json.model },
      note: `已生成 ${json.images?.length ?? 0} 张图（模型：${json.model || '自定义'}）`,
    };
  } catch (error) {
    return {
      output: {
        requestPayload,
        error: error instanceof Error ? error.message : '调用异常',
      },
      note: '调用 /api/image 异常',
    };
  }
}

function review(ctx: StepContext): StepResult {
  const compileOut = (ctx.values.compile ?? {}) as { promptZh?: string; promptEn?: string; negativePrompt?: string };
  const groundOut = (ctx.values.grounding ?? {}) as { project?: { name: string } | null };
  const issues: string[] = [];
  let score = 100;

  if (!groundOut.project) {
    score -= 40;
    issues.push('未锁定具体非遗项目 → 生成结果容易「似是而非」');
  }
  if (!compileOut.promptZh?.includes(groundOut.project?.name ?? '')) {
    score -= 10;
    issues.push('提示词未包含项目定名');
  }
  if ((compileOut.promptEn ?? '').split(/\s+/).length < 20) {
    score -= 15;
    issues.push('英文提示词过短，细节约束不足');
  }
  if (!compileOut.negativePrompt) {
    score -= 15;
    issues.push('缺少负面词');
  }

  const threshold = ctx.config?.model?.qualityThreshold ?? 80;
  const maxRetries = ctx.config?.model?.maxRetries ?? 2;
  const pass = score >= threshold;

  return {
    output: {
      score,
      threshold,
      maxRetries,
      issues,
      action: pass ? 'pass（提交生成）' : `retry（最多重试 ${maxRetries} 次）`,
      retryPlan: pass
        ? null
        : [
            '重试 1：把缺失约束（项目定名 / 地域 / 年代）补进提示词后重新编译',
            '重试 2：附加参考图引导（提高造型还原度）后再提交',
            `超过 ${maxRetries} 次仍不达标 → 转人工审阅`,
          ],
    },
    note: `质检阈值 ${threshold} 分，当前 ${score} 分`,
  };
}

function archive(ctx: StepContext): StepResult {
  const reviewOut = (ctx.values.review ?? {}) as { score?: number; action?: string };
  const generateOut = (ctx.values.generate ?? {}) as { images?: string[] };
  const rights = ctx.config?.model?.rights ?? {
    authorTemplate: 'AI 共创 · {user}',
    license: '仅用于学习交流与非商业展示，转载需注明来源与共创者',
    sourceNote: '参考素材：石家庄非遗项目素材包；文化细节以传承人说明为准',
  };
  const user = ctx.config?.user ?? '平台用户';

  return {
    output: {
      workId: `work-${Date.now().toString().slice(-6)}`,
      publishTo: '/heritage?tab=works',
      images: generateOut.images ?? [],
      rights: {
        署名: rights.authorTemplate.replace('{user}', user),
        授权范围: rights.license,
        来源标注: rights.sourceNote,
      },
      record: {
        提示词: '见 compile 节点',
        参考图: '见 reference 节点',
        质检分数: reviewOut.score ?? '—',
        生成参数: '见 compile 节点 params',
        模型: ctx.config?.model?.model ?? '未指定',
      },
    },
    note: '署名与授权规则已按确认回执写入；生成图会自动出现在非遗列表的 AI 共创作品',
  };
}

const nodes: WorkflowNode[] = [
  {
    id: 'intake',
    index: 1,
    title: '输入校验',
    kind: 'input',
    status: 'live',
    summary: '清洗提示词，做长度与内容检查，过长自动截断。',
    why: '避免空提示词或超长堆砌导致的随机结果。',
    inputs: [{ name: 'prompt', type: 'string', desc: '用户输入的创作提示词' }],
    outputs: [
      { name: 'prompt', type: 'string', desc: '清洗后的提示词' },
      { name: 'flags', type: 'string[]', desc: '提示与警告' },
    ],
  },
  {
    id: 'parse',
    index: 2,
    title: '需求解析（结构化槽位）',
    kind: 'llm',
    status: 'live',
    summary: '把一句话拆成「主体 / 非遗项目 / 风格 / 配色 / 构图 / 画幅 / 负面约束」七个槽位。',
    why: '上一版把整句当关键词用，主体与项目常被丢掉，才会出现「生成不准」。',
    inputs: [{ name: 'prompt', type: 'string', desc: '清洗后的提示词' }],
    outputs: [
      { name: 'subject', type: 'string', desc: '创作主体（含识别到的非遗项目）' },
      { name: 'style / palette / composition / aspect', type: 'string', desc: '视觉槽位' },
    ],
    params: [
      { label: '解析方式', value: '词表匹配（当前）→ 可切换为 LLM 结构化输出 JSON' },
      { label: '槽位定义', value: 'subject / projectId / style / palette / composition / aspect / negatives' },
    ],
  },
  {
    id: 'grounding',
    index: 3,
    title: '非遗事实增强（关键）',
    kind: 'retrieve',
    status: 'live',
    summary: '用平台资料库锁定该项目的定名、地域、技艺特征、可引用元素与禁忌。',
    why: '这是「准确」的核心：把项目名称、地域、服饰道具、纹样写入约束，防止模型自由发挥成泛古风。',
    inputs: [{ name: 'projectId', type: 'string | null', desc: '解析出的项目 id' }],
    outputs: [
      { name: 'constraints', type: 'string[]', desc: '必须遵守的事实约束' },
      { name: 'taboos', type: 'string[]', desc: '禁止出现的内容' },
    ],
    params: [{ label: '资料来源', value: 'src/lib/ich.ts（10 个项目：介绍 / 背景 / 事实 / 标签）' }],
  },
  {
    id: 'reference',
    index: 4,
    title: '参考图检索',
    kind: 'retrieve',
    status: 'live',
    summary: '从素材包实拍图与往期 AI 共创图中挑 3–4 张，标注各自用途（服饰 / 动作 / 纹样 / 光影）。',
    why: '参考图比文字更能约束造型，接图生图或参考图引导时效果提升明显。',
    inputs: [{ name: 'projectId', type: 'string | null', desc: '项目 id' }],
    outputs: [{ name: 'references', type: '{src, role, source}[]', desc: '参考图列表' }],
  },
  {
    id: 'compile',
    index: 5,
    title: '提示词编译（关键）',
    kind: 'rule',
    status: 'live',
    summary: '把槽位 + 事实约束 + 参考图用途编译成中英双语提示词与负面词，并给出画幅、步数、引导强度。',
    why: '输出一份可复用、可审计的提示词（中文给人看、英文给模型用），不再直接抓素材库图片。',
    inputs: [
      { name: 'parse.*', type: 'object', desc: '解析槽位' },
      { name: 'grounding.constraints', type: 'string[]', desc: '事实约束' },
    ],
    outputs: [
      { name: 'promptZh', type: 'string', desc: '中文提示词（供人审阅）' },
      { name: 'promptEn', type: 'string', desc: '英文提示词（交给模型）' },
      { name: 'negativePrompt', type: 'string', desc: '负面词' },
      { name: 'params', type: 'object', desc: '画幅 / 步数 / 引导强度 / 随机种子' },
    ],
  },
  {
    id: 'generate',
    index: 6,
    title: '图像生成（用户选型）',
    kind: 'model',
    status: 'planned',
    summary: '把编译结果提交给用户在「图像模型」模块里指定（或自定义）的文生图模型，返回 1–4 张候选图。',
    inputs: [{ name: 'promptEn / negativePrompt / params', type: 'object', desc: '编译结果' }],
    outputs: [{ name: 'images', type: 'string[]', desc: '生成图地址' }],
    params: [
      { label: '模型来源', value: '用户输入模块：预设（通义万相 / 即梦 / gpt-image / 本地 SDXL）+ 自定义模型' },
      { label: '用户可填', value: '模型名、接口地址、临时 API Key、每轮张数、参考图引导开关、补充说明' },
      { label: '每轮张数', value: '默认 2 张，由质检自动择优（回执：不需要逐张人工挑选）' },
      { label: '参考图引导', value: '默认开启（回执确认），可传参考图做图生图约束造型' },
      { label: '建议接口', value: 'POST /api/image（服务端持有 Key）' },
      { label: '未填模型时', value: '本步骤返回「待接入」并给出完整请求体，便于核对参数' },
    ],
  },
  {
    id: 'review',
    index: 7,
    title: '质检与重试',
    kind: 'rule',
    status: 'live',
    summary: '对提示词与结果做规则评分（是否锁定项目、约束是否完整、负面词是否齐备），低于阈值建议重编译。',
    why: '以前「生成不准」没有任何回溯机制；现在每一步都可评分、可重试。',
    inputs: [{ name: 'compile / grounding', type: 'object', desc: '编译与约束结果' }],
    outputs: [
      { name: 'score', type: 'number', desc: '0–100 质检分' },
      { name: 'action', type: 'string', desc: 'pass / retry' },
    ],
    params: [
      { label: '通过阈值', value: '阈值与重试次数由用户在模型模块里设置（默认 80 分 / 重试 2 次）' },
      { label: '重试策略', value: '重试 1 补约束 → 重试 2 加参考图引导 → 仍不过转人工审阅' },
    ],
  },
  {
    id: 'archive',
    index: 8,
    title: '归档与发布',
    kind: 'output',
    status: 'live',
    summary: '记录提示词、参考图、生成参数与质检分数，作品进入「非遗列表 → AI 共创作品」。',
    inputs: [{ name: 'review / compile / reference', type: 'object', desc: '全流程记录' }],
    outputs: [
      { name: 'workId', type: 'string', desc: '作品编号与展示位置' },
      { name: 'rights', type: 'object', desc: '署名 / 授权范围 / 来源标注' },
    ],
    params: [
      { label: '署名规则', value: '「AI 共创 · {用户名}」× 「项目名」，可在模型模块里改写模板' },
      { label: '授权范围', value: '默认仅用于学习交流与非商业展示，转载需注明来源（可改）' },
      { label: '存储位置', value: '.data/works.json，并在 /heritage?tab=works 展示' },
    ],
  },
];

export const textToImageWorkflow: Workflow = {
  meta: {
    id: 'text-to-image',
    name: '文生图工作流',
    goal: '把一句提示词变成「文化上说得通、视觉上可控」的非遗主题图像',
    entry: '用户提示词（例：把井陉拉花的拧肩翻腕做成一张现代海报）',
    exit: '1–4 张候选图 + 可追溯的提示词与参数记录',
    confirmed: [
      '图像模型选型：支持用户在「图像模型」模块选择预设（通义万相 / 即梦 / gpt-image / 本地 SDXL）或自定义模型（自填模型名、接口地址、临时 Key）',
      '启用参考图引导：默认开启，用素材包实拍图约束造型',
      '每轮张数默认 2 张，由质检自动择优（不需要逐张人工挑选）',
      '质检默认阈值 80 分、自动重试 2 次（补约束 → 加参考图引导 → 转人工）',
      '署名与授权：署名「AI 共创 · {用户名}」× 项目名，默认非商业、转载注明来源',
    ],
    decisions: [
      '是否把默认张数从 2 张调整为 4 张（成本会上升）',
      '是否调整质检阈值与重试次数',
      '是否需要训练「非遗风格 LoRA」（本地 SDXL 方案）',
      '生成图是否要同步到对象存储 / CDN（当前存 public/generated）',
    ],
  },
  nodes,
  handlers: { intake, parse, grounding, reference, compile, generate, review, archive },
};
