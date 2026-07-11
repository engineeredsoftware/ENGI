import { redirect } from 'next/navigation';

type ExecutionsRunRedirectProps = {
  params: { runId: string };
};

export default function ExecutionsRunRedirectPage({ params }: ExecutionsRunRedirectProps) {
  redirect(`/packs?transactionId=${encodeURIComponent(params.runId)}`);
}
