/**
 * AI 小助手的本地知识库
 * - buildKnowledgeDigest()：把平台数据压缩成提示词上下文，供 DeepSeek 使用；
 * - localAnswer()：没有配置 DEEPSEEK_API_KEY 时，直接用本地检索结果作答，
 *   保证「问答」功能在任何环境下都能演示。
 */

import { ichList } from '@/lib/ich';
import { mapPoints } from '@/lib/mapData';
import { newsList } from '@/lib/newsData';

export const ASSISTANT_NAME = '非遗小助手';

export const SYSTEM_PROMPT = [
  '你是「石家庄非遗文化 · AI 艺术共创平台」内置的 AI 小助手，负责解答与石家庄非物质文化遗产相关的问题。',
  '回答要求：',
  '1. 使用简体中文，条理清晰，可用小标题与短列表，单次回答控制在 250 字以内（用户明确要求长文时除外）。',
  '2. 优先使用下方资料库中的信息；资料库没有覆盖的内容可以补充常识性介绍，但要说明「资料库未收录」。',
  '3. 涉及纹样、脸谱、服饰等文化细节时，提醒以传承人的解释为准，不要编造具体传承人姓名、批次与名录号码。',
  '4. 回答结束后，可以自然地推荐平台内的相关页面（非遗列表 / 文化地图 / AI 共创）。',
].join('\n');

export function buildKnowledgeDigest(): string {
  const lines: string[] = ['【平台收录的非遗项目】'];

  for (const item of ichList) {
    lines.push(
      [
        `- ${item.name}（${item.level}｜${item.category}｜${item.region}）`,
        `  概要：${item.summary}`,
        `  亮点：${item.highlight}`,
        `  背景：${item.background[0] ?? ''}`,
        `  列入原因：${item.reason[0] ?? ''}`,
        `  传承：${item.inheritance}`,
      ].join('\n'),
    );
  }

  lines.push('', '【文化地图点位统计】');
  for (const point of mapPoints) {
    lines.push(`- ${point.location}｜${point.name}（${point.category}${point.level ? '｜' + point.level : ''}，关联资源 ${point.count} 项）：${point.description}`);
  }

  lines.push('', '【政策 / 新闻 / 倡议】');
  for (const news of newsList) {
    lines.push(`- [${news.category}] ${news.title}（${news.date}）：${news.summary}`);
  }

  return lines.join('\n');
}

/** 简单关键词检索：命中项目名、别名、地域、分类、标签、概要的分值累加 */
export function searchLocal(question: string) {
  const scores = ichList.map((item) => {
    let score = 0;
    const haystacks: [string, number][] = [
      [item.name, 10],
      [item.alias ?? '', 8],
      [item.region, 5],
      [item.category, 4],
      [item.tags.join(' '), 3],
      [item.summary, 2],
      [item.background.join(' '), 1],
      [item.reason.join(' '), 1],
    ];

    for (const [text, weight] of haystacks) {
      if (!text) continue;
      // 项目名/别名等短词直接包含判断
      if (question.includes(text) || text.includes(question)) score += weight * 2;
      // 以 2 字为一组的滑窗匹配，提升中文召回的稳定性
      for (let i = 0; i < text.length - 1; i++) {
        const gram = text.slice(i, i + 2);
        if (gram.length === 2 && question.includes(gram)) score += weight * 0.35;
      }
    }
    return { item, score };
  });

  return scores.sort((a, b) => b.score - a.score).filter((entry) => entry.score > 0);
}

export function localAnswer(question: string): string {
  const hits = searchLocal(question).slice(0, 2);

  if (hits.length === 0 || hits[0].score < 1.2) {
    const categories = Array.from(new Set(ichList.map((item) => item.category))).join('、');
    const regions = Array.from(new Set(ichList.map((item) => item.region))).join('、');
    return [
      `我是${ASSISTANT_NAME}。目前平台资料库收录了 ${ichList.length} 个石家庄非遗代表性项目，覆盖 ${categories} 等门类，地域包括${regions}。`,
      '',
      '你可以这样问我：',
      '- 「井陉拉花的动作特点是什么？」',
      '- 「常山战鼓为什么被称为四大名鼓？」',
      '- 「正定有哪些非遗项目，在地图上怎么找？」',
      '- 「无极剪纸的刀法有哪几种？」',
    ].join('\n');
  }

  const blocks = hits.map(({ item }) => {
    return [
      `## ${item.name}`,
      `**${item.level}｜${item.category}｜${item.region}**`,
      item.summary,
      '',
      `**列入保护的原因**：${item.reason[0] ?? '—'}`,
      `**传承现状**：${item.inheritance}`,
      `**延伸阅读**：/heritage/${item.id}`,
    ].join('\n');
  });

  return [
    `（本地知识库模式）根据平台资料，与你问题最相关的内容如下：`,
    '',
    ...blocks,
    '',
    '想继续深入，可以到「非遗列表」查看完整图集与影像，或在「文化地图」上定位该项目所在县市。',
  ].join('\n');
}

/** 资料库统计，用于首页与 AI 页面展示 */
export function knowledgeSummary() {
  return {
    projects: ichList.length,
    regions: new Set(ichList.map((item) => item.region)).size,
    categories: new Set(ichList.map((item) => item.category)).size,
    videos: ichList.reduce((sum, item) => sum + item.videos.length, 0),
    mapPoints: mapPoints.length,
  };
}
