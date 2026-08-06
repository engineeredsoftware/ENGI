/**
 * Network-visible Depository DataPack count for the deposit header metric.
 * Source-safe aggregate only — never individual pack source content.
 */
"use client";

import { useEffect, useState } from "react";

export function useDepositNetworkDepositoryCount() {
  const [networkDepositoryCount, setNetworkDepositoryCount] = useState<
    number | null
  >(null);

  useEffect(() => {
    let disposed = false;
    const request = fetch(
      "/api/packs/activity?scope=network&type=depository-assetpack",
    );
    if (request && typeof request.then === "function") {
      request
        .then((response) => (response && response.ok ? response.json() : null))
        .then((payload) => {
          if (disposed) return;
          // Always settle so header chips can enter; 0 on miss/failure.
          setNetworkDepositoryCount(
            payload && Array.isArray(payload.records) ? payload.records.length : 0,
          );
        })
        .catch(() => {
          if (!disposed) setNetworkDepositoryCount(0);
        });
    } else if (!disposed) {
      setNetworkDepositoryCount(0);
    }
    return () => {
      disposed = true;
    };
  }, []);

  return networkDepositoryCount;
}
