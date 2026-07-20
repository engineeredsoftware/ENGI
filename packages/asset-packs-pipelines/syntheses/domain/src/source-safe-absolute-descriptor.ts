/**
 * Instance descriptors for absolute readings on a specific AssetPack option.
 *
 * Bound to measured numbers + source-safe structure profile (path module roots,
 * language keys, op mix, quantity shape). Never raw source, never catalog
 * glossary about AssetPacks in general.
 */

export type PackStructureTopology = 'hierarchical' | 'flat' | 'shallow';
export type PackStructureCohesion = 'connected' | 'separated' | 'mixed';

/**
 * Source-safe structural profile of **this** measured pack (counts + path
 * prefixes + language keys only — no identifiers or file bodies).
 */
export type SourceSafePackStructureProfile = {
  topology: PackStructureTopology;
  cohesion: PackStructureCohesion;
  /** Top-level path modules (e.g. src, packages) — capped, sorted. */
  moduleRoots: string[];
  /** Language keys from covered extensions (e.g. ts, py). */
  languages: string[];
  ops: { create: number; modify: number; delete: number; other: number };
  functionCount: number;
  typeCount: number;
  fileSpan: number;
  symbolCount: number;
  moduleCount: number;
  measuredFromSamples: boolean;
};

export type SourceSafeAbsoluteDescriptorInput = {
  measurementKind: string;
  label: string;
  unit: string;
  magnitude: number;
  volume: number;
  weight: number;
  packTitle?: string | null;
  /** Structure of this pack — required for instance-specific second sentence. */
  structure?: SourceSafePackStructureProfile | null;
};

function pct(volume: number): number {
  const n = Number.isFinite(volume) ? volume : 0;
  return Math.round(Math.max(0, Math.min(1, n)) * 100);
}

function mag(magnitude: number): string {
  if (!Number.isFinite(magnitude)) return '0';
  if (Math.abs(magnitude - Math.round(magnitude)) < 1e-9) {
    return String(Math.max(0, Math.round(magnitude)));
  }
  return Number(magnitude).toFixed(2);
}

function packRef(packTitle?: string | null): string {
  return typeof packTitle === 'string' && packTitle.trim()
    ? `"${packTitle.trim()}"`
    : 'this AssetPack option';
}

/** e.g. modules:src,lib · languages:ts · ops:modify */
function coverageAreas(structure: SourceSafePackStructureProfile): string {
  const parts: string[] = [];
  if (structure.moduleRoots.length > 0) {
    parts.push(`modules:${structure.moduleRoots.slice(0, 6).join(',')}`);
  }
  if (structure.languages.length > 0) {
    parts.push(`languages:${structure.languages.slice(0, 6).join(',')}`);
  }
  const opBits: string[] = [];
  if (structure.ops.create > 0) opBits.push(`create×${structure.ops.create}`);
  if (structure.ops.modify > 0) opBits.push(`modify×${structure.ops.modify}`);
  if (structure.ops.delete > 0) opBits.push(`delete×${structure.ops.delete}`);
  if (structure.ops.other > 0) opBits.push(`other×${structure.ops.other}`);
  if (opBits.length > 0) parts.push(`ops:${opBits.join('+')}`);
  // Kind + symbols sub-group from this pack’s quantity shape.
  const kindBits: string[] = [];
  if (structure.functionCount > 0) kindBits.push(`functions×${structure.functionCount}`);
  if (structure.typeCount > 0) kindBits.push(`types×${structure.typeCount}`);
  if (structure.symbolCount > 0) kindBits.push(`symbols×${structure.symbolCount}`);
  if (kindBits.length > 0) parts.push(`kinds:${kindBits.join('+')}`);
  return parts.length > 0 ? parts.join(' · ') : 'unspecified path span';
}

function symbologyClause(structure: SourceSafePackStructureProfile): string {
  return (
    `Symbology of this pack is ${structure.topology}, ${structure.cohesion}, ` +
    `covering areas of [${coverageAreas(structure)}].`
  );
}

function quantityShapeClause(structure: SourceSafePackStructureProfile): string {
  return (
    `This pack’s quantity shape is ${structure.functionCount} functions / ` +
    `${structure.typeCount} types / ${structure.fileSpan} files / ` +
    `${structure.symbolCount} symbols / ${structure.moduleCount} modules` +
    `${structure.measuredFromSamples ? '' : ' (path-span heuristic; samples not measured)'}.`
  );
}

/**
 * Derive source-safe structure profile from path/op/language/quantity signals.
 */
