/**
 * 全国著名非物质文化遗产（用于「相关非遗」板块顶部）
 * 说明：视觉部分使用代码绘制的 「动态视觉」（canvas / CSS 动画），
 *      若想换成实拍照片，把图片放到 public/national/ 并在 image 字段填写路径即可。
 */

export type ArtEffect =
  | 'sparks'
  | 'paper'
  | 'silk'
  | 'glaze'
  | 'sleeve'
  | 'shadow'
  | 'mask'
  | 'seasons';

export interface NationalIch {
  id: string;
  name: string;
  region: string;
  level: string;
  category: string;
  desc: string;
  effect: ArtEffect;
  /** 可选：换成实拍/生成图片时的地址 */
  image?: string;
  videoKeyword?: string;
  tags: string[];
}

export const nationalIchList: NationalIch[] = [
  {
    id: 'n-datiehua',
    name: '打铁花',
    region: '河南确山 · 河北蔚县',
    level: '国家级',
    category: '民俗 · 焰火技艺',
    desc: '把 1600℃ 的铁水击向夜空，铁花如雨散落，是流传千年的民间焰火绝技；近年因「打铁花」短视频走红，被称为最浪漫的中国式烟火。',
    effect: 'sparks',
    videoKeyword: '打铁花',
    tags: ['非遗焰火', '夜间演出', '热门视频'],
  },
  {
    id: 'n-jianzhi',
    name: '中国剪纸',
    region: '全国多地（含河北无极）',
    level: '人类非遗代表作',
    category: '传统美术',
    desc: '一张红纸、一把剪刀，剪出窗花、灯花与吉祥纹样。中国剪纸是较早列入联合国教科文组织人类非遗代表作名录的项目，石家庄无极剪纸就是其中的重要一支。',
    effect: 'paper',
    image: '/ich/wuji-jianzhi/g4.jpg',
    videoKeyword: '中国剪纸',
    tags: ['人类非遗', '窗花', '与石家庄相关'],
  },
  {
    id: 'n-suxiu',
    name: '苏绣',
    region: '江苏苏州',
    level: '国家级',
    category: '传统美术',
    desc: '针脚细如发丝，「双面绣」「乱针绣」让丝线呈现出油画般的光影，是江南手工技艺的代表。',
    effect: 'silk',
    videoKeyword: '苏绣',
    tags: ['四大名绣', '手作技艺'],
  },
  {
    id: 'n-ceramic',
    name: '景德镇手工制瓷技艺',
    region: '江西景德镇',
    level: '国家级',
    category: '传统技艺',
    desc: '从揉泥、拉坯、利坯到施釉、烧窑，七十二道工序成就「白如玉、明如镜、薄如纸、声如磬」的瓷器。',
    effect: 'glaze',
    videoKeyword: '景德镇 制瓷',
    tags: ['瓷都', '七十二道工序'],
  },
  {
    id: 'n-kunqu',
    name: '昆曲',
    region: '江苏苏州 · 昆山',
    level: '人类非遗代表作',
    category: '传统戏剧',
    desc: '被称为「百戏之祖」，水磨腔婉转、身段讲究，2001 年入选联合国教科文组织首批人类口头和非物质遗产代表作名录。',
    effect: 'sleeve',
    videoKeyword: '昆曲',
    tags: ['百戏之祖', '水磨腔'],
  },
  {
    id: 'n-shadow',
    name: '皮影戏',
    region: '河北唐山 · 陕西华县等地',
    level: '人类非遗代表作',
    category: '传统戏剧',
    desc: '一张牛皮刻出千军万马，一块白布幕布演尽悲欢离合。皮影戏集雕刻、彩绘、演唱与操弄于一体，多地流派各具特色。',
    effect: 'shadow',
    videoKeyword: '皮影戏',
    tags: ['光影艺术', '人类非遗'],
  },
  {
    id: 'n-bianlian',
    name: '川剧变脸',
    region: '四川成都',
    level: '国家级',
    category: '传统戏剧',
    desc: '一转身、一抬手，脸谱瞬间变换，用以表现人物情绪的强烈转折，是川剧最具辨识度的绝技。',
    effect: 'mask',
    videoKeyword: '川剧变脸',
    tags: ['绝技', '戏曲'],
  },
  {
    id: 'n-jieqi',
    name: '二十四节气',
    region: '全国',
    level: '人类非遗代表作',
    category: '民俗 · 时间知识体系',
    desc: '中国人通过观察太阳周年运动形成的时间知识体系，指导农事与生活，2016 年列入人类非遗代表作名录。',
    effect: 'seasons',
    videoKeyword: '二十四节气',
    tags: ['人类非遗', '中国人的时间'],
  },
];

/** 中国地图上的著名非遗点位（用于「从石家庄到全国」总结板块） */
export const nationalPoints = [
  { name: '打铁花', location: '河南确山 / 河北蔚县', category: '民俗 · 焰火', level: '国家级', count: 2, coordinates: [114.02, 32.8] as [number, number] },
  { name: '中国剪纸', location: '全国多地（含河北无极）', category: '传统美术', level: '人类非遗', count: 5, coordinates: [114.98, 38.18] as [number, number] },
  { name: '苏绣', location: '江苏苏州', category: '传统美术', level: '国家级', count: 1, coordinates: [120.62, 31.32] as [number, number] },
  { name: '景德镇制瓷', location: '江西景德镇', category: '传统技艺', level: '国家级', count: 1, coordinates: [117.18, 29.27] as [number, number] },
  { name: '昆曲', location: '江苏昆山', category: '传统戏剧', level: '人类非遗', count: 1, coordinates: [120.98, 31.39] as [number, number] },
  { name: '皮影戏', location: '河北唐山 / 陕西华县', category: '传统戏剧', level: '人类非遗', count: 3, coordinates: [118.18, 39.63] as [number, number] },
  { name: '川剧变脸', location: '四川成都', category: '传统戏剧', level: '国家级', count: 1, coordinates: [104.07, 30.67] as [number, number] },
  { name: '云锦织造', location: '江苏南京', category: '传统技艺', level: '人类非遗', count: 1, coordinates: [118.8, 32.06] as [number, number] },
  { name: '紫砂陶制作', location: '江苏宜兴', category: '传统技艺', level: '国家级', count: 1, coordinates: [119.82, 31.34] as [number, number] },
  { name: '常山战鼓', location: '河北正定（本站收录）', category: '传统音乐', level: '国家级', count: 3, coordinates: [114.57, 38.146] as [number, number] },
];

/** 从石家庄到全国的数据（以官方最新公布为准） */
export const nationalStats = [
  { label: '本站收录石家庄项目', value: '10', unit: '项' },
  { label: '国家级非遗代表性项目', value: '1557', unit: '项（含子项 3610 项）' },
  { label: '中国列入联合国教科文组织非遗名录', value: '44', unit: '项' },
  { label: '本站文化地图点位', value: '18', unit: '个' },
];
