/**
 * 「相关非遗」板块的视频墙配置
 *
 * 三种播放入口，任选其一填写即可：
 *   1. src       —— 本地视频文件（放到 public 下），例如 '/ich/changshan-zhangu/video.mp4'
 *   2. embedUrl  —— 第三方播放器嵌入地址（B 站 / 抖音 / 微信视频号 等 iframe 的 src）
 *   3. searchUrl —— 只给检索入口，点击后跳转到站外搜索（适合不方便内嵌的版权内容）
 *
 * 说明：受版权限制，平台不内置第三方博主的视频文件；接入自家或已获授权的视频时，
 *      把地址填到 src 或 embedUrl 即可自动变成在线播放。
 */

export interface VideoEntry {
  id: string;
  title: string;
  author: string;
  platform: string;
  desc: string;
  tags: string[];
  /** 本地视频文件 */
  src?: string;
  /** 第三方播放器嵌入地址 */
  embedUrl?: string;
  /** 站外检索地址 */
  searchUrl?: string;
  poster?: string;
  hot?: boolean;
}

export const videoEntries: VideoEntry[] = [
  {
    id: 'v-datiehua',
    title: '打铁花 · 1600℃ 的中国式浪漫',
    author: '九月 等热门博主',
    platform: 'B 站 / 抖音',
    desc: '铁水击向夜空炸裂成金色花雨，近几年在短视频平台持续走红，是传播度最高的非遗影像母题之一。',
    tags: ['打铁花', '热门', '夜间焰火'],
    searchUrl: 'https://search.bilibili.com/all?keyword=%E6%89%93%E9%93%81%E8%8A%B1',
    hot: true,
  },
  {
    id: 'v-liziqi',
    title: '李子柒 · 田园手艺与蜀绣',
    author: '李子柒',
    platform: 'B 站 / 微博',
    desc: '以节令、手工、田园生活为线索的影像创作，把蜀绣、竹编、酱油酿造等技艺带进大众视野。',
    tags: ['李子柒', '蜀绣', '非遗出海'],
    searchUrl: 'https://search.bilibili.com/all?keyword=%E6%9D%8E%E5%AD%90%E6%9F%92',
    hot: true,
  },
  {
    id: 'v-yuxian',
    title: '蔚县打树花 · 铁水泼上古城墙',
    author: '蔚县民俗演出团队',
    platform: 'B 站 / 抖音',
    desc: '河北蔚县暖泉镇的传统焰火，用木勺舀铁水泼向城墙，溅出万千火花，与确山打铁花并称双绝。',
    tags: ['河北', '打树花', '邻近石家庄'],
    searchUrl: 'https://search.bilibili.com/all?keyword=%E8%94%9A%E5%8E%BF%E6%89%93%E6%A0%91%E8%8A%B1',
  },
  {
    id: 'v-zhangu',
    title: '常山战鼓 · 现场影像',
    author: '平台影像档案',
    platform: '本站素材',
    desc: '正定常山战鼓的现场演出实录，9 系 72 套鼓谱全靠口传心授，鼓钹翻飞、气势磅礴。',
    tags: ['石家庄', '可在线播放'],
    src: '/ich/changshan-zhangu/video.mp4',
    poster: '/ich/changshan-zhangu/cover.jpg',
  },
  {
    id: 'v-lahua',
    title: '井陉拉花 · 花会影像',
    author: '平台影像档案',
    platform: '本站素材',
    desc: '正月花会中的井陉拉花，拧肩、翻腕、撇脚的动作语汇在锣鼓与唢呐里展开。',
    tags: ['石家庄', '可在线播放'],
    src: '/ich/jingxing-lahua/video.mp4',
    poster: '/ich/jingxing-lahua/cover.jpg',
  },
  {
    id: 'v-gaozhao',
    title: '正定高照 · 72 公斤的幡',
    author: '平台影像档案',
    platform: '本站素材',
    desc: '正定高照（中幡）演出实录：托塔、二郎担山等套路在头、肩、肘、手之间轮换承接。',
    tags: ['石家庄', '可在线播放'],
    src: '/ich/zhengding-gaozhao/video.mp4',
    poster: '/ich/zhengding-gaozhao/cover.jpg',
  },
];
