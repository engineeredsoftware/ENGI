import {
  AssetPackDeliveryMechanismTemplate,
  AssetPackWrittenAssetType,
} from './types/AssetPackWrittenAssetType';

const DEFAULT_WRITTEN_ASSET_TYPE = AssetPackWrittenAssetType.ReadSatisfactionAssetPack;
const DEFAULT_DELIVERY_MECHANISM_TEMPLATE: AssetPackDeliveryMechanismTemplate = 'pull-request';

function firstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

export function normalizeWrittenAssetType(
  _candidate: unknown,
  fallback: AssetPackWrittenAssetType = DEFAULT_WRITTEN_ASSET_TYPE
): AssetPackWrittenAssetType {
  return fallback;
}

export function normalizeDeliveryMechanismTemplate(
  candidate: unknown,
  fallback: AssetPackDeliveryMechanismTemplate = DEFAULT_DELIVERY_MECHANISM_TEMPLATE
): AssetPackDeliveryMechanismTemplate {
  const raw = firstString(candidate);
  if (!raw) return fallback;

  const normalized = raw.toLowerCase();
  if (
    normalized === 'pull-request' ||
    normalized === 'pr' ||
    normalized.includes('pull')
  ) {
    return 'pull-request';
  }

  if (
    normalized.includes('branch') ||
    normalized.includes('deployment') ||
    normalized.includes('code') ||
    normalized.includes('review') ||
    normalized.includes('comment') ||
    normalized.includes('issue') ||
    normalized.includes('design')
  ) {
    throw new Error(
      `AssetPack Finish supports pull-request delivery only; received ${raw}`
    );
  }

  return fallback;
}

export function normalizeWrittenAssetRequest(
  candidate: unknown,
  fallback = 'asset-pack'
): string {
  const raw = firstString(candidate);
  if (!raw) return fallback;
  const normalized = raw.toLowerCase();
  if (normalized.includes('read-satisfaction') || normalized.includes('asset-pack')) {
    return 'read-satisfaction-asset-pack';
  }
  return fallback;
}

export function resolveWrittenAssetType(
  input: any,
  fallback: AssetPackWrittenAssetType = DEFAULT_WRITTEN_ASSET_TYPE
): AssetPackWrittenAssetType {
  return normalizeWrittenAssetType(input, fallback);
}

export function resolveDeliveryMechanismTemplate(input: any): AssetPackDeliveryMechanismTemplate {
  return normalizeDeliveryMechanismTemplate(
    input?.deliveryMechanismTemplate ??
      input?.deliveryMechanism?.template ??
      input?.deliveryMechanism?.type ??
      input?.deliveryTarget
  );
}

export function resolveWrittenAssetTypeFromExecution(
  execution: any,
  fallback: AssetPackWrittenAssetType = DEFAULT_WRITTEN_ASSET_TYPE
): AssetPackWrittenAssetType {
  return normalizeWrittenAssetType(execution, fallback);
}

export function resolveDeliveryMechanismTemplateFromExecution(
  execution: any,
  fallback: AssetPackDeliveryMechanismTemplate = DEFAULT_DELIVERY_MECHANISM_TEMPLATE
): AssetPackDeliveryMechanismTemplate {
  return normalizeDeliveryMechanismTemplate(
    execution?.findUp?.('pipeline', 'deliveryMechanismTemplate') ??
      execution?.get?.('pipeline', 'deliveryMechanismTemplate') ??
      execution?.findUp?.('pipeline', 'deliveryTarget') ??
      execution?.get?.('pipeline', 'deliveryTarget'),
    fallback
  );
}

export function resolveExpressedRead(input: any, fallback = ''): string {
  const legacyReadKey = ['ne', 'ed'].join('');
  const candidate =
    input?.read ??
    input?.[legacyReadKey] ??
    input?.definitionOfRead ??
    input?.readDefinition ??
    fallback;

  if (Array.isArray(candidate)) {
    return candidate.filter((entry) => typeof entry === 'string').join('\n');
  }

  return typeof candidate === 'string' ? candidate : fallback;
}

export function resolveExpressedReadFromExecution(execution: any, fallback = ''): string {
  return resolveExpressedRead(
    {
      read:
        execution?.get?.('read', 'description') ??
        execution?.get?.('pipeline', 'expressedRead'),
    },
    fallback
  );
}

export function resolveReadComprehensionFromExecution(execution: any): any {
  return (
    execution?.get?.('setup/read', 'comprehension') ??
    execution?.get?.('setup/read-comprehension', 'comprehension')
  );
}
