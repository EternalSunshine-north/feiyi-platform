import { NextResponse, type NextRequest } from 'next/server';
import { getWorkflow, runWorkflow, workflows } from '@/lib/workflow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 工作流运行接口（演练模式）
 * GET  /api/workflow                      → 列出所有工作流与节点状态
 * GET  /api/workflow?id=text-to-image     → 查看某条工作流的完整定义
 * POST /api/workflow { workflowId, input } → 运行工作流并返回逐步轨迹
 *
 * 说明：演练模式只跑本地逻辑与资料库，不调用外部收费接口；
 *      接入真实模型时，在对应节点（如 text-to-image 的 generate）里调用模型 API 即可。
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({
      workflows: workflows.map((workflow) => ({
        id: workflow.meta.id,
        name: workflow.meta.name,
        goal: workflow.meta.goal,
        steps: workflow.nodes.length,
        implemented: workflow.nodes.filter((node) => node.status === 'live').length,
        pending: workflow.nodes.filter((node) => node.status === 'planned').map((node) => node.title),
      })),
    });
  }

  const workflow = getWorkflow(id);
  if (!workflow) return NextResponse.json({ error: `未找到工作流：${id}` }, { status: 404 });
  return NextResponse.json(workflow);
}

export async function POST(request: NextRequest) {
  let body: { workflowId?: string; input?: string };
  try {
    body = (await request.json()) as { workflowId?: string; input?: string };
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const workflowId = body.workflowId ?? 'text-to-image';
  const input = (body.input ?? '').trim();

  if (!input) return NextResponse.json({ error: '缺少 input（提示词或问题）' }, { status: 400 });
  if (!getWorkflow(workflowId)) {
    return NextResponse.json({ error: `未找到工作流：${workflowId}` }, { status: 404 });
  }

  const result = await runWorkflow(workflowId, input);
  return NextResponse.json(result);
}