export function buildSourceSafePackStructureProfile(input: {
  coveredSourcePaths?: string[];
  fileChanges?: Array<{ path: string; op: string }>;
  languages?: string[];
  functionCount: number;
  typeCount: number;
  fileSpan: number;
  symbolCount: number;
  moduleCount: number;
  measuredFromSamples?: boolean;
}): SourceSafePackStructureProfile {
  const paths = [
    ...(input.coveredSourcePaths || []),
    ...(input.fileChanges || []).map((c) => c.path),
  ]
    .map((p) => String(p || '').replace(/^\/+/, '').trim())
    .filter(Boolean);

  const moduleRoots = new Set<string>();
  let maxDepth = 0;
  for (const path of paths) {
    const parts = path.split('/').filter(Boolean);
    maxDepth = Math.max(maxDepth, parts.length);
    if (parts[0]) moduleRoots.add(parts[0]);
  }

  const ops = { create: 0, modify: 0, delete: 0, other: 0 };
  for (const change of input.fileChanges || []) {
    const op = String(change.op || '').toLowerCase();
    if (op === 'create' || op === 'add' || op === 'added') ops.create += 1;
    else if (op === 'modify' || op === 'update' || op === 'changed') ops.modify += 1;
    else if (op === 'delete' || op === 'remove' || op === 'removed') ops.delete += 1;
    else ops.other += 1;
  }

  const moduleCount = Math.max(1, input.moduleCount || moduleRoots.size || 1);
  const fileSpan = Math.max(0, input.fileSpan);
  const topology: PackStructureTopology =
    maxDepth >= 3 || moduleCount >= 3
      ? 'hierarchical'
      : maxDepth <= 1 && moduleCount <= 1
        ? 'flat'
        : 'shallow';
  // Connected: few modules relative to files; separated: many modules vs files.
  const cohesion: PackStructureCohesion =
    fileSpan <= 1
      ? 'connected'
      : moduleCount >= Math.max(2, Math.ceil(fileSpan * 0.75))
        ? 'separated'
        : moduleCount === 1
          ? 'connected'
          : 'mixed';

  const languages = (input.languages || [])
    .map((l) => String(l || '').trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

  return {
    topology,
    cohesion,
    moduleRoots: [...moduleRoots].sort().slice(0, 8),
    languages,
    ops,
    functionCount: Math.max(0, Math.round(input.functionCount)),
    typeCount: Math.max(0, Math.round(input.typeCount)),
    fileSpan: Math.max(0, Math.round(fileSpan)),
    symbolCount: Math.max(0, Math.round(input.symbolCount)),
    moduleCount,
    measuredFromSamples: input.measuredFromSamples === true,
  };
}

/**
 * Build buyer-facing prose for **this** measured reading.
 * Sentence 1: this pack’s measured numbers. Sentence 2: this pack’s structure.
 */
export function buildSourceSafeAbsoluteDescriptor(
  input: SourceSafeAbsoluteDescriptorInput,
): string {
  const unit = input.unit || 'units';
  const m = mag(input.magnitude);
  const vPct = pct(input.volume);
  const w =
    typeof input.weight === 'number' && Number.isFinite(input.weight)
      ? input.weight.toFixed(2)
      : '—';
  const title = packRef(input.packTitle);
  const structure = input.structure;
  const structureTail = structure
    ? symbologyClause(structure)
    : 'Structure profile for this pack was not attached at measure time.';

  switch (input.measurementKind) {
    case 'function-count':
      return (
        `${title} has ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        (structure
          ? `Behavior surface of this pack is ${structure.topology}, ${structure.cohesion}, covering areas of [${coverageAreas(structure)}].`
          : structureTail)
      );
    case 'type-count':
      return (
        `${title} has ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        (structure
          ? `Type surface of this pack is ${structure.topology}, ${structure.cohesion}, covering areas of [${coverageAreas(structure)}].`
          : structureTail)
      );
    case 'file-span':
      return (
        `${title} spans ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        (structure
          ? `File layout of this pack is ${structure.topology}, ${structure.cohesion}, covering areas of [${coverageAreas(structure)}].`
          : structureTail)
      );
    case 'symbolic-richness':
      return (
        `${title} has ${m} unique ${unit} (volume ${vPct}%, weight ${w}). ` +
        structureTail
      );
    case 'modularity':
      return (
        `${title} covers ${m} ${unit} (volume ${vPct}%, weight ${w}). ` +
        (structure
          ? `Module layout of this pack is ${structure.topology}, ${structure.cohesion}, covering areas of [${coverageAreas(structure)}].`
          : structureTail)
      );
    case 'correctness-estimate':
      return (
        `${title} correctness estimate ${m} (${unit}; volume ${vPct}%, weight ${w}). ` +
        (structure
          ? `${quantityShapeClause(structure)} Coherence reading is grounded in that measured shape for this pack only.`
          : structureTail)
      );
    case 'objectives-fidelity':
      return (
        `${title} objectives fidelity ${m} (${unit}; volume ${vPct}%, weight ${w}). ` +
        (structure
          ? `Fidelity is judged against this pack’s ${structure.topology}/${structure.cohesion} span over [${coverageAreas(structure)}].`
          : structureTail)
      );
    case 'computational-usage':
      return (
        `${title} computational usage ${m} (${unit}; volume ${vPct}%, weight ${w}). ` +
        (structure
          ? `Demand estimate for this pack follows ${quantityShapeClause(structure)}`
          : structureTail)
      );
    default:
      return (
        `${title} ${input.label || input.measurementKind}: magnitude ${m} ${unit}, volume ${vPct}%, weight ${w}. ` +
        structureTail
      );
  }
}
