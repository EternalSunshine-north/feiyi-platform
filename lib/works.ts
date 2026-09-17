/** 首页展示用的推荐作品、精选内容、用户评价与平台统计 */

import { ichList } from '@/lib/ich';
import { mapPoints } from '@/lib/mapData';

export interface WorksItem {
  id: string;
  title: string;
  author: string;
  source: string;
  image: string;
  tag: string;
  kind: 'AI 共创' | '影像档案';
  ichId?: string;
}

export interface ContentItem {
  id: string;
  type: '文章' | '视频' | '图文';
  title: string;
  desc: string;
  cover: string;
  meta: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initial: string;
  content: string;
  rating: number;
}

const IMG = '/ich';

/** 平台统计：全部由真实数据计算，避免首页数字与内容不一致 */
export const platformStats = [
  {
    label: '收录非遗项目',
    value: ichList.length,
    suffix: '项',
    href: '/heritage',
    hint: '进入非遗列表',
  },
  {
    label: '文化地图点位',
    value: mapPoints.length,
    suffix: '个',
    href: '/map',
    hint: '打开文化地图',
  },
  {
    label: '覆盖县市区',
    value: new Set(mapPoints.map((p) => p.location.split(' · ')[0])).size,
    suffix: '个',
    href: '/map',
    hint: '查看分布统计',
  },
  {
    label: 'AI 共创作品',
    value: ichList.reduce((sum, item) => sum + item.aiWorks.length, 0),
    suffix: '幅',
    href: '/heritage?tab=works',
    hint: '查看共创作品',
  },
];

/** 首页「推荐非遗作品」：素材包中的 AI 共创图 + 实拍影像档案 */
export const featuredWorks: WorksItem[] = [
  {
    id: 'w-lahua-1',
    title: '《旋》· 拉花动作解构',
    author: 'AI 共创 · 云杉',
    source: '井陉拉花素材延伸',
    image: `${IMG}/jingxing-lahua/ai1.jpg`,
    tag: '传统舞蹈',
    kind: 'AI 共创',
    ichId: 'jingxing-lahua',
  },
  {
    id: 'w-zhangu-1',
    title: '《鼓阵》· 常山战鼓',
    author: 'AI 共创 · 阿汀',
    source: '常山战鼓素材延伸',
    image: `${IMG}/changshan-zhangu/ai1.jpg`,
    tag: '传统音乐',
    kind: 'AI 共创',
    ichId: 'changshan-zhangu',
  },
  {
    id: 'w-jianzhi-1',
    title: '《窗花无界》',
    author: 'AI 共创 · 木白',
    source: '无极剪纸纹样重构',
    image: `${IMG}/wuji-jianzhi/ai1.png`,
    tag: '传统美术',
    kind: 'AI 共创',
    ichId: 'wuji-jianzhi',
  },
  {
    id: 'w-mudiao-1',
    title: '《太行木纹》',
    author: 'AI 共创 · 青禾',
    source: '井陉木雕题材延伸',
    image: `${IMG}/jingxing-mudiao/ai1.png`,
    tag: '传统美术',
    kind: 'AI 共创',
    ichId: 'jingxing-mudiao',
  },
  {
    id: 'w-gaozhao-1',
    title: '《立幡》',
    author: 'AI 共创 · 一禾',
    source: '正定高照动作重构',
    image: `${IMG}/zhengding-gaozhao/ai2.png`,
    tag: '杂技',
    kind: 'AI 共创',
    ichId: 'zhengding-gaozhao',
  },
  {
    id: 'w-shehuo-1',
    title: '《十六回》· 花脸社火',
    author: 'AI 共创 · 十里',
    source: '桃林坪花脸社火脸谱重构',
    image: `${IMG}/taolinping-shehuo/ai1.png`,
    tag: '民俗',
    kind: 'AI 共创',
    ichId: 'taolinping-shehuo',
  },
  {
    id: 'w-sixian-1',
    title: '《台口》· 丝弦舞台',
    author: 'AI 共创 · 半山',
    source: '石家庄丝弦剧照延伸',
    image: `${IMG}/shijiazhuang-sixian/ai3.jpg`,
    tag: '传统戏剧',
    kind: 'AI 共创',
    ichId: 'shijiazhuang-sixian',
  },
  {
    id: 'w-niangjiu-1',
    title: '《陶坛》· 老五甑',
    author: 'AI 共创 · 川页',
    source: '石家庄酒酿造技艺延伸',
    image: `${IMG}/shijiazhuang-niangjiu/ai1.png`,
    tag: '传统技艺',
    kind: 'AI 共创',
    ichId: 'shijiazhuang-niangjiu',
  },
  {
    id: 'w-tubu-1',
    title: '《经与纬》· 手工土布',
    author: 'AI 共创 · 明明',
    source: '原村土布纹理延伸',
    image: `${IMG}/zanhuang-tubu/ai2.jpg`,
    tag: '传统技艺',
    kind: 'AI 共创',
    ichId: 'zanhuang-tubu',
  },
  {
    id: 'w-lahua-2',
    title: '井陉拉花 · 花会实拍档案',
    author: '平台影像档案',
    source: '素材包实图',
    image: `${IMG}/jingxing-lahua/g1.jpg`,
    tag: '影像档案',
    kind: '影像档案',
    ichId: 'jingxing-lahua',
  },
  {
    id: 'w-shehuo-2',
    title: '桃林坪花脸社火 · 巡游实拍',
    author: '平台影像档案',
    source: '素材包实图',
    image: `${IMG}/taolinping-shehuo/g2.png`,
    tag: '影像档案',
    kind: '影像档案',
    ichId: 'taolinping-shehuo',
  },
  {
    id: 'w-mudiao-2',
    title: '井陉木雕 · 薄浮雕细节',
    author: '平台影像档案',
    source: '素材包实图',
    image: `${IMG}/jingxing-mudiao/g2.jpg`,
    tag: '影像档案',
    kind: '影像档案',
    ichId: 'jingxing-mudiao',
  },
];

