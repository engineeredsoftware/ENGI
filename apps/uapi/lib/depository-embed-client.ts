/**
 * uapi re-export of domain depository embed client (gte-small / Edge).
 * Prefer importing from domain in packages; uapi keeps this path for app jobs.
 */

export {
  embedDepositoryText,
  embedDepositoryTextVector,
  type DepositoryEmbedResult,
} from '@bitcode/asset-packs-pipelines-syntheses-domain/depository-embed';
