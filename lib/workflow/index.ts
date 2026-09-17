import type { RunResult, StepTrace, Workflow, WorkflowConfig } from './types';
import { textToImageWorkflow } from './textToImage';
import { qaWorkflow } from './qa';

export * from './types';
export { textToImageWorkflow, qaWorkflow };

export const workflows: Workflow[] = [textToImageWorkflow, qaWorkflow];

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((workflow) => workflow.meta.id === id);
}

/** 顺序执行工作流，逐步产出可审阅的轨迹（演练模式，不调用外部收费接口） */
export async function runWorkflow(
  id: string,
  input: string,
  onStep?: (trace: StepTrace) => void,
  config?: WorkflowConfig,
): Promise<RunResult> {
  const workflow = getWorkflow(id);
  if (!workflow) throw new Error(`未找到工作流：${id}`);

  const values: Record<string, unknown> = {};
  const traces: StepTrace[] = [];

  for (const node of workflow.nodes) {
    const handler = workflow.handlers[node.id];
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let output: unknown = null;
    let status = node.status;
    let note: string | undefined;

    try {
      const result = handler ? await handler({ input, values, config }) : { output: null, note: '未实现' };
      output = result.output;
      status = result.status ?? node.status;
      note = result.note;
    } catch (error) {
      note = error instanceof Error ? `执行异常：${error.message}` : '执行异常';
    }

    values[node.id] = output;

    const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const trace: StepTrace = {
      nodeId: node.id,
      index: node.index,
      title: node.title,
      kind: node.kind,
      status,
      durationMs: Math.round(endedAt - startedAt),
      input: buildInputSnapshot(node.id, values),
      output,
      note,
    };
    traces.push(trace);
    onStep?.(trace);

    // 让每一步的产出肉眼可见
    await new Promise((resolve) => setTimeout(resolve, 140));
  }

  return { workflowId: id, traces, values };
}

/** 给每一步生成「输入快照」，便于在界面上看清数据怎么流动 */
function buildInputSnapshot(nodeId: string, values: Record<string, unknown>): unknown {
  const parse = values.parse as { projectId?: string; style?: string; aspect?: string } | undefined;
  const compile = values.compile as { promptEn?: string; promptZh?: string } | undefined;
  const retrieve = values.retrieve as { hits?: unknown[]; answer?: string } | undefined;
  const generate = values.generate as { answer?: string } | undefined;

  switch (nodeId) {
    case 'parse':
      return { prompt: (values.intake as { prompt?: string })?.prompt };
    case 'grounding':
    case 'reference':
      return { projectId: parse?.projectId ?? null };
    case 'compile':
      return { style: parse?.style, aspect: parse?.aspect, constraints: '见上一节点' };
    case 'generate':
      return compile ? { promptEn: `${compile.promptEn?.slice(0, 80)}…` } : { messages: 3 };
    case 'review':
      return { promptZh: compile?.promptZh?.slice(0, 60) };
    case 'archive':
      return { score: (values.review as { score?: number })?.score };
    case 'route':
    case 'retrieve':
      return { normalized: (values.normalize as { normalized?: string })?.normalized };
    case 'assemble':
      return { hits: retrieve?.hits?.length ?? 0 };
    case 'verify':
      return { answer: `${generate?.answer?.slice(0, 60) ?? ''}…` };
    case 'respond':
      return { hits: retrieve?.hits?.length ?? 0 };
    default:
      return undefined;
  }
}