export const featuredContents: ContentItem[] = [
  {
    id: 'c-1',
    type: '视频',
    title: '影像｜井陉拉花：太行山下的「拧」与「撇」',
    desc: '六百年民间舞蹈的动作谱系与花会现场，配合传承人口述讲解逐帧拆解。',
    cover: `${IMG}/bg/lahua.jpg`,
    meta: '视频 · 约 5 分钟',
    href: '/heritage/jingxing-lahua',
  },
  {
    id: 'c-2',
    type: '图文',
    title: '图解｜常山战鼓 9 系 72 套鼓谱怎么看懂',
    desc: '从鼓点记号、队形变换到钹的配合，用一张图谱理解北方民间打击乐。',
    cover: `${IMG}/bg/zhangu.jpg`,
    meta: '图文 · 12 张图',
    href: '/heritage/changshan-zhangu',
  },
  {
    id: 'c-3',
    type: '文章',
    title: '深度｜一个村庄的故事库：耿村民间故事的活态传承',
    desc: '为什么「讲故事」也能成为国家级非遗？口述传统如何在没有文字的情况下代代相传。',
    cover: `${IMG}/bg/gushi.jpg`,
    meta: '文章 · 8 分钟阅读',
    href: '/heritage/gengcun-gushi',
  },
  {
    id: 'c-4',
    type: '图文',
    title: '图鉴｜无极剪纸的刀法：阴刻、阳刻与薄剪',
    desc: '对比三组传统纹样，看懂剪纸「连接」结构中隐藏的工艺逻辑。',
    cover: `${IMG}/bg/jianzhi.jpg`,
    meta: '图文 · 9 张图',
    href: '/heritage/wuji-jianzhi',
  },
  {
    id: 'c-5',
    type: '视频',
    title: '影像｜72 公斤的幡，如何在头顶立住',
    desc: '正定高照的发力方式与训练日常，慢镜头还原托塔、二郎担山等经典套路。',
    cover: `${IMG}/bg/gaozhao.jpg`,
    meta: '视频 · 约 4 分钟',
    href: '/heritage/zhengding-gaozhao',
  },
  {
    id: 'c-6',
    type: '文章',
    title: '手记｜薄浮雕：在 2 毫米木料上「造韵」',
    desc: '走进井陉木雕的家族工作室，看十三代传承如何在薄木上留下太行山水。',
    cover: `${IMG}/bg/mudiao.jpg`,
    meta: '文章 · 6 分钟阅读',
    href: '/heritage/jingxing-mudiao',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 't-1',
    name: '林一诺',
    role: '高校设计专业学生',
    initial: '林',
    content:
      '第一次把无极剪纸的纹样结构看清楚。AI 共创给出配色方案，我再按阴刻、阳刻的规律改回来，作业直接用上了。',
    rating: 5,
  },
  {
    id: 't-2',
    name: '王海涛',
    role: '本地文化爱好者',
    initial: '王',
    content: '文化地图很好用，点开就知道哪个县有什么项目。上次带外地朋友逛正定，直接照着地图排了一天行程。',
    rating: 5,
  },
  {
    id: 't-3',
    name: '赵晓曼',
    role: '小学语文老师',
    initial: '赵',
    content: '耿村民间故事这一页很适合做课堂素材，我把它改写成三分钟给孩子听的版本，直接用在课上了。',
    rating: 5,
  },
  {
    id: 't-4',
    name: '刘畅',
    role: '短视频创作者',
    initial: '刘',
    content: '素材库里的实拍和影像资料很全，写脚本前先看档案，比随手搜到的资料靠谱得多。',
    rating: 4,
  },
  {
    id: 't-5',
    name: '陈默',
    role: '文旅从业者',
    initial: '陈',
    content: '把战鼓、高照、拉花放在一张地图上，做线路策划时一目了然，统计数字直接能拿去做方案。',
    rating: 5,
  },
  {
    id: 't-6',
    name: '孙嘉',
    role: '非遗志愿者',
    initial: '孙',
    content: '最打动我的是每个项目都写了「为什么列入非遗」。理解了原因，才明白保护到底在保护什么。',
    rating: 5,
  },
];
