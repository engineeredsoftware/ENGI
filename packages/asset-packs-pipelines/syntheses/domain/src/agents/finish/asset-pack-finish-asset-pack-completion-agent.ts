/**
 * AssetPack-named Finish completion entrypoint that forwards to the shared
 * AssetPack completion agent used by the Finish phase.
 */

export {
  FileChangesSchema,
  AssetPackCompletionOutputSchema,
  ShippableSchema,
  type AssetPackCompletionOutput,
  default
} from './asset-pack-completion-agent';
