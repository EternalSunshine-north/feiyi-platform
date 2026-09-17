'use client';

import { useEffect, useState } from 'react';
import {
  loadModelConfig,
  MODEL_PRESETS,
  presetByProvider,
  PROVIDER_ENV_HINT,
  saveModelConfig,
  type ModelConfig,
  type Provider,
  VIDEO_MODEL_PRESETS,
  videoPresetByProvider,
} from '@/lib/modelPresets';

interface ModelPickerProps {
  user?: string | null;
  value?: ModelConfig;
  onChange?: (config: ModelConfig) => void;
  defaultOpen?: boolean;
  /** image = 图像模型；video = 视频模型（视频生成模块工作流使用） */
  variant?: 'image' | 'video';
}

/**
 * 「图像模型」模块（含用户输入）
 * 用户可以：选预设 → 改模型名 / 接口地址 / 临时 Key；也可选「自定义」完全自己填。
 * 回执里确认的「张数 / 参考图引导 / 质检阈值 / 重试次数 / 署名规则」也集中放在这里。
 */
export default function ModelPicker({
  user,
  value,
  onChange,
  defaultOpen = false,
  variant = 'image',
}: ModelPickerProps) {
  const isVideo = variant === 'video';
  const presets = isVideo ? VIDEO_MODEL_PRESETS : MODEL_PRESETS;
  const title = isVideo ? '视频模型' : '图像模型';

  const [open, setOpen] = useState(defaultOpen);
  const [config, setConfig] = useState<ModelConfig>(value ?? loadModelConfig(user, variant));

  useEffect(() => {
    if (value) setConfig(value);
  }, [value]);

  const update = (patch: Partial<ModelConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      saveModelConfig(next, user, variant);
      onChange?.(next);
      return next;
    });
  };

  const updateRights = (patch: Partial<ModelConfig['rights']>) => {
    setConfig((prev) => {
      const next = { ...prev, rights: { ...prev.rights, ...patch } };
      saveModelConfig(next, user, variant);
      onChange?.(next);
      return next;
    });
  };

  const selectPreset = (provider: Provider) => {
    const preset = isVideo ? videoPresetByProvider(provider) : presetByProvider(provider as never);
    update({
      provider,
      label: preset.label,
      model: preset.model,
      endpoint: preset.endpoint,
    });
  };

  const ready =
    Boolean(config.model) &&
    (config.provider === 'local-sdxl' ||
      config.provider === 'local-svd' ||
      config.provider === 'custom' ||
      Boolean(config.apiKey));

  return (
    <div className="rounded-2xl border border-white/12 bg-ink-950/50 p-4">
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="flex w-full items-center gap-3 text-left">
        <span className="chip chip-gold">{title}</span>
        <span className="flex-1 text-[12.5px] text-white/75">
          {config.label}
          {config.model ? ` · ${config.model}` : '（未填写模型）'}
        </span>
        <span className={`chip !py-0.5 !text-[10.5px] ${ready ? 'chip-jade' : ''}`}>
          {ready ? '可调用' : '待补全'}
        </span>
        <span className="text-[11px] text-white/35">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <span className="mb-2 block text-[12px] text-white/50">
              选择{isVideo ? '视频' : '图像'}模型（最后一项为自定义输入）
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.provider}
                  type="button"
                  onClick={() => selectPreset(preset.provider)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                    config.provider === preset.provider
                      ? 'border-gold-400/55 bg-gold-400/15 text-gold-200'
                      : 'border-white/12 bg-white/4 text-white/65 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="模型名"
              hint={
                isVideo
                  ? '例如 wanx2.1-t2v-turbo / kling-v1-6 / 你自己的视频模型'
                  : '例如 wanx2.1-t2i-turbo / gpt-image-1 / 你自己的模型'
              }
            >
              <input
                value={config.model}
                onChange={(event) => update({ model: event.target.value })}
                placeholder="填模型名"
                className="field !py-2.5 text-[12.5px]"
              />
            </Field>
            <Field label="接口地址 endpoint" hint="自定义 / 本地模型必填">
              <input
                value={config.endpoint}
                onChange={(event) => update({ endpoint: event.target.value })}
                placeholder="https://..."
                className="field !py-2.5 text-[12.5px]"
              />
            </Field>
            <Field label="临时 API Key" hint={`只存在本机浏览器；也可用服务端环境变量 ${PROVIDER_ENV_HINT[config.provider]}`}>
              <input
                type="password"
                value={config.apiKey}
                onChange={(event) => update({ apiKey: event.target.value })}
                placeholder="sk-..."
                className="field !py-2.5 text-[12.5px]"
              />
            </Field>
            <Field
              label={isVideo ? '生成条数' : '每轮生成张数'}
              hint={isVideo ? '视频生成成本较高，建议每次 1 条' : '回执：默认 2 张，自动择优'}
            >
              <input
                type="number"
                min={1}
                max={isVideo ? 2 : 4}
                value={config.count}
                onChange={(event) => update({ count: Number(event.target.value) || 1 })}
                className="field !py-2.5 text-[12.5px]"
              />
            </Field>
            <Field label="质检阈值" hint="低于该分数触发重编译">
              <input
                type="number"
                min={50}
                max={100}
                value={config.qualityThreshold}
                onChange={(event) => update({ qualityThreshold: Number(event.target.value) || 80 })}
                className="field !py-2.5 text-[12.5px]"
              />
            </Field>
            <Field label="自动重试次数">
              <input
                type="number"
                min={0}
                max={5}
                value={config.maxRetries}
                onChange={(event) => update({ maxRetries: Number(event.target.value) || 0 })}
                className="field !py-2.5 text-[12.5px]"
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
            <input
              type="checkbox"
              checked={config.useReference}
              onChange={(event) => update({ useReference: event.target.checked })}
              className="h-3.5 w-3.5 accent-[#c89241]"
            />
            <span className="text-[12.5px] text-white/75">
              {isVideo
                ? '启用参考图引导（图生视频）：用素材包实拍图约束服饰、动作与纹样'
                : '启用参考图引导（图生图）：用素材包实拍图约束服饰、动作与纹样'}
            </span>
          </label>

          <Field label="补充说明（会追加进提示词）" hint="例如：人物为女性舞者、背景是傍晚的庙会">
            <textarea
              value={config.extraPrompt}
              onChange={(event) => update({ extraPrompt: event.target.value })}
              rows={2}
              className="field resize-none text-[12.5px]"
              placeholder="可选：补充你的具体要求"
            />
          </Field>

          <div className="rounded-xl border border-white/10 bg-white/3 p-3">
            <span className="text-[12px] text-white/50">版权与署名规则（回执已确认）</span>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <Field label="署名模板" hint="{user} 会替换成你的昵称">
                <input
                  value={config.rights.authorTemplate}
                  onChange={(event) => updateRights({ authorTemplate: event.target.value })}
                  className="field !py-2.5 text-[12px]"
                />
              </Field>
              <Field label="授权范围">
                <input
                  value={config.rights.license}
                  onChange={(event) => updateRights({ license: event.target.value })}
                  className="field !py-2.5 text-[12px]"
                />
              </Field>
              <Field label="来源标注">
                <input
                  value={config.rights.sourceNote}
                  onChange={(event) => updateRights({ sourceNote: event.target.value })}
                  className="field !py-2.5 text-[12px]"
                />
              </Field>
            </div>
          </div>

          <p className="text-[11.5px] leading-6 text-white/40">
            Key 只存在本机浏览器（localStorage），生成时随请求发往服务端转发，不写入项目文件。
            若团队共用，请改到 <code className="text-jade-300">.env.local</code>：{PROVIDER_ENV_HINT[config.provider]}
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] text-white/50">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10.5px] leading-5 text-white/30">{hint}</span>}
    </label>
  );
}
