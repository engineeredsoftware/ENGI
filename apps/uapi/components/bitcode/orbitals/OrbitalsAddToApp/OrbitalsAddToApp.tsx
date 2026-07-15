"use client";
import { useEffect } from 'react';
import { prefetchAuxillaries } from '@/components/auxillaries/AuxillariesProvider/AuxillariesProvider';

export default function AddOrbitalToApp() {
  useEffect(() => {
    prefetchAuxillaries?.();
  }, []);
  return null;
}
