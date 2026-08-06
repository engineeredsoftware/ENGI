// Technology related enumerations and template-literal types used across the
// code-base.  The goal is to provide a *static*, type-safe vocabulary that can
// grow to thousands of distinct stack identifiers without having to manually
// write every single variant.

/*
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Naming convention                                                      │
  └──────────────────────────────────────────────────────────────────────────┘

  A technology *stack identifier* follows the pattern

      [Brand][Tech][Language]

  Examples:

      VercelNextJSTypeScript
      MetaReactNativeTypeScript
      GoogleFirebaseFlutterDart

  – Brand      → Company/organisation/umbrella project that owns the tech
  – Tech       → Library / framework / runtime name
  – Language   → Programming language (or group of languages) primarily used

  The brand and tech segments intentionally start with an uppercase letter and
  avoid separators so they remain valid as part of a single *PascalCase*
  identifier inside template-literal types.

  The *Language* segment is sourced from a broad list that includes all major
  programming languages and the most common spoken languages — allowing the
  system to eventually model localisation-specific stacks such as

      WordPressPHPSpanish

  The lists below by no means aim to be exhaustive; they are merely the first
  couple of hundred high-impact items that cover the vast majority of modern
  software projects.  They can be expanded incrementally over time without
  requiring breaking API changes thanks to TypeScript’s declaration merging.
*/

// ────────────────────────────────────────────────────────────────────────────
//  Brands / Organisations                                                   │
// ────────────────────────────────────────────────────────────────────────────

export const BRANDS = [
  // Big tech & cloud
  'Amazon',
  'Apple',
  'GitHub',
  'Google',
  'Meta',
  'Microsoft',
  'Netflix',
  'Cloudflare',
  'DigitalOcean',
  'Vercel',
  'Netlify',
  'Heroku',
  'Firebase',

  // OSS Foundations & consortia
  'Apache',
  'LinuxFoundation',
  'Eclipse',
  'CNCF',
  'Mozilla',
  'PythonSoftwareFoundation',
  'NodeJSFoundation',
  'RustFoundation',
  'EthereumFoundation',

  // Enterprise software vendors
  'IBM',
  'Oracle',
  'RedHat',
  'Salesforce',
  'Adobe',
  'JetBrains',
  'Hashicorp',
  'Databricks',
  'Snowflake',
  'Elastic',
  'Atlassian',
  'Shopify',
  'Stripe',
  'Twilio',
  'Square',

  // Foundations / communities not previously covered
  'DjangoSoftwareFoundation',
  'VMware',

  // Crypto / Web3
  'Solana',
  'Polygon',
  'Binance',

  // Game engines & graphics
  'Unity',
  'Unreal',

  // Other notable
  'OpenAI',
  'Fastly',

  // Containers
  'Docker',

  // Front-end specific communities / companies
  'Vue',
  'NuxtLabs',
  'Svelte',
  'SolidJS',
  'Ionic',
  'Capacitor',

  // Monitoring / Observability
  'GrafanaLabs',
  'OpenTelemetry',

  // Other OSS groups
  'Pulumi',
  'Actix',
  'Rocket',

  // PHP / Ruby specific foundations / organisations
  'Laravel',
  'Symfony',
  'Rails',
] as const;

export type Brand = typeof BRANDS[number];

// ────────────────────────────────────────────────────────────────────────────
//  Technologies (frameworks / libraries / runtimes)                         │
// ────────────────────────────────────────────────────────────────────────────

export const TECHNOLOGIES = [
  // Web – front-end
  'React',
  'NextJS',
  'Remix',
  'Gatsby',
  'Astro',
  'Vue',
  'NuxtJS',
  'Svelte',
  'SvelteKit',
  'Angular',
  'SolidJS',
  'Preact',

  // Mobile
  'ReactNative',
  'Flutter',
  'Ionic',
  'Cordova',
  'Capacitor',

  // Web – back-end (Node & others)
  'Express',
  'NestJS',
  'Koa',
  'Fastify',
  'Hapi',
  'AdonisJS',
  'FeathersJS',
  'GraphQLYoga',

  // Python back-end
  'Django',
  'Flask',
  'FastAPI',
  'Tornado',

  // Java & JVM
  'SpringBoot',
  'Quarkus',
  'Micronaut',

  // .NET
  'ASPNetCore',
  'Blazor',

  // PHP
  'Laravel',
  'Symfony',
  'CodeIgniter',
  'Drupal',
  'WordPress',
  'Magento',

  // Ruby
  'Rails',
  'Sinatra',

  // Elixir / Erlang
  'Phoenix',

  // Rust
  'ActixWeb',
  'Rocket',

  // Go
  'Gin',
  'Fiber',
  'Echo',

  // JVM / Scala
  'Play',

  // C++
  'Qt',

  // ML / Data
  'TensorFlow',
  'PyTorch',
  'SciPy',
  'NumPy',
  'Pandas',
  'ScikitLearn',
  'Spark',

  // Blockchain
  'Hardhat',
  'Foundry',
  'Truffle',
  'Web3JS',
  'EthersJS',

  // Infrastructure / IaC
  'Terraform',
  'Packer',
  'Pulumi',
  'Ansible',
  'Vault',
  'Chef',
  'Puppet',

  // Observability / Metrics
  'Prometheus',
  'Grafana',
  'OpenTelemetry',

  // Containers / orchestration
  'Docker',
  'GitHubActions',
  'Kubernetes',
  'Helm',
  'Cargo',

  // Game engines
  'Unity',
  'UnrealEngine',

  // IoT / Embedded
  'Zephyr',

  // Edge / Serverless
  'CloudflareWorkers',
  'AWSLambda',
  'AzureFunctions',

  // Misc
  'Electron',
  'Tauri',
  'Bun',
] as const;

