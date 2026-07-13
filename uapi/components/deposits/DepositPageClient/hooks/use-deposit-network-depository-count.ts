/**
 * Network-visible Depository AssetPack count for the deposit header metric.
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
          if (disposed || !payload) return;
          setNetworkDepositoryCount(
            Array.isArray(payload.records) ? payload.records.length : null,
          );
        })
        .catch(() => {});
    }
    return () => {
      disposed = true;
    };
  }, []);

  return networkDepositoryCount;
}
