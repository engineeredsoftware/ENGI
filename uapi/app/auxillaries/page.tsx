import { redirect } from 'next/navigation';
import { buildAuxillariesRoutePath } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export default function AuxillariesPage() {
  redirect(buildAuxillariesRoutePath('wallet'));
}
