/**
 * 石家庄非遗项目数据
 *
 * 数据来源：用户提供的《非遗项目.zip》素材包 + 公开资料整理。
 * - A~E 五项素材包文件夹标注为【国家级】，F~J 结合文档内容整理为省级项目；
 * - 若与官方最新公布名录不一致，直接修改本文件即可，页面会自动同步。
 */

export type IchLevel = '国家级' | '省级';

export interface IchFact {
  label: string;
  value: string;
}

export interface IchSignificance {
  title: string;
  text: string;
}

export interface IchVideo {
  src: string;
  poster: string;
  title: string;
}

export interface IchItem {
  /** 路由 id，/heritage/[id] */
  id: string;
  name: string;
  alias?: string;
  level: IchLevel;
  /** 分类：传统舞蹈 / 传统音乐 / 民间文学 / 传统戏剧 / 传统美术 / 传统技艺 / 民俗 / 传统体育 */
  category: string;
  /** 所属县市区，用于文化地图 */
  region: string;
  /** [经度, 纬度] */
  coordinates: [number, number];
  /** 列入名录信息 */
  listed?: string;
  /** 首页卡片一句话亮点 */
  highlight: string;
  /** 图片说明（用于暂无实拍素材的项目，页面会显示提示） */
  imageNote?: string;
  cover: string;
  gallery: string[];
  /** 素材包中的 AI 共创图（用于「AI 共创作品」板块） */
  aiWorks: string[];
  videos: IchVideo[];
  summary: string;
  background: string[];
  reason: string[];
  significance: IchSignificance[];
  inheritance: string;
  facts: IchFact[];
  tags: string[];
  source: string;
}

const IMG = '/ich';

