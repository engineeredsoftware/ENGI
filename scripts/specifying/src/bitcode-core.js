import crypto from 'node:crypto';
import { telemetry, telemetrySpan } from './telemetry.js';

export const BUNDLE_PRICE_UNITS = 100;
const MAX_BPS = 10000;

/**
 * @param {any} value
 * @returns {string}
 */
export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * @returns {string}
 */
export function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {any} value
 * @returns {string}
 */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = /** @type {Record<string, any>} */ (value);
  return `{${Object.keys(record).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(record[k])}`).join(',')}}`;
}

/**
 * @param {any} receipt
 * @returns {string}
 */
export function receiptHash(receipt) {
  return sha256(canonicalJson(receipt));
}

/**
 * @param {any} value
 * @returns {string}
 */
export function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

/**
 * @param {any} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {any} text
 * @returns {string[]}
 */
export function uniqueTokens(text) {
  return [...new Set(tokenize(text))];
}

/**
 * @param {any} text
 * @returns {any[]}
 */
export function chunkText(text) {
  const paragraphs = String(text || '')
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks = paragraphs.length ? paragraphs : [String(text || '').trim()].filter(Boolean);
  return chunks.map((body, index) => ({
    chunkId: `chunk-${index + 1}`,
    body,
    hash: sha256(body),
    preview: body.slice(0, 180),
    tokens: uniqueTokens(body)
  }));
}

/**
 * @param {any} input
 * @returns {any}
 */
export function makeAssetCommitment(input) {
  const body = String(input.content || '').trim();
  const chunks = chunkText(body);
  const allTokens = new Set(chunks.flatMap((c) => c.tokens));
  const assetId = `asset_${toSlug(input.title)}_${sha256(`${input.author}:${input.title}:${body}`).slice(0, 10)}`;
  const quantityBp = Math.min(MAX_BPS, Math.max(600, chunks.length * 1100 + allTokens.size * 20));
  const qualityBp =
    (input.compileOk ? 3000 : 1200) +
    (input.testsOk ? 2500 : 800) +
    (input.proofOk ? 3000 : 500) +
    Math.min(1200, Math.max(0, (input.reproducibilityBp ?? 700))) +
    Math.min(300, Math.max(0, (input.trustBp ?? 700)) / 10);
  const valenceBp = Math.min(
    MAX_BPS,
    (input.noveltyBp ?? 2200) +
    (input.demandBp ?? 2400) +
    (input.antiNoiseBp ?? 1800)
  );
  const measurement = normalizeMeasurement({ quantityBp, qualityBp, valenceBp });

  const output = {
    assetId,
    title: input.title,
    author: input.author,
    organization: input.organization || null,
    tags: input.tags || [],
    createdAt: nowIso(),
    sourceType: input.sourceType || 'note',
    preview: body.slice(0, 240),
    assetRoot: sha256(chunks.map((c) => c.hash).join(':')),
    verification: {
      compileOk: !!input.compileOk,
      testsOk: !!input.testsOk,
      proofOk: !!input.proofOk
    },
    measurement,
    privateBlob: {
      content: body,
      chunks: chunks.map(({ tokens, ...rest }) => rest)
    },
    chunkIndex: chunks,
    metadata: {
      citations: input.citations || [],
      authorshipClaim: input.authorshipClaim || 'self-asserted'
    }
  };

  telemetry('bitcode.makeAssetCommitment', {
    input: {
      title: input.title,
      author: input.author,
      organization: input.organization,
      sourceType: input.sourceType,
      tags: input.tags,
      contentLength: body.length,
      compileOk: !!input.compileOk,
      testsOk: !!input.testsOk,
      proofOk: !!input.proofOk
    },
    derived: {
      chunkCount: chunks.length,
      uniqueTokenCount: allTokens.size,
      quantityBp,
      qualityBp,
      valenceBp
    },
    output: {
      assetId: output.assetId,
      assetRoot: output.assetRoot,
      measurement: output.measurement
    }
  });

  return output;
}

/**
 * @param {any} input
 * @returns {{ quantityBp: number, qualityBp: number, valenceBp: number, totalBp: number }}
 */
export function normalizeMeasurement({ quantityBp, qualityBp, valenceBp }) {
  return {
    quantityBp: clampBp(quantityBp),
    qualityBp: clampBp(qualityBp),
    valenceBp: clampBp(valenceBp),
    totalBp: clampBp(Math.round((clampBp(quantityBp) * 0.2) + (clampBp(qualityBp) * 0.45) + (clampBp(valenceBp) * 0.35)))
  };
}

/**
 * @param {any} value
 * @returns {number}
 */
export function clampBp(value) {
  return Math.max(0, Math.min(MAX_BPS, Math.round(Number(value) || 0)));
}

/**
 * @param {any} input
 * @returns {any}
 */
export function seedLicense({ orgId, orgName, units }) {
  return {
    licenseId: `lic_${toSlug(orgId)}_${sha256(`${orgId}:${orgName}`).slice(0, 8)}`,
    orgId,
    orgName,
    active: true,
    unitsRemaining: units,
    createdAt: nowIso(),
    mode: 'private_bundle'
  };
}

/**
 * @param {any} query
 * @param {any[]} assets
 * @returns {any[]}
 */
export function rankChunksForQuery(query, assets) {
  const result = /** @type {any} */ (telemetrySpan('bitcode.rankChunksForQuery', {
    query,
    assetCount: assets.length,
    assetIds: assets.map((/** @type {any} */ asset) => asset.assetId)
  }, () => {
    const queryTerms = uniqueTokens(query);
    const results = [];
    for (const asset of assets) {
      for (const chunk of asset.chunkIndex || []) {
        const overlap = queryTerms.filter((token) => chunk.tokens.includes(token)).length;
        if (!overlap) continue;
        const lexicalBp = Math.min(MAX_BPS, overlap * 1800);
        const scoreBp = clampBp(Math.round((lexicalBp * 0.55) + (asset.measurement.totalBp * 0.45)));
        const candidate = {
          assetId: asset.assetId,
          title: asset.title,
          author: asset.author,
          chunkId: chunk.chunkId,
          chunkHash: chunk.hash,
          preview: chunk.preview,
          body: chunk.body,
          overlap,
          lexicalBp,
          assetMeasurementBp: asset.measurement.totalBp,
          scoreBp
        };
        telemetry('bitcode.rankChunksForQuery.candidate', { query, candidate });
        results.push(candidate);
      }
    }

    const ranked = results.sort((a, b) => b.scoreBp - a.scoreBp || b.overlap - a.overlap).slice(0, 6);
    return {
      queryTerms,
      candidateCount: results.length,
      topChunkIds: ranked.map((item) => `${item.assetId}:${item.chunkId}`),
      rankedChunks: ranked
    };
  }));
  return result.rankedChunks;
}

/**
 * @param {any} input
 * @returns {any}
 */
export function buildBundleIssuance({ orgId, orgName, query, license, rankedChunks }) {
  return telemetrySpan('bitcode.buildBundleIssuance', {
    orgId,
    orgName,
    query,
    license: license ? { orgId: license.orgId, unitsRemaining: license.unitsRemaining, active: license.active } : null,
    rankedChunkCount: rankedChunks.length
  }, () => {
    if (!license?.active) throw new Error('License is not active.');
    if (license.unitsRemaining < BUNDLE_PRICE_UNITS) throw new Error('License does not have enough units remaining.');
    if (!rankedChunks.length) throw new Error('No matching chunks found for this query.');

    const bundleId = `bundle_${sha256(`${orgId}:${query}:${Date.now()}`).slice(0, 12)}`;
    const bundleRoot = sha256(rankedChunks.map((/** @type {any} */ item) => item.chunkHash).join(':'));
    const meteredUnits = BUNDLE_PRICE_UNITS;
    const totals = rankedChunks.reduce((/** @type {any} */ sum, /** @type {any} */ item) => sum + item.scoreBp, 0);
    const weighted = rankedChunks.map((/** @type {any} */ item) => ({
      ...item,
      contributionBp: Math.floor((item.scoreBp * MAX_BPS) / totals)
    }));
    let used = weighted.reduce((/** @type {any} */ sum, /** @type {any} */ item) => sum + item.contributionBp, 0);
    if (used < MAX_BPS) weighted[0].contributionBp += (MAX_BPS - used);

    telemetry('bitcode.buildBundleIssuance.weighted', {
      bundleId,
      totals,
      weighted
    });

    const allocations = allocateUnits(meteredUnits, weighted);
    const publicReceipt = /** @type {any} */ ({
    type: 'bundle_issuance',
    receiptId: `rct_${sha256(bundleId).slice(0, 12)}`,
    bundleId,
    bundleRoot,
    issuedAt: nowIso(),
    orgId,
    orgName,
    queryHash: sha256(query),
    meteredUnits,
    assetIds: [...new Set(weighted.map((/** @type {any} */ item) => item.assetId))],
    chunkRefs: weighted.map((/** @type {any} */ item) => ({
      assetId: item.assetId,
      chunkId: item.chunkId,
      chunkHash: item.chunkHash,
      scoreBp: item.scoreBp,
      contributionBp: item.contributionBp
    }))
  });
  publicReceipt.receiptHash = receiptHash(publicReceipt);

    const allocationReceipt = /** @type {any} */ ({
      type: 'allocation',
      receiptId: `rct_${sha256(`${bundleId}:allocation`).slice(0, 12)}`,
      bundleId,
      issuedAt: nowIso(),
      totalUnits: meteredUnits,
      allocations: allocations.map((/** @type {any} */ item) => ({
        assetId: item.assetId,
        author: item.author,
        units: item.units,
        contributionBp: item.contributionBp
      }))
    });
    allocationReceipt.receiptHash = receiptHash(allocationReceipt);

    const privateBundle = {
      bundleId,
      query,
      bundleRoot,
      chunks: weighted.map((/** @type {any} */ item) => ({
        assetId: item.assetId,
        title: item.title,
        author: item.author,
        chunkId: item.chunkId,
        body: item.body,
        chunkHash: item.chunkHash
      }))
    };

    return { publicReceipt, allocationReceipt, privateBundle, allocations };
  });
}

/**
 * @param {any} totalUnits
 * @param {any[]} weightedChunks
 * @returns {any[]}
 */
export function allocateUnits(totalUnits, weightedChunks) {
  return /** @type {any[]} */ (telemetrySpan('bitcode.allocateUnits', {
    totalUnits,
    weightedChunkCount: weightedChunks.length,
    weightedChunks
  }, () => {
    const byAsset = new Map();
    for (const item of weightedChunks) {
      const current = byAsset.get(item.assetId) || {
        assetId: item.assetId,
        author: item.author,
        units: 0,
        contributionBp: 0
      };
      current.contributionBp += item.contributionBp;
      byAsset.set(item.assetId, current);
    }

    const allocations = [...byAsset.values()].map((item) => ({
      ...item,
      units: Math.floor((item.contributionBp * totalUnits) / MAX_BPS)
    }));
    let allocated = allocations.reduce((sum, item) => sum + item.units, 0);
    if (allocated < totalUnits && allocations.length) allocations[0].units += (totalUnits - allocated);
    return allocations.sort((a, b) => b.units - a.units);
  }));
}

/**
 * @param {any} input
 * @returns {any}
 */
export function utilityReceipt({ bundleId, benchmark, baselineBp, treatmentBp }) {
  return telemetrySpan('bitcode.utilityReceipt', {
    bundleId,
    benchmark,
    baselineBp,
    treatmentBp
  }, () => {
    const upliftBp = clampBp(treatmentBp - baselineBp);
    const receipt = /** @type {any} */ ({
      type: 'utility',
      receiptId: `rct_${sha256(`${bundleId}:${benchmark}`).slice(0, 12)}`,
      bundleId,
      benchmark,
      baselineBp: clampBp(baselineBp),
      treatmentBp: clampBp(treatmentBp),
      upliftBp,
      issuedAt: nowIso()
    });
    receipt.receiptHash = receiptHash(receipt);
    return receipt;
  });
}
