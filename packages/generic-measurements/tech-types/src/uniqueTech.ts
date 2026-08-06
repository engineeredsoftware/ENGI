// Manually curated *unique* technology identifiers combining umbrella brand,
// technology/framework, primary language, **and** an explicit version (SemVer).
//
// Each entry is a single string in the format:
//     `${Umbrella}${Tech}${Language}@${SemVer}`
//
// The list should only contain *real* combinations that Bitcode actively
// supports.  Additions are made manually to ensure we remain precise about
// which permutations exist (`FacebookReactSwift` vs `GoogleReactSwift`, etc.).

import { BRANDS, TECHNOLOGIES, PROGRAMMING_LANGUAGES, SemVer } from './tech';

// Example support matrix – expand as needed --------------------------------------------------

export const UNIQUE_TECH = {
  // Web – React / Next.js ----------------------------------------------------
  VercelNextJSTypeScript_13_4_0: 'VercelNextJSTypeScript@13.4.0',
  VercelNextJSJavaScript_13_4_0: 'VercelNextJSJavaScript@13.4.0',

  MetaReactNativeTypeScript_0_72_0: 'MetaReactNativeTypeScript@0.72.0',
  MetaReactNativeJavaScript_0_72_0: 'MetaReactNativeJavaScript@0.72.0',

  // Mobile ------------------------------------------------------------------
  GoogleFlutterDart_3_22_0: 'GoogleFlutterDart@3.22.0',

  // Blockchain --------------------------------------------------------------
  EthereumFoundationHardhatTypeScript_2_20_0: 'EthereumFoundationHardhatTypeScript@2.20.0',
  EthereumFoundationHardhatJavaScript_2_20_0: 'EthereumFoundationHardhatJavaScript@2.20.0',

  // Game engines -------------------------------------------------------------
  UnityUnityCSharp_2023_3_0: 'UnityUnityCSharp@2023.3.0',
  UnrealUnrealEngineCPlusPlus_5_4_0: 'UnrealUnrealEngineCPlusPlus@5.4.0',

  // ───────────────────────────────────────────────────────────────────────
  //  Additional high-impact stacks (manually verified)                     │
  // ───────────────────────────────────────────────────────────────────────

  // Web – React -----------------------------------------------------------
  MetaReactTypeScript_18_2_0: 'MetaReactTypeScript@18.2.0',
  MetaReactJavaScript_18_2_0: 'MetaReactJavaScript@18.2.0',

  // Serverless ------------------------------------------------------------
  AmazonAWSLambdaTypeScript_1_0_0: 'AmazonAWSLambdaTypeScript@1.0.0',
  AmazonAWSLambdaJavaScript_1_0_0: 'AmazonAWSLambdaJavaScript@1.0.0',

  // Back-end (.NET) -------------------------------------------------------
  MicrosoftASPNetCoreCSharp_8_0_0: 'MicrosoftASPNetCoreCSharp@8.0.0',

  // Data / ML -------------------------------------------------------------
  ApacheSparkScala_3_5_0: 'ApacheSparkScala@3.5.0',
  GoogleTensorFlowPython_2_16_0: 'GoogleTensorFlowPython@2.16.0',

  // Web – Express ----------------------------------------------------------
  NodeJSFoundationExpressTypeScript_4_18_2: 'NodeJSFoundationExpressTypeScript@4.18.2',
  NodeJSFoundationExpressJavaScript_4_18_2: 'NodeJSFoundationExpressJavaScript@4.18.2',

  // Web – NestJS -----------------------------------------------------------
  NodeJSFoundationNestJSTypeScript_10_2_0: 'NodeJSFoundationNestJSTypeScript@10.2.0',
  NodeJSFoundationNestJSJavaScript_10_2_0: 'NodeJSFoundationNestJSJavaScript@10.2.0',

  // Python web frameworks --------------------------------------------------
  PythonSoftwareFoundationDjangoPython_5_0_0: 'PythonSoftwareFoundationDjangoPython@5.0.0',
  PythonSoftwareFoundationFlaskPython_2_3_0: 'PythonSoftwareFoundationFlaskPython@2.3.0',
  PythonSoftwareFoundationFastAPIPython_0_110_0: 'PythonSoftwareFoundationFastAPIPython@0.110.0',

  // Java / Spring ----------------------------------------------------------
  VMwareSpringBootJava_3_2_0: 'VMwareSpringBootJava@3.2.0',

  // PHP -------------------------------------------------------------------
  LaravelLaravelPHP_11_0_0: 'LaravelLaravelPHP@11.0.0',
  SymfonySymfonyPHP_6_4_0: 'SymfonySymfonyPHP@6.4.0',

  // Ruby ------------------------------------------------------------------
  RailsRailsRuby_7_1_0: 'RailsRailsRuby@7.1.0',

  // ───────────────────────────────────────────────────────────────────────
  //  Front-end & Mobile – extended coverage                               │
  // ───────────────────────────────────────────────────────────────────────

  // Vue / Nuxt -----------------------------------------------------------
  VueVueTypeScript_3_4_0: 'VueVueTypeScript@3.4.0',
  VueVueJavaScript_3_4_0: 'VueVueJavaScript@3.4.0',

  NuxtLabsNuxtJSTypeScript_3_10_0: 'NuxtLabsNuxtJSTypeScript@3.10.0',
  NuxtLabsNuxtJSJavaScript_3_10_0: 'NuxtLabsNuxtJSJavaScript@3.10.0',

  // Angular --------------------------------------------------------------
  GoogleAngularTypeScript_17_2_0: 'GoogleAngularTypeScript@17.2.0',
  GoogleAngularJavaScript_17_2_0: 'GoogleAngularJavaScript@17.2.0',

  // Svelte / SvelteKit ----------------------------------------------------
  SvelteSvelteTypeScript_4_2_0: 'SvelteSvelteTypeScript@4.2.0',
  SvelteSvelteJavaScript_4_2_0: 'SvelteSvelteJavaScript@4.2.0',

  SvelteSvelteKitTypeScript_2_3_0: 'SvelteSvelteKitTypeScript@2.3.0',
  SvelteSvelteKitJavaScript_2_3_0: 'SvelteSvelteKitJavaScript@2.3.0',

  // SolidJS --------------------------------------------------------------
  SolidJSSolidJSTypeScript_1_8_0: 'SolidJSSolidJSTypeScript@1.8.0',
  SolidJSSolidJSJavaScript_1_8_0: 'SolidJSSolidJSJavaScript@1.8.0',

  // Mobile – Ionic / Capacitor ------------------------------------------
  IonicIonicTypeScript_7_5_0: 'IonicIonicTypeScript@7.5.0',
  CapacitorCapacitorTypeScript_5_6_0: 'CapacitorCapacitorTypeScript@5.6.0',

  // ───────────────────────────────────────────────────────────────────────
  //  Back-end – Node & others                                             │
  // ───────────────────────────────────────────────────────────────────────

  NodeJSFoundationKoaTypeScript_2_14_2: 'NodeJSFoundationKoaTypeScript@2.14.2',
  NodeJSFoundationKoaJavaScript_2_14_2: 'NodeJSFoundationKoaJavaScript@2.14.2',

  NodeJSFoundationFastifyTypeScript_4_25_2: 'NodeJSFoundationFastifyTypeScript@4.25.2',
  NodeJSFoundationFastifyJavaScript_4_25_2: 'NodeJSFoundationFastifyJavaScript@4.25.2',

  NodeJSFoundationHapiTypeScript_21_6_0: 'NodeJSFoundationHapiTypeScript@21.6.0',
  NodeJSFoundationHapiJavaScript_21_6_0: 'NodeJSFoundationHapiJavaScript@21.6.0',

  NodeJSFoundationAdonisJSTypeScript_6_9_0: 'NodeJSFoundationAdonisJSTypeScript@6.9.0',
  NodeJSFoundationAdonisJSJavaScript_6_9_0: 'NodeJSFoundationAdonisJSJavaScript@6.9.0',

  NodeJSFoundationFeathersJSTypeScript_5_3_0: 'NodeJSFoundationFeathersJSTypeScript@5.3.0',
  NodeJSFoundationFeathersJSJavaScript_5_3_0: 'NodeJSFoundationFeathersJSJavaScript@5.3.0',

  NodeJSFoundationGraphQLYogaTypeScript_5_3_0: 'NodeJSFoundationGraphQLYogaTypeScript@5.3.0',
  NodeJSFoundationGraphQLYogaJavaScript_5_3_0: 'NodeJSFoundationGraphQLYogaJavaScript@5.3.0',

  // Python – Tornado ------------------------------------------------------
  PythonSoftwareFoundationTornadoPython_6_4_0: 'PythonSoftwareFoundationTornadoPython@6.4.0',

  // Java – Quarkus / Micronaut -------------------------------------------
  RedHatQuarkusJava_3_11_0: 'RedHatQuarkusJava@3.11.0',
  OracleMicronautJava_4_2_0: 'OracleMicronautJava@4.2.0',

  // .NET – Blazor ---------------------------------------------------------
  MicrosoftBlazorCSharp_8_0_0: 'MicrosoftBlazorCSharp@8.0.0',

  // Rust – Actix / Rocket --------------------------------------------------
  ActixActixWebRust_0_13_0: 'ActixActixWebRust@0.13.0',
  RocketRocketRust_0_5_0: 'RocketRocketRust@0.5.0',

  // ───────────────────────────────────────────────────────────────────────
  //  Infrastructure / IaC / Observability                                 │
  // ───────────────────────────────────────────────────────────────────────

  GitHubGitHubActionsYAML_1_0_0: 'GitHubGitHubActionsYAML@1.0.0',
  RustFoundationCargoRust_1_77_0: 'RustFoundationCargoRust@1.77.0',
  HashicorpTerraformHCL_1_8_0: 'HashicorpTerraformHCL@1.8.0',
  DockerDockerYAML_26_0_0: 'DockerDockerYAML@26.0.0',
  PulumiPulumiTypeScript_3_111_0: 'PulumiPulumiTypeScript@3.111.0',
  RedHatAnsibleYAML_9_5_0: 'RedHatAnsibleYAML@9.5.0',
  CNCFHelmYAML_3_14_0: 'CNCFHelmYAML@3.14.0',
  CNCFKubernetesYAML_1_30_0: 'CNCFKubernetesYAML@1.30.0',
  CNCFPrometheusYAML_2_52_0: 'CNCFPrometheusYAML@2.52.0',
  GrafanaLabsGrafanaYAML_10_4_0: 'GrafanaLabsGrafanaYAML@10.4.0',
  OpenTelemetryOpenTelemetryYAML_1_27_0: 'OpenTelemetryOpenTelemetryYAML@1.27.0',
} as const;

