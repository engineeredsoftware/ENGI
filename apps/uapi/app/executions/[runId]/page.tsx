import { redirect } from 'next/navigation';

type ExecutionsRunRedirectProps = {
  params: { runId: string };
};

export default function ExecutionsRunRedirectPage({ params }: ExecutionsRunRedirectProps) {
  redirect(`/exchange?transactionId=${encodeURIComponent(params.runId)}`);
}
