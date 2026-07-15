import {
  getExecutionHistoryRoute,
  postExecutionHistoryRoute,
} from '@bitcode/api/src/routes/executions';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  return getExecutionHistoryRoute(request);
}

export async function POST(request: Request) {
  return postExecutionHistoryRoute(request);
}
