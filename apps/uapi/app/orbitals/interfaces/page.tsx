import { redirect } from 'next/navigation';
import { buildAuxillariesRoutePath } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

export default function OrbitalsInterfacesPage() {
  redirect(buildAuxillariesRoutePath('interfaces'));
}
