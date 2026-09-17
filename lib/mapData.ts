/**
 * 文化地图点位数据（mock JSON）
 * 字段：name / location / coordinates / count / description / image
 * 说明：count 为「该点位关联的非遗资源数量」，用于热力气泡与数字角标；
 *      ichId 存在时表示该点位可以跳转到平台内的项目详情页。
 */

export interface MapPoint {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  count: number;
  category: string;
  level: string;
  description: string;
  image: string;
  ichId?: string;
  /** 该点位关联的其他非遗项目（用于「集聚点位」展示可跳转的关联项目） */
  relatedIchIds?: string[];
}

const IMG = '/ich';

export const mapPoints: MapPoint[] = [
  {
    id: 'p-zhengding-zhangu',
    name: '常山战鼓',
    location: '正定县',
    coordinates: [114.57, 38.146],
    count: 3,
    category: '传统音乐',
    level: '国家级',
    description:
      '正定古称常山郡，是三国名将赵云的故里。常山战鼓由古代军鼓演变而来，9 系 72 套鼓谱全靠口传心授，2008 年列入第二批国家级非遗名录。',
    image: `${IMG}/bg/zhangu.jpg`,
    ichId: 'changshan-zhangu',
  },
  {
    id: 'p-zhengding-gaozhao',
    name: '正定高照',
    location: '正定县',
    coordinates: [114.58, 38.152],
    count: 2,
    category: '传统体育、游艺与杂技',
    level: '省级',
    description:
      '又称中幡，幡杆最重可达 72 公斤，表演者依靠头、肩、肘、手承接幡杆，完成旱地拔葱、托塔、二郎担山等套路，是正定花会的核心项目。',
    image: `${IMG}/bg/gaozhao.jpg`,
    ichId: 'zhengding-gaozhao',
  },
  {
    id: 'p-zhengding-gucheng',
    name: '正定古城庙会花会',
    location: '正定县 · 古城',
    coordinates: [114.565, 38.14],
    count: 6,
    category: '民俗',
    level: '集聚点位',
    description:
      '正定古城是石家庄非遗展演密度最高的区域之一，春节期间的花会、庙会集中呈现战鼓、高照、秧歌、舞龙舞狮等项目。',
    image: `${IMG}/bg/zhangu.jpg`,
    relatedIchIds: ['changshan-zhangu', 'zhengding-gaozhao'],
  },
  {
    id: 'p-jingxing-lahua',
    name: '井陉拉花',
    location: '井陉县',
    coordinates: [114.145, 38.032],
    count: 4,
    category: '传统舞蹈',
    level: '国家级',
    description:
      '以「拧肩、扭臂、翻腕、吸腿、撇脚」为标志动作的民间舞蹈，被誉为太行山区的民间舞蹈化石，2006 年列入首批国家级非遗名录。',
    image: `${IMG}/bg/lahua.jpg`,
    ichId: 'jingxing-lahua',
  },
  {
    id: 'p-jingxing-mudiao',
    name: '井陉木雕',
    location: '井陉县',
    coordinates: [114.15, 38.02],
    count: 2,
    category: '传统美术',
    level: '省级',
    description:
      '家族传承十三代，以 2–5 毫米薄浮雕为独门绝技，取材太行山水与民俗人物，形成厚重质朴的太行风格。',
    image: `${IMG}/bg/mudiao.jpg`,
    ichId: 'jingxing-mudiao',
  },
  {
    id: 'p-taolinping-shehuo',
    name: '桃林坪花脸社火',
    location: '井陉县 · 桃林坪村',
    coordinates: [114.098, 38.062],
    count: 3,
    category: '民俗',
    level: '省级',
    description:
      '距今六百余年的「无声社火」，无唱词、纯武打巡游，全套十六回故事取材三国、水浒等传统演义，正月元宵全村参与。',
    image: `${IMG}/bg/shehuo.jpg`,
    ichId: 'taolinping-shehuo',
  },
  {
    id: 'p-jingxing-jinju',
    name: '井陉晋剧',
    location: '井陉县',
    coordinates: [114.16, 38.045],
    count: 2,
    category: '传统戏剧',
    level: '省级',
    description: '井陉一带流传的地方戏曲，唱腔融合晋剧与本地语音特点，是太行山区戏曲生态的重要组成。',
    image: `${IMG}/bg/sixian.jpg`,
    ichId: 'jingxing-jinju',
  },
  {
    id: 'p-gaocheng-gushi',
    name: '耿村民间故事',
    location: '藁城区 · 耿村',
    coordinates: [114.847, 38.024],
    count: 2,
    category: '民间文学',
    level: '国家级',
    description:
      '被称为「中国民间故事第一村」，村民世代讲古，形成庞大的故事家群体与上千篇口头故事文本库。',
    image: `${IMG}/bg/gushi.jpg`,
    ichId: 'gengcun-gushi',
  },
  {
    id: 'p-gaocheng-gongdeng',
    name: '藁城宫灯',
    location: '藁城区',
    coordinates: [114.86, 38.04],
    count: 2,
    category: '传统技艺',
    level: '省级',
    description: '藁城宫灯制作以竹木做骨架、绢纱糊面，形制端庄喜庆，是北方年节灯彩的代表性品类。',
    image: `${IMG}/bg/jianzhi.jpg`,
    ichId: 'gaocheng-gongdeng',
  },
  {
    id: 'p-wuji-jianzhi',
    name: '无极剪纸',
    location: '无极县',
    coordinates: [114.978, 38.179],
    count: 1,
    category: '传统美术',
    level: '省级',
    description:
      '融合晋地剪纸与杨柳青年画风格，形成女红剪纸、工匠剪纸、文人剪纸三大体系，刀法分阴刻、阳刻、套色、薄剪。',
    image: `${IMG}/bg/jianzhi.jpg`,
    ichId: 'wuji-jianzhi',
  },
  {
    id: 'p-zhaoxian-longpai',
    name: '赵县范庄龙牌会',
    location: '赵县',
    coordinates: [114.776, 37.752],
    count: 2,
    category: '民俗',
    level: '省级',
    description: '范庄一带延续数百年的民间信仰集会，以龙牌巡游、民间花会表演为特色，是冀中平原规模较大的民俗活动。',
    image: `${IMG}/bg/gushi.jpg`,
    ichId: 'zhaoxian-longpai',
  },
  {
    id: 'p-xinji-pitiehua',
    name: '辛集皮贴画',
    location: '辛集市',
    coordinates: [115.218, 37.943],
    count: 1,
    category: '传统美术',
    level: '省级',
    description: '利用皮革边角料剪贴成画，配色沉稳、质感厚实，是皮革之乡衍生出的特色民间美术品类。',
    image: `${IMG}/bg/jianzhi.jpg`,
    ichId: 'xinji-pitiehua',
  },
  {
    id: 'p-zanhuang-tielongdeng',
    name: '赞皇铁龙灯',
    location: '赞皇县',
    coordinates: [114.39, 37.66],
    count: 1,
    category: '传统舞蹈',
    level: '省级',
    description:
      '正月出灯的民间龙灯表演，龙身以铁架为骨、布面彩绘并内置灯盏，多人协作举龙舞动，夜间灯火随龙身起伏。',
    image: `${IMG}/bg/shehuo.jpg`,
    ichId: 'zanhuang-tielongdeng',
  },
  {
    id: 'p-zanhuang-tubu',
    name: '赞皇原村土布纺织技艺',
    location: '赞皇县 · 原村',
    coordinates: [114.386, 37.665],
    count: 1,
    category: '传统技艺',
    level: '国家级',
    description: '完整保留轧花、纺线、浆线、上机织布、染整的手工棉纺织全链条，织出的土布厚实耐磨。',
    image: `${IMG}/bg/fangzhi.jpg`,
    ichId: 'zanhuang-tubu',
  },
  {
    id: 'p-pingshan-minge',
    name: '平山民歌',
    location: '平山县',
    coordinates: [114.199, 38.259],
    count: 1,
    category: '传统音乐',
    level: '省级',
    description: '太行山区民歌的代表，曲调高亢悠长，内容多反映山区劳作、爱情与革命历史记忆。',
    image: `${IMG}/bg/gushi.jpg`,
    ichId: 'pingshan-minge',
  },
  {
    id: 'p-shenze-zhuizi',
    name: '深泽坠子戏',
    location: '深泽县',
    coordinates: [115.201, 38.184],
    count: 1,
    category: '传统戏剧',
    level: '省级',
    description: '由坠子说唱发展而来的地方戏曲，唱腔婉转、说唱结合，流行于滹沱河一带的乡村舞台。',
    image: `${IMG}/bg/sixian.jpg`,
    ichId: 'shenze-zhuizi',
  },
  {
    id: 'p-xinle-fuxi',
    name: '新乐伏羲祭典',
    location: '新乐市',
    coordinates: [114.684, 38.343],
    count: 1,
    category: '民俗',
    level: '省级',
    description: '依托伏羲台举行的大型民间祭祀与庙会活动，包含祭祀礼仪、民间花会与商贸集会。',
    image: `${IMG}/bg/gushi.jpg`,
    ichId: 'xinle-fuxi',
  },
  {
    id: 'p-shijiazhuang-sixian',
    name: '石家庄丝弦',
    location: '石家庄市区',
    coordinates: [114.514, 38.042],
    count: 3,
    category: '传统戏剧',
    level: '国家级',
    description:
      '由元明俗曲发展而来的地方剧种，唱腔以真声为主、句尾翻高，代表剧目有《空印盒》《白罗衫》《杨门女将》等。',
    image: `${IMG}/bg/sixian.jpg`,
    ichId: 'shijiazhuang-sixian',
  },
  {
    id: 'p-shijiazhuang-niangjiu',
    name: '石家庄酒酿造技艺',
    location: '石家庄市区',
    coordinates: [114.52, 38.06],
    count: 1,
    category: '传统技艺',
    level: '省级',
    description: '以太行山高粱为原料、本地小麦制大曲，采用老五甑、泥池老窖、固态续茬发酵古法酿造。',
    image: `${IMG}/bg/niangjiu.jpg`,
    ichId: 'shijiazhuang-niangjiu',
  },
];

/**
 * 点位归属的行政区（与 /geo/shijiazhuang.json 中的区县名称一致）
 * 石家庄市区内的点位统一归入「长安区」，便于在行政区划图上聚合
 */
export function districtOf(point: MapPoint): string {
  const key = point.location.split(' · ')[0];
  if (key === '石家庄市区') return '长安区';
  return key;
}

/** 按行政区聚合资源数量，用于行政区划图填色 */
export function countByDistrict(): { district: string; count: number }[] {
  const map = new Map<string, number>();
  mapPoints.forEach((point) => {
    const key = districtOf(point);
    map.set(key, (map.get(key) ?? 0) + point.count);
  });
  return Array.from(map.entries()).map(([district, count]) => ({ district, count }));
}
