/**
 * 回答风格模板（按确认回执：教学讲解 / 短视频口播 / 儿童版 分别建模板）
 * auto 模式表示「先询问用户想要哪种风格」。
 */

export type AnswerStyle = 'teaching' | 'shortvideo' | 'kids' | 'auto';

export interface StyleTemplate {
  id: AnswerStyle;
  label: string;
  hint: string;
  /** 追加到系统提示词的写法要求 */
  instruction: string;
  /** 建议长度 */
  lengthHint: string;
}

export const ANSWER_STYLES: StyleTemplate[] = [
  {
    id: 'teaching',
    label: '教学讲解',
    hint: '条理清晰，适合课堂/讲解词',
    instruction:
      '按「一句话结论 → 分点解释 → 背景补充 → 延伸追问」组织，用词准确、可引用，避免夸张形容词。',
    lengthHint: '200–350 字',
  },
  {
    id: 'shortvideo',
    label: '短视频口播',
    hint: '口语化、有钩子，适合 30–60 秒',
    instruction:
      '写成可直接念出来的口播稿：前 3 秒用悬念或反差钩住人，中间用短句推进，结尾给一句金句或号召；不要出现"我们来看"这类书面腔。',
    lengthHint: '150–260 字（约 30–60 秒）',
  },
  {
    id: 'kids',
    label: '儿童版',
    hint: '亲切、多用比喻，适合 8–12 岁',
    instruction:
      '用讲故事的方式讲，多用比喻与拟人，每句不超过 20 字，避免生僻词与专业术语，可以在结尾问孩子一个小问题。',
    lengthHint: '150–250 字',
  },
  {
    id: 'auto',
    label: '由我询问',
    hint: '助手先问你要哪种风格',
    instruction:
      '如果用户没有指定风格，先用一句话回答核心问题，然后询问用户想要「教学讲解 / 短视频口播 / 儿童版」中的哪一种，再按对应风格展开。',
    lengthHint: '先简短回答 + 一句询问',
  },
];

export function styleTemplate(style: AnswerStyle | string | undefined): StyleTemplate {
  return ANSWER_STYLES.find((item) => item.id === style) ?? ANSWER_STYLES[0];
}

export const QUICK_PROMPTS: Record<AnswerStyle, string[]> = {
  teaching: ['井陉拉花的动作特点是什么？', '常山战鼓为什么被称为四大名鼓？'],
  shortvideo: ['帮我写 30 秒口播介绍正定高照', '给无极剪纸写一条短视频开头钩子'],
  kids: ['用小朋友能懂的话讲讲耿村民间故事', '给 8 岁孩子讲讲什么是打铁花'],
  auto: ['石家庄有哪些国家级非遗？', '推荐一条正定非遗一日游路线'],
};
