/**
 * Deposit + read supply posture cards for the deposit/read workbench chain.
 */
"use client";

import React from "react";
import BitcodeActionWorkbenchCard from "@/components/bitcode/pipeline/BitcodeActionWorkbenchCard/BitcodeActionWorkbenchCard";

export type WorkbenchCardModel = {
  summary: string;
  metrics: Array<{ label: string; value: string }>;
  rows: Array<{ label: string; value: string }>;
  artifactKinds?: string[];
  closureCriteria?: string[];
  targetKinds?: string[];
};

export type ReadsDepositWorkbenchSupplyCardsProps = {
  deposit: WorkbenchCardModel;
  read: WorkbenchCardModel;
  selectedEntryChips: string[];
  recordingKey: "deposit" | "read" | "read-admission" | "fit" | null;
  showDemonstrationWorkbench: boolean;
  onRecord: (key: "deposit" | "read") => void;
};

export function ReadsDepositWorkbenchSupplyCards({
  deposit,
  read,
  selectedEntryChips,
  recordingKey,
  showDemonstrationWorkbench,
  onRecord,
}: ReadsDepositWorkbenchSupplyCardsProps) {
  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-2">
      <BitcodeActionWorkbenchCard
        id="terminalDepositWorkbench"
        badge="deposit"
        title="Repository supply and technical-intelligence posture"
        summary={deposit.summary}
        metrics={deposit.metrics}
        rows={deposit.rows}
        chips={selectedEntryChips.length ? selectedEntryChips : deposit.artifactKinds}
        actionLabel="Focus deposit draft"
        actionTarget="terminalDepositComposer"
        secondaryActionLabel={recordingKey === "deposit" ? "Recording…" : "Record deposit posture"}
        secondaryActionDisabled={recordingKey !== null}
        onSecondaryAction={() => {
          onRecord("deposit");
        }}
      />
      <BitcodeActionWorkbenchCard
        id="terminalReadWorkbench"
        badge="read"
        title="Read measurement and scenario posture"
        summary={read.summary}
        metrics={read.metrics}
        rows={read.rows}
        chips={
          read.closureCriteria?.length
            ? read.closureCriteria
            : read.targetKinds
        }
        actionLabel={
          showDemonstrationWorkbench ? "Focus read scenarios" : "Review measured Read"
        }
        actionTarget={
          showDemonstrationWorkbench ? "terminalReadScenarios" : "terminalReadWorkbench"
        }
        secondaryActionLabel={recordingKey === "read" ? "Recording…" : "Record read posture"}
        secondaryActionDisabled={recordingKey !== null}
        onSecondaryAction={() => {
          onRecord("read");
        }}
      />
    </div>
  );
}