export const ichList: IchItem[] = [
  {
    id: 'jingxing-lahua',
    name: '井陉拉花',
    alias: '拉花',
    level: '国家级',
    category: '传统舞蹈',
    region: '井陉县',
    coordinates: [114.145, 38.032],
    listed: '第一批国家级非物质文化遗产代表性项目名录（2006 年）',
    highlight: '太行山下的民间舞蹈活化石，拧肩翻腕间藏着燕赵人的喜怒哀乐。',
    cover: `${IMG}/jingxing-lahua/cover.jpg`,
    gallery: [
      `${IMG}/jingxing-lahua/g1.jpg`,
      `${IMG}/jingxing-lahua/g2.jpg`,
      `${IMG}/jingxing-lahua/g3.jpg`,
      `${IMG}/jingxing-lahua/g4.jpg`,
    ],
    aiWorks: [
      `${IMG}/jingxing-lahua/ai1.jpg`,
      `${IMG}/jingxing-lahua/ai2.jpg`,
      `${IMG}/jingxing-lahua/ai3.jpg`,
    ],
    videos: [
      {
        src: `${IMG}/jingxing-lahua/video.mp4`,
        poster: `${IMG}/jingxing-lahua/cover.jpg`,
        title: '井陉拉花 · 现场影像',
      },
    ],
    summary:
      '井陉拉花是流传于井陉县的民间舞蹈，以「拧肩、扭臂、翻腕、吸腿、撇脚」为核心动作语汇，刚柔并济、悲喜相生，被誉为「太行山区的民间舞蹈化石」。',
    background: [
      '井陉地处太行山东麓，是太行八陉之一，自古为冀晋通衢，商旅往来与庙会社火为民间歌舞提供了丰厚的生存土壤。',
      '拉花最初与花会、庙会祭祀、祈雨拜神等民俗活动相连，旧时贫苦艺人以「拉花卖艺」谋生，逐渐形成东南正、庄旺、南固底等风格各异的分支流派。',
      '随着花会游演走向舞台，拉花从街头走向专业院团与校园课堂，成为正月花会、节庆展演中的核心节目。',
    ],
    reason: [
      '动作语汇自成体系：「上身拧、下身稳、腕花翻、步法撇」，在全国民间舞蹈中辨识度极高。',
      '音乐伴奏以《腊梅花》《万年欢》等民间曲牌为骨干，锣鼓、唢呐与舞蹈调度咬合紧密。',
      '城镇化推进后，愿意长期学艺的年轻人减少，传统套路与曲牌存在流失风险，需要抢救性保护。',
    ],
    significance: [
      { title: '民俗价值', text: '拉花依托庙会、花会而活，是井陉乡土节庆的仪式性表达，承载着百姓祈福纳祥的愿望。' },
      { title: '艺术价值', text: '独特的拧、扭、翻、撇动作构成完整的民间舞蹈语言，为当代舞蹈创作提供直接素材。' },
      { title: '传播价值', text: '形象鲜明、视觉冲击强，适合短视频与舞台化改编，是河北对外文化交流的亮眼名片。' },
    ],
    inheritance:
      '井陉拉花以村落社火队和家族、师徒授艺为主要传承方式，近年来通过非遗进校园、县级传习所与专业院团合作培养新人。（素材包未附具体传承人名单，可在后台补录）',
    facts: [
      { label: '名录级别', value: '国家级（2006 年首批）' },
      { label: '项目类别', value: '传统舞蹈' },
      { label: '流行区域', value: '石家庄市井陉县' },
      { label: '标志动作', value: '拧肩 · 扭臂 · 翻腕 · 吸腿 · 撇脚' },
    ],
    tags: ['传统舞蹈', '井陉', '国家级', '花会', '民间曲牌'],
    source: '公开资料整理（素材包内含实图与 AI 共创图）',
  },
  {
    id: 'changshan-zhangu',
    name: '常山战鼓',
    alias: '常山战鼓（正定）',
    level: '国家级',
    category: '传统音乐',
    region: '正定县',
    coordinates: [114.57, 38.146],
    listed: '第二批国家级非物质文化遗产代表性项目名录（2008 年）',
    highlight: '与威风锣鼓、太平鼓、开封盘鼓并称中国四大名鼓的燕赵鼓乐。',
    cover: `${IMG}/changshan-zhangu/cover.jpg`,
    gallery: [`${IMG}/changshan-zhangu/g1.jpg`, `${IMG}/changshan-zhangu/g2.jpg`],
    aiWorks: [
      `${IMG}/changshan-zhangu/ai1.jpg`,
      `${IMG}/changshan-zhangu/ai2.jpg`,
      `${IMG}/changshan-zhangu/ai3.jpg`,
    ],
    videos: [
      {
        src: `${IMG}/changshan-zhangu/video.mp4`,
        poster: `${IMG}/changshan-zhangu/cover.jpg`,
        title: '常山战鼓 · 现场影像',
      },
    ],
    summary:
      '常山战鼓流传于正定县，2008 年列入第二批国家级非遗名录，与山西威风锣鼓、兰州太平鼓、开封盘鼓并称中国四大名鼓。鼓手边击边舞，鼓钹翻飞，是燕赵尚武气质最直接的声音表达。',
    background: [
      '正定古称常山郡，是三国名将赵云（赵子龙）的故里，战鼓之名也由此而来。',
      '其雏形早在战国时期就已出现，最初是古代军队作战的军鼓，用于擂鼓助威、鼓舞士气，相传赵子龙出征即以战鼓激励将士。',
      '宋元时期正定是北方演艺重镇，战鼓表演趋于成熟；明代全面兴盛，从军营走入民间，用于庙会、春节社火与节庆祭祀。《正定县志》记载当时「城市村墟，锣鼓无虚日」。',
    ],
    reason: [
      '属于民间广场打击乐，乐器由大鼓、大钹、中钹、小钹、小锣组成，表演少则数十人、多可达数百人。',
      '鼓手一边敲击一边舞蹈，腾挪跳跃、鼓钹翻飞，队形不断变换，共有 9 系 72 套传统鼓谱套路，全靠口传心授，没有书面乐谱。',
      '鼓声雄浑激昂、铿锵磅礴，代表燕赵儿女慷慨豪迈、忠勇刚毅的精神气质，是区域性鼓乐的代表性样本。',
    ],
    significance: [
      { title: '民俗价值', text: '过去多用于庙会、年节花会，如今登上亚运会、奥运会等大型舞台，是民俗庆典与大型演出的双重载体。' },
      { title: '精神价值', text: '鼓点即号令，承载着燕赵尚武文化中的集体意志与忠勇品格。' },
      { title: '文旅价值', text: '气势磅礴、易于结队展演，是正定古城文旅演艺与研学体验的核心内容。' },
    ],
    inheritance:
      '以正定战鼓队、村落花会组织为主体，依靠老鼓手口传心授 9 系 72 套鼓谱，近年通过「非遗进校园」「鼓乐大赛」吸纳青少年学员。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '国家级（2008 年第二批）' },
      { label: '项目类别', value: '传统音乐 · 民间广场打击乐' },
      { label: '流行区域', value: '石家庄市正定县' },
      { label: '传统套路', value: '9 系 72 套鼓谱' },
    ],
    tags: ['传统音乐', '正定', '国家级', '鼓乐', '四大名鼓'],
    source: '素材包《常山战鼓背景.doc》整理 + 实拍影像',
  },
  {
    id: 'gengcun-gushi',
    name: '耿村民间故事',
    alias: '耿村故事',
    level: '国家级',
    category: '民间文学',
    region: '藁城区',
    coordinates: [114.847, 38.024],
    listed: '第一批国家级非物质文化遗产代表性项目名录（2006 年）',
    highlight: '「中国民间故事第一村」，一个村庄就是一个巨大的口头故事库。',
    cover: `${IMG}/gengcun-gushi/cover.jpg`,
    gallery: [`${IMG}/gengcun-gushi/g1.jpg`],
    aiWorks: [`${IMG}/gengcun-gushi/ai1.jpg`, `${IMG}/gengcun-gushi/ai2.jpg`],
    videos: [
      {
        src: `${IMG}/gengcun-gushi/video.mp4`,
        poster: `${IMG}/gengcun-gushi/cover.jpg`,
        title: '耿村民间故事 · 现场影像',
      },
    ],
    summary:
      '耿村位于藁城区，村民世代以「讲古」为乐，形成了庞大的故事家群体与数量惊人的口头故事库，被学界称为「中国民间故事第一村」，2006 年列入首批国家级非遗名录。',
    background: [
      '耿村地处冀中平原交通要道，历史上集市、庙会繁盛，南来北往的说书人与商旅在此停留，逐渐养成村民爱听故事、爱讲故事的风气。',
      '故事题材覆盖神话传说、历史演义、生活笑话、寓言谚语以及近现代的抗战记忆，几乎涵盖民间口头文学的全部门类。',
      '20 世纪后期，民间文学研究者对耿村进行系统普查，整理出上千篇故事文本，「故事村」由此进入学界与公众视野。',
    ],
    reason: [
      '它是一个仍然「活着」的口头文学社区：故事不写在纸上，而储存在村民的记忆与日常讲述中。',
      '故事家群体庞大且代际传承清晰，是研究民间叙事、方言表达和乡土伦理的珍贵样本。',
      '电视与手机普及后，围坐听故事的生活场景减少，年轻讲述者稀缺，口头传承面临断层。',
    ],
    significance: [
      { title: '文学价值', text: '为民间文学研究提供了连续的、可对照的口头文本，是「活态文本库」。' },
      { title: '民俗价值', text: '故事承载着冀中乡村的伦理观念、生活智慧与集体记忆。' },
      { title: '教育价值', text: '适合转化为儿童阅读、乡土教材与有声内容，是民间美育的天然素材。' },
    ],
    inheritance:
      '耿村以「故事家」为核心组织传承，通过故事会、故事比赛、故事进校园等方式延续讲述传统。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '国家级（2006 年首批）' },
      { label: '项目类别', value: '民间文学' },
      { label: '流行区域', value: '石家庄市藁城区耿村' },
      { label: '别称', value: '中国民间故事第一村' },
    ],
    tags: ['民间文学', '藁城', '国家级', '故事村', '口述传统'],
    source: '公开资料整理（素材包内含实图、AI 共创图与影像）',
  },
  {
    id: 'shijiazhuang-sixian',
    name: '石家庄丝弦',
    alias: '弦子腔 · 弦索腔',
    level: '国家级',
    category: '传统戏剧',
    region: '石家庄市区',
    coordinates: [114.514, 38.042],
    listed: '第一批国家级非物质文化遗产代表性项目名录（2006 年）',
    highlight: '由元明俗曲发展而来的地方剧种，唱腔翻高、乡土味浓。',
    cover: `${IMG}/shijiazhuang-sixian/cover.jpg`,
    gallery: [
      `${IMG}/shijiazhuang-sixian/g1.jpg`,
      `${IMG}/shijiazhuang-sixian/g2.jpg`,
      `${IMG}/shijiazhuang-sixian/g3.jpg`,
    ],
    aiWorks: [
      `${IMG}/shijiazhuang-sixian/ai1.jpg`,
      `${IMG}/shijiazhuang-sixian/ai2.jpg`,
      `${IMG}/shijiazhuang-sixian/ai3.jpg`,
      `${IMG}/shijiazhuang-sixian/ai4.jpg`,
    ],
    videos: [
      {
        src: `${IMG}/shijiazhuang-sixian/video.mp4`,
        poster: `${IMG}/shijiazhuang-sixian/cover.jpg`,
        title: '石家庄丝弦 · 舞台影像',
      },
    ],
    summary:
      '石家庄丝弦又名弦子腔、弦索腔，因以弦索乐器伴奏而得名，由元明俗曲演变而来，唱腔以真声为主、句尾常翻高八度，是石家庄最具代表性的地方戏曲声腔。',
    background: [
      '丝弦的声腔源于元明时期的俗曲小令，清代中后期在正定、石家庄一带盛行，并形成不同地域风格。',
      '行当齐全，生、旦、净、末、丑各有程式，剧目多取材民间传说与历史演义，唱白通俗，贴近百姓生活。',
      '代表剧目包括《空印盒》《白罗衫》《赶女婿》《杨门女将》等，其中《空印盒》曾进京演出并产生广泛影响。',
    ],
    reason: [
      '声腔体系独特，讲究「九腔十八调」，唱腔与方言咬合紧密，是研究河北地方戏曲声腔演变的关键样本。',
      '板胡、笛、笙等主奏乐器与锣鼓经配合，形成高亢激越、跌宕起伏的剧种风格。',
      '观众老龄化、班社与演员减少，传统剧目与程式面临失传风险，需要活态保护。',
    ],
    significance: [
      { title: '戏曲价值', text: '保留了大量传统剧目与程式，是河北地方戏曲生态的重要组成部分。' },
      { title: '方言文化价值', text: '唱白中保存了石家庄一带的方言语音与民间语汇。' },
      { title: '当代转化价值', text: '近年通过与现代剧目、短视频折子戏结合，吸引年轻观众走进剧场。' },
    ],
    inheritance:
      '以专业院团（石家庄市丝弦剧团）与民间班社双轨传承，通过折子戏复排、青年演员培养、戏曲进校园延续剧种生命。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '国家级（2006 年首批）' },
      { label: '项目类别', value: '传统戏剧' },
      { label: '流行区域', value: '石家庄市及周边县市' },
      { label: '代表剧目', value: '《空印盒》《白罗衫》《杨门女将》' },
    ],
    tags: ['传统戏剧', '石家庄', '国家级', '丝弦', '地方剧种'],
    source: '公开资料整理（素材包内含剧照、AI 共创图与影像）',
  },
  {
    id: 'zanhuang-tubu',
    name: '赞皇县原村土布纺织技术',
    alias: '原村土布',
    level: '国家级',
    category: '传统技艺',
    region: '赞皇县',
    coordinates: [114.386, 37.665],
    highlight: '从轧花、纺线到上机织布，一条完整的手工棉纺织生产链。',
    cover: `${IMG}/zanhuang-tubu/cover.jpg`,
    gallery: [
      `${IMG}/zanhuang-tubu/g1.jpg`,
      `${IMG}/zanhuang-tubu/g2.jpg`,
      `${IMG}/zanhuang-tubu/g3.jpg`,
      `${IMG}/zanhuang-tubu/g4.jpg`,
    ],
    aiWorks: [`${IMG}/zanhuang-tubu/ai1.jpg`, `${IMG}/zanhuang-tubu/ai2.jpg`],
    videos: [
      {
        src: `${IMG}/zanhuang-tubu/video.mp4`,
        poster: `${IMG}/zanhuang-tubu/cover.jpg`,
        title: '原村土布纺织技艺 · 工艺影像',
      },
    ],
    summary:
      '赞皇县原村保存着完整的纯手工棉纺织技艺，从轧花、弹花、搓棉条、纺线、拐线、浆线到上机织布、染整，一道道工序全部依靠手工完成，织出的土布厚实耐磨、纹理清晰。',
    background: [
      '原村地处太行山东麓浅山区，历史上家家种棉、户户纺线，「男耕女织」是延续数百年的生活图景。',
      '手工织布使用老式木织机，经纬线的松紧、踏板与投梭的节奏全靠手感判断，一匹布往往需要数日甚至更长时间。',
      '机械化纺织冲击下，手工织布一度中断，近年由返乡创业者带领村里妇女恢复生产，并开发床品、服饰、文创等新产品。',
    ],
    reason: [
      '工序完整：保留从原料加工到成品染整的全链条手工技艺，是华北手工棉纺织的典型样本。',
      '技艺依赖长期经验积累，老织机操作、经纬密度控制等关键环节难以被机械完全替代。',
      '织者老龄化明显，年轻一代掌握全套工序的人数有限，需要系统性记录与传习。',
    ],
    significance: [
      { title: '技艺价值', text: '保存了华北手工棉纺织的完整操作体系与工具谱系。' },
      { title: '生活史价值', text: '土布是几代华北农民的生活记忆，记录着乡村劳作与审美。' },
      { title: '产业价值', text: '以合作社 + 工坊的方式实现非遗活化，带动乡村妇女就近就业。' },
    ],
    inheritance:
      '以村内织布工坊与合作社为主体，老带新、手把手教习上机与织造，并面向游客开展体验课程。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '国家级' },
      { label: '项目类别', value: '传统技艺 · 传统棉纺织' },
      { label: '流行区域', value: '石家庄市赞皇县原村' },
      { label: '主要工序', value: '轧花 · 纺线 · 浆线 · 织布 · 染整' },
    ],
    tags: ['传统技艺', '赞皇', '土布', '手工纺织', '乡村振兴'],
    source: '公开资料整理（素材包内含工艺实拍、AI 共创图与影像）',
  },
  {
    id: 'wuji-jianzhi',
    name: '无极剪纸',
    level: '省级',
    category: '传统美术',
    region: '无极县',
    coordinates: [114.978, 38.179],
    listed: '河北省第一批省级非物质文化遗产名录（2006 年）',
    highlight: '融合晋地剪纸与杨柳青年画风格，刀法分阴阳、题材接地气。',
    cover: `${IMG}/wuji-jianzhi/cover.jpg`,
    gallery: [
      `${IMG}/wuji-jianzhi/g1.jpg`,
      `${IMG}/wuji-jianzhi/g2.jpg`,
      `${IMG}/wuji-jianzhi/g3.jpg`,
      `${IMG}/wuji-jianzhi/g4.jpg`,
      `${IMG}/wuji-jianzhi/g5.jpg`,
      `${IMG}/wuji-jianzhi/g6.jpg`,
    ],
    aiWorks: [
      `${IMG}/wuji-jianzhi/ai1.png`,
      `${IMG}/wuji-jianzhi/ai2.png`,
      `${IMG}/wuji-jianzhi/ai3.png`,
    ],
    videos: [
      {
        src: `${IMG}/wuji-jianzhi/video.mp4`,
        poster: `${IMG}/wuji-jianzhi/cover.jpg`,
        title: '无极剪纸 · 技艺影像',
      },
    ],
    summary:
      '无极剪纸起源于明末清初、盛行于清代，是冀中平原代表性民间剪纸艺术，融合晋地剪纸与杨柳青年画风格，形成女红剪纸、工匠剪纸、文人剪纸三大体系，2006 年列入河北省第一批省级非遗名录。',
    background: [
      '古时每逢春节、婚嫁、祝寿等民俗活动，百姓剪制窗花、灯花、彩符装点生活，世代口传手教，在无极县广泛流传。',
      '代表艺人杨素苗、赵陟留下大量经典作品，推动无极剪纸形成完整的技法体系。',
      '技法上包含阴刻、阳刻、套色、薄剪等独特刀法，红色剪纸与花鸟纹样辨识度极高。',
    ],
    reason: [
      '无极剪纸拥有独立成熟的民间艺术体系，技法独特、谱系清晰，题材扎根冀中乡土生活，是华北中部平原剪纸文化的典型代表。',
      '它完整保留了传统民俗中剪纸的应用场景，承载地方民众的审美与情感表达。',
      '在现代化冲击下，传统剪纸的生存空间不断萎缩，老艺人逐年减少，技艺面临失传风险，需要抢救性保护。',
    ],
    significance: [
      { title: '民俗价值', text: '婚丧节庆都依靠剪纸传递祈福、吉祥的文化寓意，记录当地百姓千百年来的生活习俗。' },
      { title: '艺术价值', text: '独特的刀法与构图丰富中国民间美术，视觉符号可提取用于文创与舞台美术。' },
      { title: '文化传承', text: '承载燕赵乡土审美，是民间美育的活教材，可通过文创转化带动地方文化产业。' },
    ],
    inheritance:
      '历史上以家庭内「女红传授」为主，近代通过工坊带徒、剪纸协会与校园课程扩大传承面；史料记载的代表艺人为杨素苗、赵陟。',
    facts: [
      { label: '名录级别', value: '省级（2006 年首批）' },
      { label: '项目类别', value: '传统美术' },
      { label: '流行区域', value: '石家庄市无极县' },
      { label: '代表技法', value: '阴刻 · 阳刻 · 套色 · 薄剪' },
    ],
    tags: ['传统美术', '无极', '剪纸', '窗花', '文创'],
    source: '素材包《无极剪纸.docx》整理',
  },
  {
    id: 'taolinping-shehuo',
    name: '桃林坪花脸社火',
    alias: '花脸社火',
    level: '省级',
    category: '民俗',
    region: '井陉县',
    coordinates: [114.098, 38.062],
    highlight: '没有唱词的「无声社火」，靠脸谱与身段识别人物故事。',
    cover: `${IMG}/taolinping-shehuo/cover.jpg`,
    gallery: [
      `${IMG}/taolinping-shehuo/g1.png`,
      `${IMG}/taolinping-shehuo/g3.png`,
      `${IMG}/taolinping-shehuo/g5.jpg`,
      `${IMG}/taolinping-shehuo/g7.jpg`,
      `${IMG}/taolinping-shehuo/g9.jpg`,
      `${IMG}/taolinping-shehuo/g10.jpg`,
      `${IMG}/taolinping-shehuo/g11.jpg`,
      `${IMG}/taolinping-shehuo/g6.jpg`,
    ],
    aiWorks: [
      `${IMG}/taolinping-shehuo/ai1.png`,
      `${IMG}/taolinping-shehuo/ai2.png`,
      `${IMG}/taolinping-shehuo/ai3.png`,
    ],
    videos: [
      {
        src: `${IMG}/taolinping-shehuo/video.mp4`,
        poster: `${IMG}/taolinping-shehuo/cover.jpg`,
        title: '桃林坪花脸社火 · 巡游影像',
      },
    ],
    summary:
      '桃林坪花脸社火流传于井陉县桃林坪村，距今六百余年。它起源于村民纪念古代将士保境卫国的战斗，以无唱词、纯武打巡游表演为特色，全套共十六回故事，取材三国、水浒等传统历史演义。',
    background: [
      '艺人使用祖传秘方配制脸谱颜料，穿戴仿古将士服饰，手持刀枪剑戟，在锣鼓伴奏下巡游展演。',
      '正月元宵期间全村参与，古时还曾作为皇纲护卫社火，形成了严密的组织与传承体系。',
      '它是太行山地区独有的「无声社火」，不靠唱腔，仅凭脸谱、武打身段识别人物与故事。',
    ],
    reason: [
      '融合武术、民俗、服饰彩绘、民间打击乐等多种艺术门类，民俗样本稀缺。',
      '传承依靠村内世代相传，属于集体性民俗仪式，组织形态与仪式流程具有研究价值。',
      '城市化冲击下，年轻人外出务工，完整的全套回目、古法脸谱绘制技艺面临断层。',
    ],
    significance: [
      { title: '历史民俗价值', text: '保留古代战争纪念、迎春祭祀、驱邪祈福的乡土仪式，是研究太行山区民间信仰与乡村社群文化的活化石。' },
      { title: '精神凝聚价值', text: '全村老少共同参与，增强村落凝聚力，传递忠义、勇武、保家卫国的传统价值观。' },
      { title: '艺术展演价值', text: '脸谱、服饰、武打场面视觉冲击力强，是太行山文旅标志性表演，可带动民俗展演与研学活动。' },
    ],
    inheritance:
      '以村社火会为组织核心，脸谱绘制、武打套路由村中老艺人分角色带徒传授，每年正月集中排练展演。（素材包未附具体传承人名单）',
    facts: [
      { label: '流传时间', value: '距今六百余年' },
      { label: '项目类别', value: '民俗 · 民间社火' },
      { label: '流行区域', value: '石家庄市井陉县桃林坪村' },
      { label: '演出时间', value: '正月元宵期间巡游展演' },
    ],
    tags: ['民俗', '井陉', '社火', '脸谱', '巡游'],
    source: '素材包《桃林坪花脸社火.docx》整理',
  },
  {
    id: 'zhengding-gaozhao',
    name: '正定高照',
    alias: '中幡',
    level: '省级',
    category: '传统体育、游艺与杂技',
    region: '正定县',
    coordinates: [114.58, 38.152],
    highlight: '最重可达 72 公斤的幡杆，在头、肩、肘、手之间腾挪不倒。',
    cover: `${IMG}/zhengding-gaozhao/cover.jpg`,
    gallery: [
      `${IMG}/zhengding-gaozhao/g1.jpg`,
      `${IMG}/zhengding-gaozhao/g2.jpg`,
      `${IMG}/zhengding-gaozhao/g3.jpg`,
      `${IMG}/zhengding-gaozhao/g4.jpg`,
    ],
    aiWorks: [
      `${IMG}/zhengding-gaozhao/ai1.png`,
      `${IMG}/zhengding-gaozhao/ai2.png`,
      `${IMG}/zhengding-gaozhao/ai3.png`,
    ],
    videos: [
      {
        src: `${IMG}/zhengding-gaozhao/video.mp4`,
        poster: `${IMG}/zhengding-gaozhao/cover.jpg`,
        title: '正定高照 · 现场影像一',
      },
      {
        src: `${IMG}/zhengding-gaozhao/video2.mp4`,
        poster: `${IMG}/zhengding-gaozhao/g2.jpg`,
        title: '正定高照 · 现场影像二',
      },
    ],
    summary:
      '正定高照又称中幡，流传百余年，源自古代皇家仪仗幡旗技艺，后传入正定民间，成为正定花会的核心项目。道具为巨型长竹竿幡，最重可达 72 公斤，竿上装饰花伞、彩旗、雉鸡翎。',
    background: [
      '表演者依靠头、肩、肘、手承接幡杆，完成旱地拔葱、托塔、二郎担山等数十套高难度套路。',
      '庙会、春节花会时在锣鼓伴奏下轮番上场表演，惊险热闹，是正定古城的标志性民间杂技项目。',
      '「高照」寓意吉星高照，寄托百姓祈求五谷丰登、平安顺遂的美好愿望。',
    ],
    reason: [
      '高照是北方中幡技艺的重要分支，形成正定独有的表演套路与道具形制，集力量、平衡、杂技造型于一体，是北方民间花会杂技的典范。',
      '该技艺对身体素质要求极高，训练艰苦、学习周期漫长，愿意潜心练习的年轻人越来越少。',
      '表演套路存在流失风险，需要纳入非遗保护体系进行抢救与记录。',
    ],
    significance: [
      { title: '民俗文化价值', text: '是北方庙会、迎春庆典的重要仪式表演，承载祈福纳祥的公共情感。' },
      { title: '体育杂技价值', text: '展现中华民族不畏艰难、坚韧拼搏的精神，为中国民间杂技史提供重要的实物与表演样本。' },
      { title: '文旅价值', text: '惊险震撼的舞台效果适配大型节庆演出，是正定古城文化名片，活化古城民俗文化。' },
    ],
    inheritance:
      '以花会队伍与家族传授为主，靠长年体能训练与套路拆解教学延续技艺，近年进入景区常态化演出。（素材包未附具体传承人名单）',
    facts: [
      { label: '项目类别', value: '传统体育、游艺与杂技' },
      { label: '流行区域', value: '石家庄市正定县' },
      { label: '道具重量', value: '最重可达 72 公斤' },
      { label: '代表套路', value: '旱地拔葱 · 托塔 · 二郎担山' },
    ],
    tags: ['杂技', '正定', '中幡', '花会', '古城'],
    source: '素材包《正定高照.docx》整理',
  },
  {
    id: 'jingxing-mudiao',
    name: '井陉木雕',
    level: '省级',
    category: '传统美术',
    region: '井陉县',
    coordinates: [114.15, 38.02],
    listed: '河北省省级非物质文化遗产名录（2019 年）',
    highlight: '能在 2–5 毫米薄木料上雕刻的「薄浮雕」独门绝技。',
    cover: `${IMG}/jingxing-mudiao/cover.jpg`,
    gallery: [
      `${IMG}/jingxing-mudiao/g1.jpg`,
      `${IMG}/jingxing-mudiao/g2.jpg`,
      `${IMG}/jingxing-mudiao/g3.jpg`,
      `${IMG}/jingxing-mudiao/g4.jpg`,
      `${IMG}/jingxing-mudiao/g5.jpg`,
      `${IMG}/jingxing-mudiao/g6.jpg`,
      `${IMG}/jingxing-mudiao/g7.jpg`,
    ],
    aiWorks: [`${IMG}/jingxing-mudiao/ai1.png`, `${IMG}/jingxing-mudiao/ai2.png`],
    videos: [
      {
        src: `${IMG}/jingxing-mudiao/video.mp4`,
        poster: `${IMG}/jingxing-mudiao/cover.jpg`,
        title: '井陉木雕 · 技艺影像',
      },
    ],
    summary:
      '井陉木雕起源于清代康熙年间，至今三百多年，家族传承十三代，扎根太行山区。以薄浮雕为独门绝技，可在 2–5 毫米薄木料上雕刻，同时融合深浮雕、圆雕、镂空透雕，2019 年列入河北省省级非遗名录。',
    background: [
      '原料多选用本地太行崖柏、槐木，题材以太行山水、民俗人物、花鸟瑞兽为主。',
      '刀凿讲究气韵，追求「造韵而非单纯刻形」，形成区别于江南木雕的厚重质朴的太行风格。',
      '技艺依靠家族师徒口传手授，没有标准化文字记录，关键经验存在于匠人的手感之中。',
    ],
    reason: [
      '井陉木雕拥有华北地区少见的薄浮雕独门技法，是极具特色的北方山区木雕技艺。',
      '依托太行本土木材资源，形成地域辨识度鲜明的工艺体系，丰富中国木雕艺术谱系。',
      '现代工业化雕刻冲击下，手工雕刻耗时长、收益低，古法刀工与木料辨识经验容易失传。',
    ],
    significance: [
      { title: '工艺价值', text: '保留北方山区木雕的独特技法，薄浮雕丰富了中国木雕艺术体系。' },
      { title: '地域文化价值', text: '作品取材太行风光与民间故事，记录太行山百姓的审美与生活。' },
      { title: '产业价值', text: '可开发摆件、文创首饰、装饰雕刻等产品，带动乡村手工艺与文旅产业。' },
    ],
    inheritance:
      '以家族十三代传承为主线，师徒制传授选料、开坯、打坯、修光等工序，近年通过工作室与研学课程扩大影响。（素材包未附具体传承人姓名）',
    facts: [
      { label: '名录级别', value: '省级（2019 年）' },
      { label: '项目类别', value: '传统美术 · 雕刻' },
      { label: '流行区域', value: '石家庄市井陉县' },
      { label: '独门绝技', value: '2–5 毫米薄浮雕' },
    ],
    tags: ['传统美术', '井陉', '木雕', '薄浮雕', '崖柏'],
    source: '素材包《井陉木雕.docx》整理',
  },
  {
    id: 'shijiazhuang-niangjiu',
    name: '石家庄酒酿造技艺',
    alias: '老五甑酿造',
    level: '省级',
    category: '传统技艺',
    region: '石家庄市区',
    coordinates: [114.52, 38.06],
    highlight: '老五甑、泥池老窖、固态续茬发酵，一坛酒里有两千年的北方酒脉。',
    cover: `${IMG}/shijiazhuang-niangjiu/cover.jpg`,
    gallery: [`${IMG}/shijiazhuang-niangjiu/g1.png`, `${IMG}/shijiazhuang-niangjiu/g2.jpg`],
    aiWorks: [
      `${IMG}/shijiazhuang-niangjiu/ai1.png`,
      `${IMG}/shijiazhuang-niangjiu/ai2.png`,
      `${IMG}/shijiazhuang-niangjiu/ai3.png`,
    ],
    videos: [
      {
        src: `${IMG}/shijiazhuang-niangjiu/video.mp4`,
        poster: `${IMG}/shijiazhuang-niangjiu/cover.jpg`,
        title: '石家庄酒酿造技艺 · 工艺影像',
      },
    ],
    summary:
      '石家庄酿酒文化底蕴深厚，平山中山王墓出土的古酒实物佐证了本地悠久的酿酒历史。技艺以太行山优质高粱为原料，本地小麦制大曲，采用老五甑、泥池老窖、固态续茬发酵古法，历经蒸粮、拌曲、发酵、缓火蒸馏、分段摘酒、陶坛陈贮、勾调等多道工序。',
    background: [
      '整套工艺依靠师徒口传心授，温度、窖池、酒质的判断全靠匠人经验。',
      '近代石家庄公营酿酒厂是新中国第一家公营酒厂，曾作为西柏坡时期招待用酒、开国大典宴会用酒。',
      '技艺兼具千年古法与红色文化底色，是石家庄传统技艺类非遗的代表项目之一。',
    ],
    reason: [
      '整套固态老五甑酿造技艺依靠自然微生物发酵，很多经验无法用现代工业仪器完全替代，是华北地区典型的北方大曲固态酿造体系。',
      '传统酿造依赖匠人对温度、窖池、酒质的经验判断，传承人需要长期积累。',
      '现代工业化白酒生产模式挤压传统古法酿造生存空间，整套传统工序、窖池养护、摘酒勾调经验存在失传风险。',
    ],
    significance: [
      { title: '技艺与酒文化价值', text: '保存华北本土固态蒸馏酿酒古法，填补河北地方传统白酒技艺的传承脉络，见证北方农耕文明的酿酒传统。' },
      { title: '历史红色价值', text: '承载晋察冀边区红色历史记忆，是石家庄红色文化与本土传统工艺结合的独特文化资源。' },
      { title: '经济文旅价值', text: '可打造酒文化博物馆、窖藏观光、体验酿造研学项目，以传统技艺赋能本土品牌。' },
    ],
    inheritance:
      '以酒厂老技师「师带徒」方式传承，关键工段（制曲、装甑、摘酒）由经验丰富的匠人带教，并建有窖池参观与研学动线。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '省级' },
      { label: '项目类别', value: '传统技艺 · 蒸馏酒酿造' },
      { label: '流行区域', value: '石家庄市及平山、鹿泉一带' },
      { label: '核心工序', value: '老五甑 · 泥池老窖 · 固态续茬发酵' },
    ],
    tags: ['传统技艺', '石家庄', '酿酒', '老五甑', '红色文化'],
    source: '素材包《石家庄酒酿造技艺.docx》整理',
  },

  // ============================================================
  // 以下 8 项为本次新增（素材包内没有对应图片，封面使用同类非遗场景示意图，
  // 并在页面标注「暂无实拍素材」；名录等级与批次以官方公布为准）
  // ============================================================
  {
    id: 'gaocheng-gongdeng',
    name: '藁城宫灯',
    alias: '宫灯制作技艺',
    level: '省级',
    category: '传统技艺',
    region: '藁城区',
    coordinates: [114.86, 38.04],
    highlight: '竹木骨架、绢纱灯面，一盏宫灯点亮北方年节。',
    cover: `${IMG}/bg/jianzhi.jpg`,
    imageNote: '暂无实拍素材，图中为同类年节灯彩场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/jianzhi.jpg`, `${IMG}/bg/gushi.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '藁城宫灯是流行于藁城一带的传统灯彩，以竹木做骨架、绢纱糊面，配剪纸纹样与流苏，形制端庄喜庆，是北方年节灯彩的代表性品类之一。',
    background: [
      '藁城地处冀中平原，历史上作坊手工业发达，宫灯制作在明清时期已具规模，产品远销京津与东北。',
      '骨架讲求「立得住、不走形」，竹篾需火烤定型；灯面以绢纱裱糊，再贴剪纸纹样或绘制花鸟人物。',
      '形制上有六方、八方宫灯与走马灯等，常成对悬挂于门楼、堂屋，是春节与元宵的标志性装饰。',
    ],
    reason: [
      '工序完整且手工性强：破篾、烤弯、扎架、裱糊、剪纸贴花、装穗等十余道工序，多由作坊师徒与家族传承。',
      '兼具实用与审美：既是照明与节庆器物，也是剪纸、彩绘、木作等多种民间工艺的综合载体。',
      '现代塑料与电子灯饰冲击下，传统宫灯作坊减少，手工技艺与形制谱系需要保护。',
    ],
    significance: [
      { title: '民俗价值', text: '宫灯是北方年节与元宵灯会的核心符号，承载「张灯结彩」的节庆情感。' },
      { title: '工艺价值', text: '把竹木作、绢纱裱糊、剪纸彩绘整合在一件器物上，是民间综合手工艺的活样本。' },
      { title: '文旅价值', text: '藁城宫灯已形成产业与品牌，可与非遗传习、灯会活动、文创产品结合。' },
    ],
    inheritance:
      '以作坊与家族传承为主，靠师徒带教完成破篾、扎架、裱糊等关键工序；近年通过灯会展示、非遗进校园与合作社生产延续技艺。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '省级（以官方公布为准）' },
      { label: '项目类别', value: '传统技艺 · 灯彩' },
      { label: '流行区域', value: '石家庄市藁城区' },
      { label: '代表工序', value: '破篾 · 扎架 · 裱糊 · 剪纸贴花' },
    ],
    tags: ['传统技艺', '藁城', '宫灯', '年俗', '灯彩'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
  {
    id: 'jingxing-jinju',
    name: '井陉晋剧',
    level: '国家级',
    category: '传统戏剧',
    region: '井陉县',
    coordinates: [114.16, 38.045],
    highlight: '太行山口里的梆子腔：一座县城的百年戏台记忆。',
    cover: `${IMG}/bg/sixian.jpg`,
    imageNote: '暂无实拍素材，图中为同类戏曲场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/sixian.jpg`, `${IMG}/bg/gushi.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '井陉晋剧是流行于井陉一带的地方戏曲，唱腔承晋剧（中路梆子）而来，又融入井陉方言与山区生活题材，是太行山区戏曲生态的重要组成部分。',
    background: [
      '井陉自古为冀晋通衢，商路与移民把山西梆子腔带进太行山口，逐步在本地方言与民俗中落地生根。',
      '戏班多在庙会、祈雨、还愿与年节时演出，剧目既有《打金枝》等传统戏，也有取材本地生活的故事。',
      '行当齐全，讲究唱、念、做、打；锣鼓与梆子控制节奏，演出多在庙台、村台进行。',
    ],
    reason: [
      '是晋剧在河北境内的重要分支，记录了一个剧种跨地域传播并本土化的完整过程。',
      '唱腔与念白融进井陉方言，是研究太行山区语言与戏曲关系的活标本。',
      '观众老龄化、戏班减少，青年演员培养困难，传统剧目与程式需要抢救性保护。',
    ],
    significance: [
      { title: '戏曲价值', text: '保留了晋剧在河北的唱腔形态与班社组织方式，是地方戏曲多样性的一部分。' },
      { title: '方言文化价值', text: '念白中保存了井陉方言的语音与俚语，具有语言与民俗研究价值。' },
      { title: '乡土凝聚价值', text: '庙会唱戏是村落公共生活的重要场景，维系着乡村的人情与秩序。' },
    ],
    inheritance:
      '以县内专业剧团与村民间戏班为主，靠师父带徒、口传心授完成唱腔与身段教学；近年通过戏曲进校园与惠民演出延续。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '国家级（晋剧扩展项目，以官方公布为准）' },
      { label: '项目类别', value: '传统戏剧' },
      { label: '流行区域', value: '石家庄市井陉县' },
      { label: '代表剧目', value: '《打金枝》《算粮登殿》等' },
    ],
    tags: ['传统戏剧', '井陉', '晋剧', '梆子腔', '庙会戏台'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
  {
    id: 'zhaoxian-longpai',
    name: '赵县范庄龙牌会',
    alias: '龙牌会',
    level: '国家级',
    category: '民俗',
    region: '赵县',
    coordinates: [114.776, 37.752],
    highlight: '农历二月二的村落盛会：迎龙牌、巡游、唱戏，一办数百年。',
    cover: `${IMG}/bg/gushi.jpg`,
    imageNote: '暂无实拍素材，图中为同类民俗集会场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/gushi.jpg`, `${IMG}/bg/shehuo.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '范庄龙牌会是赵县范庄一带延续数百年的民间信仰集会，以迎请「龙牌」、巡游与花会表演为核心，是冀中平原规模最大的民俗活动之一。',
    background: [
      '活动多在农历二月二前后举行，村民扎彩棚、摆供品、请戏班唱戏，以「龙牌」为祭祀对象。',
      '巡游队伍由旗鼓、秧歌、龙灯、扇鼓等花会组成，绕村而行，沿途入户祈福。',
      '20 世纪 90 年代以来，龙牌会吸引民俗学者持续调查，成为华北民间信仰研究的典型案例。',
    ],
    reason: [
      '保留了「祭祀—巡游—演戏—聚餐」的完整仪式链条，是华北村落庙会的活样本。',
      '由村民自发组织、按户分工，体现村落自我管理与互助传统。',
      '年轻劳动力外流使仪式组织压力增大，仪式流程与花会技艺需要记录与扶持。',
    ],
    significance: [
      { title: '民俗研究价值', text: '为研究华北民间信仰、村落组织与仪式经济提供了完整案例。' },
      { title: '社区凝聚价值', text: '全村参与、按户摊派与协作，强化村落认同与互助关系。' },
      { title: '文旅价值', text: '花会巡游观赏性强，可与乡村庙会旅游、民俗摄影结合。' },
    ],
    inheritance:
      '以村内会首（组织者）与各花会队伍为核心，按年度轮值组织，技艺靠村中老艺人带徒传授。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '国家级（以官方公布为准）' },
      { label: '项目类别', value: '民俗 · 庙会祭祀' },
      { label: '流行区域', value: '石家庄市赵县范庄' },
      { label: '活动时间', value: '农历二月二前后' },
    ],
    tags: ['民俗', '赵县', '龙牌会', '庙会', '花会'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
  {
    id: 'xinji-pitiehua',
    name: '辛集皮贴画',
    level: '省级',
    category: '传统美术',
    region: '辛集市',
    coordinates: [115.218, 37.943],
    highlight: '把皮革边角料剪贴成画，皮革之乡衍生的民间美术。',
    cover: `${IMG}/bg/jianzhi.jpg`,
    imageNote: '暂无实拍素材，图中为同类拼贴工艺场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/jianzhi.jpg`, `${IMG}/bg/mudiao.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '辛集皮贴画以皮革边角料为材料，经选料、剪裁、拼贴、压制成画，题材多为花鸟、人物与民俗场景，是「皮革之乡」衍生出的特色民间美术。',
    background: [
      '辛集自明清以来就是北方重要的皮毛集散与加工地，皮革边角料为民间艺人提供了天然材料。',
      '艺人按皮料的纹理与色差剪裁拼贴、层层叠加，形成类似浅浮雕的画面质感。',
      '题材贴近生活，常见牡丹、雄鸡、瑞兽与历史人物，多用于装饰与馈赠。',
    ],
    reason: [
      '以本地产业副产品为材料，形成独特的「就地取材」工艺体系，地域辨识度高。',
      '依赖剪裁与配色经验，画面层次靠手工叠压完成，难以完全机械化复制。',
      '掌握技法与题材谱系的老艺人减少，需要保存工艺与图样。',
    ],
    significance: [
      { title: '工艺价值', text: '把皮革加工与民间绘画、拼贴结合，丰富了北方民间美术的门类。' },
      { title: '地域文化价值', text: '作品记录辛集皮革产业与乡土审美，是产业史的另一种书写。' },
      { title: '文创价值', text: '皮革质感独特，适合开发装饰画、文创摆件与礼品。' },
    ],
    inheritance:
      '以作坊与家族传授为主，靠师徒带教完成选料、配色与叠压技巧；近年通过非遗展示与体验课扩大影响。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '省级（以官方公布为准）' },
      { label: '项目类别', value: '传统美术 · 拼贴' },
      { label: '流行区域', value: '石家庄市辛集市' },
      { label: '主要材料', value: '皮革边角料' },
    ],
    tags: ['传统美术', '辛集', '皮贴画', '拼贴', '文创'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
  {
    id: 'pingshan-minge',
    name: '平山民歌',
    level: '省级',
    category: '传统音乐',
    region: '平山县',
    coordinates: [114.199, 38.259],
    highlight: '隔山传意的高腔：太行山里唱出来的生活与记忆。',
    cover: `${IMG}/bg/gushi.jpg`,
    imageNote: '暂无实拍素材，图中为同类民歌演唱场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/gushi.jpg`, `${IMG}/bg/fangzhi.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '平山民歌是流行于平山一带的民间歌曲，曲调高亢悠长、装饰音多，内容涵盖劳作、爱情、生活与革命历史记忆，是太行山区民歌的代表。',
    background: [
      '平山地处太行山东麓山区，山高沟深，歌声常用来隔山传意、协同劳作。',
      '题材包括山歌、小调、号子等，抗战时期又产生了大量革命题材民歌与歌谣。',
      '演唱多用真声高腔，衬词丰富，旋律起伏大，带有鲜明的山地气质。',
    ],
    reason: [
      '旋律与唱法保留太行山区民歌的独特形态，是研究河北民歌的重要样本。',
      '歌词记录了山区劳作、生活与革命历史，具有民俗与口述史价值。',
      '随着生产生活方式改变，会唱的歌手减少，需要系统采录与传唱。',
    ],
    significance: [
      { title: '音乐价值', text: '高腔真声与丰富衬词构成辨识度高的山地民歌风格。' },
      { title: '历史记忆价值', text: '革命题材民歌承载了特定历史时期的情感与叙事。' },
      { title: '传播价值', text: '旋律性强，适合改编为合唱、民乐与短视频配乐。' },
    ],
    inheritance:
      '以村落中会唱的歌手口耳相传为主，靠日常劳作与节庆场合传唱；近年通过民歌采录、展演与进校园活动延续。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '省级（以官方公布为准）' },
      { label: '项目类别', value: '传统音乐 · 民歌' },
      { label: '流行区域', value: '石家庄市平山县' },
      { label: '音乐特征', value: '高腔真声 · 衬词丰富' },
    ],
    tags: ['传统音乐', '平山', '民歌', '太行山', '革命歌谣'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
  {
    id: 'shenze-zhuizi',
    name: '深泽坠子戏',
    alias: '坠子',
    level: '省级',
    category: '传统戏剧',
    region: '深泽县',
    coordinates: [115.201, 38.184],
    highlight: '由说唱长大成戏：坠胡一响，故事就开讲。',
    cover: `${IMG}/bg/sixian.jpg`,
    imageNote: '暂无实拍素材，图中为同类戏曲场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/sixian.jpg`, `${IMG}/bg/gushi.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '深泽坠子戏由坠子说唱发展而来，说唱与戏曲结合，唱腔婉转、叙述性强，流行于滹沱河一带的乡村舞台。',
    background: [
      '坠子原为民间说唱，艺人以简板、坠胡伴奏，说唱长篇故事。',
      '20 世纪中期，艺人在说唱基础上分角色、加身段，逐步形成戏曲化的坠子戏。',
      '剧目多取材民间故事与生活伦理，唱词通俗，叙事段落长，乡土气息浓。',
    ],
    reason: [
      '记录了「说唱—戏曲」的演化路径，是研究地方戏曲形成过程的活样本。',
      '唱腔与方言结合紧密，叙述性强，保留了民间长篇叙事的表达方式。',
      '班社减少、演员老化，传统剧目与唱腔需要记录与传承。',
    ],
    significance: [
      { title: '戏曲价值', text: '保留说唱衍化为戏曲的中间形态，具有剧种演化研究价值。' },
      { title: '乡土叙事价值', text: '剧目承载乡村伦理与生活经验，是民间价值观的口头表达。' },
      { title: '传播价值', text: '叙事性强，适合改编为广播剧、短视频连载与曲艺专场。' },
    ],
    inheritance:
      '以民间班社与师徒传授为主，唱腔靠口传心授，乐队与演员长期配合形成默契。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '省级（以官方公布为准）' },
      { label: '项目类别', value: '传统戏剧 · 说唱衍化' },
      { label: '流行区域', value: '石家庄市深泽县' },
      { label: '主要乐器', value: '坠胡 · 简板' },
    ],
    tags: ['传统戏剧', '深泽', '坠子', '说唱', '滹沱河'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
  {
    id: 'xinle-fuxi',
    name: '新乐伏羲祭典',
    level: '省级',
    category: '民俗',
    region: '新乐市',
    coordinates: [114.684, 38.343],
    highlight: '伏羲台下的祭典与庙会，一场延续久远的春日集会。',
    cover: `${IMG}/bg/shehuo.jpg`,
    imageNote: '暂无实拍素材，图中为同类民俗仪式场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/shehuo.jpg`, `${IMG}/bg/gushi.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '新乐伏羲祭典依托伏羲台举行，是当地延续久远的祭祀与庙会活动，包含祭祀礼仪、民间花会与商贸集会。',
    background: [
      '伏羲台相传与伏羲氏活动有关，是华北地区重要的伏羲文化遗存。',
      '每年农历三月十八前后，当地民众与外地信众前来祭拜，形成「祭祀 + 庙会 + 集市」的复合形态。',
      '祭典包含上香、献供、宣读祭文等环节，庙会期间有花会表演与地方小吃。',
    ],
    reason: [
      '把上古人物信仰、地方庙会与集市贸易结合在一起，是华北庙会文化的典型样本。',
      '仪式与传说共同维系地方历史认同，具有文化记忆功能。',
      '仪式的组织与主持依赖老一辈，流程与祭文需要记录。',
    ],
    significance: [
      { title: '历史认同价值', text: '伏羲文化为新乐提供了久远的历史叙事与地方认同符号。' },
      { title: '民俗价值', text: '祭典、庙会与集市三位一体，是乡村公共生活的年度节点。' },
      { title: '文旅价值', text: '可与伏羲台景区、研学线路结合，形成文化体验产品。' },
    ],
    inheritance:
      '由地方文化组织与信众共同操持，祭文、仪程靠老一辈口传；近年结合景区活动与研学开展展示。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '省级（以官方公布为准）' },
      { label: '项目类别', value: '民俗 · 祭典庙会' },
      { label: '流行区域', value: '石家庄市新乐市' },
      { label: '活动时间', value: '农历三月十八前后' },
    ],
    tags: ['民俗', '新乐', '伏羲祭典', '庙会', '伏羲台'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
  {
    id: 'zanhuang-tielongdeng',
    name: '赞皇铁龙灯',
    alias: '龙灯',
    level: '省级',
    category: '传统舞蹈',
    region: '赞皇县',
    coordinates: [114.39, 37.66],
    highlight: '铁架为骨、灯盏为鳞，夜里舞起来的龙。',
    cover: `${IMG}/bg/shehuo.jpg`,
    imageNote: '暂无实拍素材，图中为同类民俗表演场景示意，实拍资料整理中。',
    gallery: [`${IMG}/bg/shehuo.jpg`, `${IMG}/bg/zhangu.jpg`],
    aiWorks: [],
    videos: [],
    summary:
      '赞皇铁龙灯是赞皇一带的民间龙灯表演，龙身以铁架为骨、布面彩绘并内置灯盏，多人协作举龙舞动，夜间灯火随龙身起伏，多见于春节与元宵花会。',
    background: [
      '赞皇地处太行山东麓，村落花会传统深厚，铁龙灯多在正月出灯巡游。',
      '龙身以铁架为骨、布面彩绘，内置灯盏；舞动时需十余人配合，讲究「龙头领、龙身随、龙尾稳」。',
      '表演常与锣鼓、秧歌同台，走街串巷为村民祈福。',
    ],
    reason: [
      '道具制作与舞蹈调度结合，铁架龙身与灯彩工艺具有独特性。',
      '属于村落集体性民俗表演，依赖村民协作与年度排练，具有社区凝聚功能。',
      '会制作龙架与带队的老人减少，制作工艺与套路需要记录。',
    ],
    significance: [
      { title: '工艺价值', text: '铁架造型、布面彩绘与灯盏安置构成一套完整的道具制作技艺。' },
      { title: '民俗价值', text: '正月龙灯巡游是村落祈福与公共娱乐的重要形式。' },
      { title: '展演价值', text: '夜间演出视觉冲击强，适合节庆文旅展演。' },
    ],
    inheritance:
      '以村内花会队伍为主体，制作与舞龙套路靠老艺人带徒，每年正月集中排练。（素材包未附具体传承人名单）',
    facts: [
      { label: '名录级别', value: '省级（以官方公布为准）' },
      { label: '项目类别', value: '传统舞蹈 · 龙灯' },
      { label: '流行区域', value: '石家庄市赞皇县' },
      { label: '表演时间', value: '正月 · 元宵花会' },
    ],
    tags: ['传统舞蹈', '赞皇', '龙灯', '花会', '元宵'],
    source: '公开资料整理（等级与批次以官方公布名录为准）',
  },
];

export const ichCategories = Array.from(new Set(ichList.map((item) => item.category)));

export const ichRegions = Array.from(new Set(ichList.map((item) => item.region)));

export function getIch(id: string): IchItem | undefined {
  return ichList.find((item) => item.id === id);
}

export function countByRegion(): { region: string; count: number; coordinates: [number, number] }[] {
  const map = new Map<string, { region: string; count: number; coordinates: [number, number] }>();
  for (const item of ichList) {
    const found = map.get(item.region);
    if (found) {
      found.count += 1;
    } else {
      map.set(item.region, { region: item.region, count: 1, coordinates: item.coordinates });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
