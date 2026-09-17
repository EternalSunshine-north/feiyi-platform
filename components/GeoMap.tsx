'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { MapChart, EffectScatterChart, ScatterChart } from 'echarts/charts';
import { GeoComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  MapChart,
  EffectScatterChart,
  ScatterChart,
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export interface GeoPoint {
  name: string;
  location: string;
  category: string;
  level: string;
  count: number;
  coordinates: [number, number];
}

interface GeoMapProps {
  /** GeoJSON 地址（放在 public/geo 下，本地读取，不依赖外部服务） */
  geoUrl: string;
  /** 注册到 ECharts 的地图名，需全局唯一 */
  mapName: string;
  points: GeoPoint[];
  /** 行政区填色数据 */
  districts: { district: string; count: number }[];
  height?: number;
  unitLabel?: string;
  /** 缩放倍数，默认 1.12 */
  zoom?: number;
  /** 是否显示行政区名称 */
  showLabels?: boolean;
  onSelect?: (name: string) => void;
}

/** 离线行政区划地图：本地 GeoJSON + ECharts，无需外部瓦片，断网也能显示 */
export default function GeoMap({
  geoUrl,
  mapName,
  points,
  districts,
  height = 560,
  unitLabel = '项',
  zoom = 1.12,
  showLabels = true,
  onSelect,
}: GeoMapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // 用序列化结果作为依赖，避免父组件每次渲染新建数组/函数导致地图反复重建
  const pointsKey = JSON.stringify(points);
  const districtsKey = JSON.stringify(districts);

  useEffect(() => {
    let disposed = false;
    let chart: echarts.ECharts | null = null;

    const run = async () => {
      try {
        const response = await fetch(geoUrl);
        if (!response.ok) throw new Error(`GeoJSON 读取失败：${response.status}`);
        const geoJson = (await response.json()) as Parameters<typeof echarts.registerMap>[1];
        if (disposed) return;

        echarts.registerMap(mapName, geoJson);
        setReady(true);

        const node = ref.current;
        if (!node) return;
        chart = echarts.init(node, undefined, { renderer: 'canvas' });
        chartRef.current = chart;

        const maxCount = Math.max(1, ...districts.map((d) => d.count));

        chart.setOption({
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(248,240,229,0.97)',
            borderColor: 'rgba(166,126,84,0.52)',
            textStyle: { color: '#33241a', fontSize: 12 },
            formatter: (params: unknown) => {
              const p = params as {
                seriesType?: string;
                name: string;
                value?: number[] | number;
                data?: GeoPoint & { value?: number[] };
              };
              if (p.seriesType === 'scatter' && p.data) {
                const d = p.data as GeoPoint;
                return `<strong style="color:#97392a">${d.name}</strong><br/>${d.location} · ${d.category}<br/>关联资源 <b>${d.count}</b> ${unitLabel}`;
              }
              const value = Array.isArray(p.value) ? p.value[2] : p.value;
              return `<strong style="color:#97392a">${p.name}</strong><br/>非遗资源 <b>${value ?? 0}</b> ${unitLabel}`;
            },
          },
          visualMap: districts.length
            ? {
                min: 0,
                max: maxCount,
                left: 16,
                bottom: 24,
                orient: 'vertical',
                text: ['多', '少'],
                textStyle: { color: 'rgba(92,68,46,0.82)', fontSize: 11 },
                itemWidth: 10,
                itemHeight: 90,
                // 填色止于暖沙棕，保证深色区县上的实心点位仍然清晰
                inRange: { color: ['#f4eadb', '#ecdfc9', '#e2d0b4', '#d3bb9c', '#cfa87c', '#b8825a'] },
                calculable: true,
              }
            : undefined,
          geo: {
            map: mapName,
            roam: true,
            zoom,
            scaleLimit: { min: 0.8, max: 6 },
            itemStyle: {
              areaColor: '#f1e6d4',
              borderColor: 'rgba(158,120,80,0.74)',
              borderWidth: 1,
              shadowColor: 'rgba(185,74,51,0.18)',
              shadowBlur: 14,
            },
            emphasis: {
              itemStyle: { areaColor: 'rgba(208,104,76,0.3)', borderColor: '#b94a33' },
              label: { color: '#fff', fontWeight: 600 },
            },
            label: {
              show: showLabels,
              color: 'rgba(92,68,46,0.85)',
              fontSize: mapName === 'china' ? 9 : 10.5,
            },
            select: { itemStyle: { areaColor: 'rgba(200,146,65,0.32)' } },
          },
          series: [
            ...(districts.length
              ? [
                  {
                    name: '资源数量',
                    type: 'map' as const,
                    geoIndex: 0,
                    data: districts.map((d) => ({ name: d.district, value: d.count })),
                  },
                ]
              : []),
            {
              name: '非遗点位',
              // 实心圆点标记：比原来的脉冲气泡更小、更克制
              type: 'scatter',
              coordinateSystem: 'geo',
              geoIndex: 0,
              symbolSize: (value: number[]) => 7 + Math.min(9, (value[2] ?? 1) * 1.3),
              itemStyle: {
                // 暖墨实心点：在米色 / 暖沙色区县上都清晰
                color: '#6f3520',
                borderColor: 'rgba(255, 250, 240, 0.9)',
                borderWidth: 1.5,
                shadowBlur: 6,
                shadowColor: 'rgba(111,53,32,0.35)',
              },
              label: {
                show: true,
                position: 'right',
                formatter: (params: { data: GeoPoint }) => params.data.name,
                color: 'rgba(66,47,32,0.95)',
                fontSize: 10,
                distance: 5,
              },
              zlevel: 2,
              emphasis: {
                itemStyle: { color: '#33241a', borderColor: '#fff8ec', borderWidth: 2 },
                scale: 1.25,
              },
              data: points.map((point) => ({
                ...point,
                value: [point.coordinates[0], point.coordinates[1], point.count],
              })),
            },
          ],
        });

        chart.on('click', (params) => {
          const p = params as { seriesType?: string; name?: string };
          if (p.seriesType === 'scatter' && p.name) onSelectRef.current?.(p.name);
        });

        const observer = new ResizeObserver(() => chart?.resize());
        observer.observe(node);
        return () => observer.disconnect();
      } catch (err) {
        setError(err instanceof Error ? err.message : '地图数据加载失败');
      }
    };

    void run();

    return () => {
      disposed = true;
      chart?.dispose();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoUrl, mapName, pointsKey, districtsKey, unitLabel, zoom, showLabels]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950/40">
      <div ref={ref} style={{ height }} className="w-full" />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[13px] text-white/50">正在加载地图数据…</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <p className="text-[13.5px] text-cinnabar-300">{error}</p>
            <p className="mt-2 text-[12px] text-white/45">请确认 public/geo 下的 GeoJSON 文件存在</p>
          </div>
        </div>
      )}
    </div>
  );
}
