import {
  deleteExecutionHistoryRunRoute,
  getExecutionHistoryRunRoute,
} from '@bitcode/api/src/routes/executions';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { runId: string } }) {
  return getExecutionHistoryRunRoute(request, params);
}

export async function DELETE(
  request: Request,
  { params }: { params: { runId: string } },
) {
  return deleteExecutionHistoryRunRoute(request, params);
}