export type Technology = typeof TECHNOLOGIES[number];

// ────────────────────────────────────────────────────────────────────────────
//  Languages                                                                │
// ────────────────────────────────────────────────────────────────────────────

// A curated list of programming languages (mostly ISO-6502 names but
// historically common capitalisation is preserved for readability).
export const PROGRAMMING_LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'CSharp',
  'CPlusPlus',
  'C',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Scala',
  'Kotlin',
  'Swift',
  'ObjectiveC',
  'Dart',
  'Elixir',
  'Erlang',
  'FSharp',
  'R',
  'Haskell',
  'Julia',
  'Perl',
  'Lua',
  'Zig',
  'Bash',
  'PowerShell',
  'Shell',
  'Solidity',
  'V',
  'Crystal',
  'Nim',
  'ReasonML',
  'OCaml',
  'Matlab',
  'Groovy',
  'VisualBasic',

  // Configuration / DSLs
  'HCL',
  'YAML',
] as const;

// ISO 639-1/639-3 like spoken languages (top ~30 by native speakers plus
// English and widely used international languages)
export const SPOKEN_LANGUAGES = [
  'English',
  'Mandarin',
  'Spanish',
  'Hindi',
  'Bengali',
  'Portuguese',
  'Russian',
  'Japanese',
  'WesternPunjabi',
  'Marathi',
  'Telugu',
  'Wu',
  'Turkish',
  'Korean',
  'French',
  'German',
  'Vietnamese',
  'Tamil',
  'Yue',
  'Urdu',
  'Javanese',
  'Italian',
  'EgyptianArabic',
  'Gujarati',
  'IranianPersian',
  'Bhojpuri',
  'SouthernMin',
  'Hakka',
  'Jin',
  'Hausa',
  'Kannada',
  'Indonesian',
  'Polish',
  'Dutch',
  'Thai',
  'Romanian',
  'Greek',
  'Czech',
  'Swedish',
  'Hungarian',
  'Finnish',
] as const;

export const LANGUAGES = [
  ...PROGRAMMING_LANGUAGES,
  ...SPOKEN_LANGUAGES,
] as const;

export type Language = typeof LANGUAGES[number];

// ────────────────────────────────────────────────────────────────────────────
//  Composite stack identifier                                               │
// ────────────────────────────────────────────────────────────────────────────

// Generic helper for composing a single *PascalCase* stack identifier.
export type StackIdentifier<
  B extends Brand = Brand,
  T extends Technology = Technology,
  L extends Language = Language,
> = `${B}${T}${L}`;

// A convenience alias for the serialized technology identifier surface used by
// downstream packages. In practice, the full cartesian product of the current
// Brand × Technology × Language lists is too large for TypeScript to
// materialize reliably across the whole workspace, so the package keeps the
// precise segment vocabularies above and exposes `TechType` as the runtime
// string surface that dependents actually pass around.
export type TechType = string;

/**
 * Compose a serialized technology identifier from the canonical vocabulary
 * segments that the Bitcode read-measurement spine uses.
 */
export function composeTechType<
  B extends Brand = Brand,
  T extends Technology = Technology,
  L extends Language = Language,
>(brand: B, technology: T, language: L): StackIdentifier<B, T, L> {
  return `${brand}${technology}${language}` as StackIdentifier<B, T, L>;
}

// ────────────────────────────────────────────────────────────────────────────
//  Versioning                                                               │
// ────────────────────────────────────────────────────────────────────────────

// Simple semver pattern 0.0.0 – this can be relaxed or tightened later.
export type SemVer = `${number}.${number}.${number}`;

export interface VersionedTech<B extends Brand = Brand, T extends Technology = Technology, L extends Language = Language> {
  id: StackIdentifier<B, T, L>;
  version: SemVer;
}