// Type helpers --------------------------------------------------------------

export type UniqueTechIdentifier = typeof UNIQUE_TECH[keyof typeof UNIQUE_TECH];
export type UniqueTech = UniqueTechIdentifier;

/**
 * Convenience helper that returns the canonical `UniqueTechIdentifier` string
 * for the given tuple **if** it exists in the curated catalogue, otherwise
 * `undefined`.
 */
export function getUniqueTechIdentifier(
  umbrella: ParsedUniqueTech['umbrella'],
  tech: ParsedUniqueTech['tech'],
  language: ParsedUniqueTech['language'],
  version: SemVer,
): UniqueTechIdentifier | undefined {
  const candidate = `${umbrella}${tech}${language}@${version}`;
  // Membership in the curated catalogue is the proof step that lets us narrow
  // the runtime string to the exported union without forcing TypeScript to
  // materialize the full cartesian product up front.
  return (Object.values(UNIQUE_TECH) as readonly string[]).includes(candidate)
    ? candidate as UniqueTechIdentifier
    : undefined;
}

/**
 * Return the SemVer segment from a curated unique technology identifier.
 */
export function getTechVersion(id: UniqueTechIdentifier): SemVer {
  return parseUniqueTechIdentifier(id).version;
}

export interface ParsedUniqueTech {
  umbrella: (typeof BRANDS)[number];
  tech: (typeof TECHNOLOGIES)[number];
  language: (typeof PROGRAMMING_LANGUAGES)[number];
  version: SemVer;
}

