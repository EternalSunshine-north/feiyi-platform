'use client';

import { videoEntries } from '@/lib/videos';

/** 非遗影像墙：本地视频直接播放，第三方内容提供站外检索入口 */
export default function VideoWall() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {videoEntries.map((video) => {
        return (
          <article key={video.id} className="glass glass-hover flex h-full flex-col overflow-hidden">
            <div className="relative aspect-video w-full overflow-hidden bg-ink-950">
              {video.src ? (
                <video controls preload="none" poster={video.poster} className="h-full w-full object-cover">
                  <source src={video.src} type="video/mp4" />
                  你的浏览器不支持视频播放。
                </video>
              ) : video.embedUrl ? (
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  className="h-full w-full"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                // 没有可播放地址时只展示非遗动态视觉，不显示任何接入说明
                <div className="art-visual art-sparks h-full w-full">
                  <span className="art-layer art-layer-1" />
                  <span className="art-layer art-layer-2" />
                  <span className="art-grain" />
                </div>
              )}

              {video.hot && (
                <span className="chip chip-gold absolute left-3 top-3 !py-1 !text-[11px]">热门</span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="serif text-[15.5px] leading-6 text-white">{video.title}</h3>
              <p className="mt-1 text-[12px] text-white/45">{video.author}</p>
              <p className="mt-3 text-[13px] leading-7 text-white/62">{video.desc}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span key={tag} className="chip !py-0.5 !text-[11px]">
                    {tag}
                  </span>
                ))}
              </div>

            </div>
          </article>
        );
      })}
    </div>
  );
}
