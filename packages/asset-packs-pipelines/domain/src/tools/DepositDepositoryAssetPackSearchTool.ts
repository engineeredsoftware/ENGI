/**
 * Tool wrapper around pure deposit Depository AssetPack search.
 */

import { Tool } from '@bitcode/tools-generics';
import {
  runDepositDepositoryAssetPackSearch,
  type DepositDepositorySearchToolInput,
  type DepositDepositorySearchToolResult,
} from './deposit-depository-asset-pack-search';

export type {
  DepositDepositorySearchToolInput,
  DepositDepositorySearchToolResult,
  DepositDepositorySearchHit,
} from './deposit-depository-asset-pack-search';

export { runDepositDepositoryAssetPackSearch } from './deposit-depository-asset-pack-search';

/**
 * @doc-tool
 * name: "depository-asset-pack-search"
 */
export class DepositDepositoryAssetPackSearchTool extends Tool<
  (input: DepositDepositorySearchToolInput) => Promise<DepositDepositorySearchToolResult>
> {
  name = 'depository-asset-pack-search';
  use = (input: DepositDepositorySearchToolInput) =>
    runDepositDepositoryAssetPackSearch(input);
}

export const depositDepositoryAssetPackSearchTool = new DepositDepositoryAssetPackSearchTool();
(depositDepositoryAssetPackSearchTool as any).name = 'depository-asset-pack-search';