// Very small runtime helper to split an identifier string back into its parts
/**
 * Split a UniqueTechIdentifier back into its constituent parts using the
 * canonical enum lists.  This implementation intentionally **avoids** regular
 * expressions because the Brand / Technology / Language segments can all be
 * multi-word PascalCase strings (e.g. `EthereumFoundation`, `ASPNetCore`,
 * `CSharp`).  Instead, we deterministically match the longest prefix against
 * the known brand list, then the longest remaining prefix against the
 * technology list, and finally validate that the suffix is a recognised
 * language.
 */
export function parseUniqueTechIdentifier(id: UniqueTechIdentifier): ParsedUniqueTech {
  const [lhs, version] = id.split('@');

  // Sort helper – longest strings first to make sure we prefer
  // "EthereumFoundation" over "Ethereum", etc.
  const byLengthDesc = (a: string, b: string) => b.length - a.length;

  // 1) Brand / umbrella -----------------------------------------------------
  let brandMatch: ParsedUniqueTech['umbrella'] | undefined;
  for (const brand of [...BRANDS].sort(byLengthDesc)) {
    if (lhs.startsWith(brand)) {
      brandMatch = brand as ParsedUniqueTech['umbrella'];
      break;
    }
  }
  if (!brandMatch) {
    throw new Error(`Could not recognise brand in unique tech identifier: ${id}`);
  }

  const afterBrand = lhs.slice(brandMatch.length);

  // 2) Technology ----------------------------------------------------------
  let techMatch: ParsedUniqueTech['tech'] | undefined;
  for (const tech of [...TECHNOLOGIES].sort(byLengthDesc)) {
    if (afterBrand.startsWith(tech)) {
      techMatch = tech as ParsedUniqueTech['tech'];
      break;
    }
  }
  if (!techMatch) {
    throw new Error(`Could not recognise technology in unique tech identifier: ${id}`);
  }

  const afterTech = afterBrand.slice(techMatch.length);

  // 3) Language ------------------------------------------------------------
  const languageMatch = PROGRAMMING_LANGUAGES.find(l => l === afterTech) as ParsedUniqueTech['language'] | undefined;
  if (!languageMatch) {
    throw new Error(`Could not recognise language in unique tech identifier: ${id}`);
  }

  return {
    umbrella: brandMatch,
    tech: techMatch,
    language: languageMatch,
    version: version as SemVer,
  };
}
