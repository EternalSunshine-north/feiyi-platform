import type { AnswerStyle } from '@/lib/answerStyles';
import type { ModelConfig } from '@/lib/modelPresets';

/** 工作流引擎：节点定义 + 运行轨迹 */

export type NodeKind =
  | 'input'
  | 'rule'
  | 'llm'
  | 'retrieve'
  | 'model'
  | 'output'
  | 'memory';

/** 节点状态：live = 已实现（可演练）；planned = 待接入外部服务 */
export type NodeStatus = 'live' | 'planned';

export interface WorkflowField {
  name: string;
  type: string;
  desc: string;
}

export interface WorkflowNode {
  id: string;
  index: number;
  title: string;
  kind: NodeKind;
  status: NodeStatus;
  summary: string;
  /** 该步骤解决的「上一版不准」的问题 */
  why?: string;
  inputs: WorkflowField[];
  outputs: WorkflowField[];
  params?: { label: string; value: string }[];
}

export interface WorkflowMeta {
  id: string;
  name: string;
  goal: string;
  entry: string;
  exit: string;
  /** 需要用户确认后才能接入的事项 */
  decisions: string[];
  /** 已按确认回执落地的配置 */
  confirmed?: string[];
}

export interface StepContext {
  input: string;
  values: Record<string, unknown>;
  /** 运行时由用户在「模型 / 风格」模块里填写的参数 */
  config?: WorkflowConfig;
}

export interface WorkflowConfig {
  /** 文生图：用户在模型选型模块里的输入（含自定义模型、Key、张数、阈值等） */
  model?: ModelConfig;
  /** 问答：回答风格模板 */
  style?: AnswerStyle;
  /** 当前登录用户（用于署名与按用户存会话） */
  user?: string | null;
}

export interface StepResult {
  status?: NodeStatus;
  output: unknown;
  note?: string;
}

export type StepHandler = (ctx: StepContext) => Promise<StepResult> | StepResult;

export interface StepTrace {
  nodeId: string;
  index: number;
  title: string;
  kind: NodeKind;
  status: NodeStatus;
  durationMs: number;
  input?: unknown;
  output?: unknown;
  note?: string;
}

export interface RunResult {
  workflowId: string;
  traces: StepTrace[];
  values: Record<string, unknown>;
}

export interface Workflow {
  meta: WorkflowMeta;
  nodes: WorkflowNode[];
  handlers: Record<string, StepHandler>;
}
