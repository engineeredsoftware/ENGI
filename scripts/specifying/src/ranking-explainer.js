import { clampBp } from './bitcode-core.js';
import { telemetry, telemetrySpan } from './telemetry.js';

/**
 * @param {any} query
 * @param {any[]} rankedChunks
 * @param {any[]} assets
 * @returns {any}
 */
export function explainRankedChunks(query, rankedChunks, assets) {
  return telemetrySpan('bitcode.explainRankedChunks', {
    query,
    rankedChunkCount: rankedChunks.length,
    assetCount: assets.length
  }, () => {
    const assetMap = new Map(assets.map((/** @type {any} */ asset) => [asset.assetId, asset]));
    const totalScore = rankedChunks.reduce((/** @type {any} */ sum, /** @type {any} */ item) => sum + Number(item.scoreBp || 0), 0) || 1;

    return rankedChunks.map((/** @type {any} */ item) => {
      const asset = assetMap.get(item.assetId);
      const assetMeasurementBp = asset?.measurement?.totalBp || 0;
      const lexicalBp = clampBp(Math.round((Number(item.scoreBp || 0) - (assetMeasurementBp * 0.45)) / 0.55));
      const contributionBp = Math.floor((Number(item.scoreBp || 0) * 10000) / totalScore);
      const explanation = {
        query,
        assetId: item.assetId,
        title: item.title,
        chunkId: item.chunkId,
        overlap: item.overlap,
        lexicalBp,
        assetMeasurementBp,
        finalScoreBp: item.scoreBp,
        contributionBp,
        explanation: `Chunk matched ${item.overlap} query terms; lexical match and asset measurement were blended into the final score.`
      };
      telemetry('bitcode.explainRankedChunks.entry', explanation);
      return explanation;
    });
  });
}
