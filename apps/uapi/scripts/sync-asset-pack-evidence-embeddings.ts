#!/usr/bin/env ts-node

// Load environment
require('dotenv').config();

// Validate API key
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

const { OpenAI } = require('openai');
const { supabaseAdmin } = require('@bitcode/supabase');
const {
  buildOpenAIEmbeddingCreateParams,
  normalizeAssetPackEmbeddingVector,
  resolveAssetPackEmbeddingConfig,
} = require('@bitcode/asset-packs-pipelines-syntheses-domain/src/embedding-config');

// Retained Exchange storage identifiers; this script owns AssetPack evidence semantics.
const ASSET_PACK_EVIDENCE_TABLE = 'deliverables';
const ASSET_PACK_EVIDENCE_VECTOR_TABLE = 'deliverable_vectors';
const ASSET_PACK_EVIDENCE_EMBEDDING_CONFIG = resolveAssetPackEmbeddingConfig();

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log('Fetching existing AssetPack evidence from retained Exchange storage...');

  const { data: assetPackEvidenceRows, error: fetchError } = await supabaseAdmin
    .from(ASSET_PACK_EVIDENCE_TABLE)
    .select('id, user_id, output');

  if (fetchError) {
    console.error('Failed to fetch AssetPack evidence:', fetchError.message);
    process.exit(1);
  }

  const evidenceRows = assetPackEvidenceRows ?? [];
  console.log(`Embedding ${evidenceRows.length} AssetPack evidence rows...`);

  for (const evidence of evidenceRows) {
    process.stdout.write(`Embedding AssetPack evidence '${evidence.id}'... `);

    try {
      const res = await openai.embeddings.create(
        buildOpenAIEmbeddingCreateParams(evidence.output || '', ASSET_PACK_EVIDENCE_EMBEDDING_CONFIG)
      );
      const embedding = normalizeAssetPackEmbeddingVector(
        res.data[0].embedding,
        ASSET_PACK_EVIDENCE_EMBEDDING_CONFIG
      );
      if (!embedding) {
        console.error(
          `FAILED expected ${ASSET_PACK_EVIDENCE_EMBEDDING_CONFIG.dimensions} dimensions from ${ASSET_PACK_EVIDENCE_EMBEDDING_CONFIG.model}`
        );
        continue;
      }

      const { error: upsertError } = await supabaseAdmin
        .from(ASSET_PACK_EVIDENCE_VECTOR_TABLE)
        .upsert({
          deliverable_id: evidence.id,
          user_id: evidence.user_id,
          output: evidence.output,
          embedding,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.error('FAILED', upsertError.message);
      } else {
        console.log('OK');
      }
    } catch (err) {
      console.error('ERROR', err instanceof Error ? err.message : String(err));
    }
  }
}

main().catch(err => {
  console.error('Sync AssetPack evidence embeddings failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
