#!/usr/bin/env node
/**
 * Bitcode V26 architecture review.
 *
 * This support verifier checks the active prompt, PromptPart, doc-comment, and
 * inference-system corridors that are part of fifth-gate source truth. It is not
 * a one-off migration script and it must not target removed raw prompt trees.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

type Status = 'PASS' | 'FAIL';

interface ValidationResult {
  principle: string;
  status: Status;
  details: string[];
  violations: string[];
}

class ArchitectureReviewer {
  private readonly basePath = findRepoRoot(process.cwd());
  private readonly results: ValidationResult[] = [];

  review(): void {
    console.log('Bitcode V26 architecture review');
    console.log('='.repeat(60));

    this.validateCanonicalSpecFamily();
    this.validatePromptPartFilesystem();
    this.validatePromptPublicBoundary();
    this.validateSupportScriptBoundaries();
    this.validateInferenceSystemSpecifications();
    this.validateDocCommentToolPromptBridge();

    this.printReport();
  }

  private validateCanonicalSpecFamily(): void {
    this.withResult('Canonical V26 specification family', (details, violations) => {
      this.expectFile('specifications/BITCODE_SPEC.txt', details, violations);
      this.expectFile('specifications/BITCODE_SPEC_V26.md', details, violations);
      this.expectFile('specifications/BITCODE_SPEC_V26_NOTES.md', details, violations);
      this.expectFile('specifications/BITCODE_SPEC_V26_PARITY_MATRIX.md', details, violations);
      this.expectFile('specifications/BITCODE_SPEC_V26_PROVEN.md', details, violations);
      this.expectFile('protocol-demonstration/V26_PROMPT_SURFACES.md', details, violations);
      this.expectFile('protocol-demonstration/V26_INFERENCE_SYSTEMS.md', details, violations);

      const pointer = this.readText('specifications/BITCODE_SPEC.txt').trim();
      if (pointer === 'V26') {
        details.push('BITCODE_SPEC.txt points at V26.');
      } else {
        violations.push(`BITCODE_SPEC.txt must point at V26, found "${pointer}".`);
      }

      const promptSurfaces = this.readText('protocol-demonstration/V26_PROMPT_SURFACES.md');
      this.expectContains(
        promptSurfaces,
        'PromptPart',
        'Prompt surfaces specify PromptPart ownership.',
        'Prompt surfaces must specify PromptPart ownership.',
        details,
        violations
      );
      this.expectContains(
        promptSurfaces,
        'raw_promptparts',
        'Prompt surfaces target raw_promptparts.',
        'Prompt surfaces must target raw_promptparts, not removed raw trees.',
        details,
        violations
      );
    });
  }

  private validatePromptPartFilesystem(): void {
    this.withResult('PromptPart filesystem boundary', (details, violations) => {
      const rawPromptparts = this.absolute('packages/prompts/src/raw_promptparts');
      const generic = path.join(rawPromptparts, 'generic');
      const specific = path.join(rawPromptparts, 'specific');
      const removedRaw = this.absolute('packages/prompts/src/raw');

      this.expectDirectory('packages/prompts/src/raw_promptparts/generic', details, violations);
      this.expectDirectory('packages/prompts/src/raw_promptparts/specific', details, violations);

      if (fs.existsSync(removedRaw)) {
        violations.push('Removed packages/prompts/src/raw tree still exists.');
      } else {
        details.push('Removed packages/prompts/src/raw tree is absent.');
      }

      const genericFiles = this.listFiles(generic, ['.ts']).filter(
        (file) => !file.endsWith('.d.ts') && path.basename(file) !== 'index.ts'
      );
      const specificFiles = this.listFiles(specific, ['.ts']).filter(
        (file) => !file.endsWith('.d.ts') && path.basename(file) !== 'index.ts'
      );
      this.expectMinimum(genericFiles.length, 1, 'generic PromptPart source files', details, violations);
      this.expectMinimum(specificFiles.length, 1, 'specific PromptPart source files', details, violations);

      const misnamedPromptparts = [...genericFiles, ...specificFiles]
        .map((file) => path.basename(file))
        .filter((file) => !/^promptpart_(generic|specific)_[a-z0-9_]+\.ts$/u.test(file));

      if (misnamedPromptparts.length === 0) {
        details.push('Tracked TypeScript PromptPart files use promptpart_{generic,specific}_* names.');
      } else {
        violations.push(`PromptPart files with non-canonical names: ${misnamedPromptparts.slice(0, 12).join(', ')}`);
      }

      const specificText = specificFiles
        .map((file) => `${path.basename(file)}\n${this.safeReadAbsolute(file)}`)
        .join('\n');
      this.expectContains(
        specificText,
        'comprehendread',
        'Read-comprehension PromptParts are present.',
        'Read-comprehension PromptParts must be present.',
        details,
        violations
      );
      this.expectContains(
        specificText,
        'asset-pack',
        'Asset-pack PromptPart language is present.',
        'PromptParts must teach asset-pack semantics.',
        details,
        violations
      );
    });
  }

  private validatePromptPublicBoundary(): void {
    this.withResult('Public prompt package boundary', (details, violations) => {
      const packageJsonText = this.readText('packages/prompts/package.json');
      this.expectContains(
        packageJsonText,
        '"name": "@bitcode/prompts"',
        'Prompt package is owned by @bitcode/prompts.',
        'Prompt package must be named @bitcode/prompts.',
        details,
        violations
      );

      const packageJson = JSON.parse(packageJsonText) as { exports?: Record<string, unknown> };
      const exportsMap = packageJson.exports ?? {};
      const requiredExports = [
        '.',
        './prompt',
        './parts/PromptPart',
        './execution/PromptExecution',
        './raw_promptparts/*'
      ];

      for (const exportPath of requiredExports) {
        if (Object.prototype.hasOwnProperty.call(exportsMap, exportPath)) {
          details.push(`Public export exists: ${exportPath}`);
        } else {
          violations.push(`Missing public prompt export: ${exportPath}`);
        }
      }

      this.expectNotContains(
        packageJsonText,
        '@engi',
        'Prompt package metadata contains no @engi namespace.',
        'Prompt package metadata must not contain @engi namespace.',
        details,
        violations
      );
    });
  }

  private validateSupportScriptBoundaries(): void {
    this.withResult('Prompt support script boundaries', (details, violations) => {
      const scriptPaths = [
        'scripts/fix-remaining-imports.sh',
        'scripts/fix-barrel-imports.sh',
        'scripts/fix-multiline-imports.sh',
        'scripts/fix-corrupted-imports.sh',
        'scripts/generate-massive-prompt-parts.ts',
        'scripts/mass-update-prompt-parts.ts',
        'scripts/codemod-deep-promptparts.mjs',
        'scripts/normalize-asset-pack-promptparts.mjs',
        'scripts/generate-asset-pack-promptparts.ts',
        'scripts/prompt-audit.sh',
        'scripts/verify-prompt-exports.py'
      ];

      for (const scriptPath of scriptPaths) {
        this.expectFile(scriptPath, details, violations);
        const text = this.readText(scriptPath);
        this.expectContains(
          text,
          'raw_promptparts',
          `${scriptPath} targets raw_promptparts.`,
          `${scriptPath} must target raw_promptparts.`,
          details,
          violations
        );
        this.expectNotContains(
          text,
          '@engi',
          `${scriptPath} contains no @engi namespace.`,
          `${scriptPath} must not repair toward @engi namespaces.`,
          details,
          violations
        );
        this.expectNotContains(
          text,
          'packages/prompts/src/raw/',
          `${scriptPath} does not target removed raw prompt tree.`,
          `${scriptPath} must not target packages/prompts/src/raw/.`,
          details,
          violations
        );
      }

      const assetPackGenerator = this.readText('scripts/generate-asset-pack-promptparts.ts');
      this.expectContains(
        assetPackGenerator,
        'comprehendread',
        'AssetPack generator emits read-comprehension PromptParts.',
        'AssetPack generator must emit read-comprehension PromptParts.',
        details,
        violations
      );
      this.expectNotContains(
        assetPackGenerator,
        'comprehendtask',
        'AssetPack generator no longer emits task-comprehension as active truth.',
        'AssetPack generator must not emit comprehendtask as active truth.',
        details,
        violations
      );
    });
  }

  private validateInferenceSystemSpecifications(): void {
    this.withResult('Inference implementation specification density', (details, violations) => {
      const inferenceSpec = this.readText('protocol-demonstration/V26_INFERENCE_SYSTEMS.md');
      const requiredTerms = [
        'canonicalRead',
        'promptImplementation',
        'toolImplementation',
        'agentImplementation',
        'executionImplementation',
        'assetPackImplementation',
        'Prompt primitives',
        'Read-comprehension compatibility'
      ];

      for (const term of requiredTerms) {
        this.expectContains(
          inferenceSpec,
          term,
          `Inference spec includes ${term}.`,
          `Inference spec must include ${term}.`,
          details,
          violations
        );
      }

      this.expectNotContains(
        inferenceSpec,
        'DELIVERABLE as primary object',
        'Inference spec does not promote DELIVERABLE as the primary Bitcode object.',
        'Inference spec must keep assets/asset-packs primary over delivery mechanisms.',
        details,
        violations
      );
    });
  }

  private validateDocCommentToolPromptBridge(): void {
    this.withResult('Doc-comment and tool prompt injection bridge', (details, violations) => {
      const requiredFiles = [
        'packages/doc-comment-generics/package.json',
        'packages/generic-doc-comments/doc-code/package.json',
        'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
        'protocol-demonstration/V26_DOC_COMMENT_REFORM.md'
      ];

      for (const file of requiredFiles) {
        this.expectFile(file, details, violations);
      }

      const docCommentSpec = this.readText('protocol-demonstration/V26_DOC_COMMENT_REFORM.md');
      this.expectContains(
        docCommentSpec,
        'tool prompt injection',
        'Doc-comment reform specifies tool prompt injection.',
        'Doc-comment reform must specify tool prompt injection.',
        details,
        violations
      );
      this.expectContains(
        docCommentSpec,
        'DocCodeToolPrompt',
        'Doc-comment reform binds DocCodeToolPrompt.',
        'Doc-comment reform must bind DocCodeToolPrompt.',
        details,
        violations
      );
    });
  }

  private withResult(
    principle: string,
    validate: (details: string[], violations: string[]) => void
  ): void {
    const details: string[] = [];
    const violations: string[] = [];

    try {
      validate(details, violations);
    } catch (error) {
      violations.push(error instanceof Error ? error.message : String(error));
    }

    this.results.push({
      principle,
      status: violations.length === 0 ? 'PASS' : 'FAIL',
      details,
      violations
    });
  }

  private expectFile(relativePath: string, details: string[], violations: string[]): void {
    if (fs.existsSync(this.absolute(relativePath)) && fs.statSync(this.absolute(relativePath)).isFile()) {
      details.push(`File exists: ${relativePath}`);
    } else {
      violations.push(`Missing file: ${relativePath}`);
    }
  }

  private expectDirectory(relativePath: string, details: string[], violations: string[]): void {
    if (fs.existsSync(this.absolute(relativePath)) && fs.statSync(this.absolute(relativePath)).isDirectory()) {
      details.push(`Directory exists: ${relativePath}`);
    } else {
      violations.push(`Missing directory: ${relativePath}`);
    }
  }

  private expectContains(
    text: string,
    needle: string,
    passDetail: string,
    violation: string,
    details: string[],
    violations: string[]
  ): void {
    if (text.includes(needle)) {
      details.push(passDetail);
    } else {
      violations.push(violation);
    }
  }

  private expectNotContains(
    text: string,
    needle: string,
    passDetail: string,
    violation: string,
    details: string[],
    violations: string[]
  ): void {
    if (text.includes(needle)) {
      violations.push(violation);
    } else {
      details.push(passDetail);
    }
  }

  private expectMinimum(
    actual: number,
    expected: number,
    label: string,
    details: string[],
    violations: string[]
  ): void {
    if (actual >= expected) {
      details.push(`${label}: ${actual}`);
    } else {
      violations.push(`Expected at least ${expected} ${label}, found ${actual}.`);
    }
  }

  private readText(relativePath: string): string {
    return fs.readFileSync(this.absolute(relativePath), 'utf8');
  }

  private safeReadAbsolute(absolutePath: string): string {
    try {
      return fs.readFileSync(absolutePath, 'utf8');
    } catch {
      return '';
    }
  }

  private listFiles(root: string, extensions: string[]): string[] {
    if (!fs.existsSync(root)) {
      return [];
    }

    const files: string[] = [];
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      const absoluteEntry = path.join(root, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.listFiles(absoluteEntry, extensions));
      } else if (extensions.includes(path.extname(entry.name))) {
        files.push(absoluteEntry);
      }
    }
    return files.sort();
  }

  private absolute(relativePath: string): string {
    return path.join(this.basePath, relativePath);
  }

  private printReport(): void {
    let failureCount = 0;
    let violationCount = 0;

    for (const result of this.results) {
      console.log(`\n${result.principle}`);
      console.log(`Status: ${result.status}`);

      for (const detail of result.details) {
        console.log(`  ok: ${detail}`);
      }

      for (const violation of result.violations) {
        console.log(`  violation: ${violation}`);
      }

      if (result.status === 'FAIL') {
        failureCount += 1;
        violationCount += result.violations.length;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Passed: ${this.results.length - failureCount}`);
    console.log(`Failed: ${failureCount}`);
    console.log(`Violations: ${violationCount}`);

    if (failureCount > 0) {
      process.exitCode = 1;
      return;
    }

    console.log('Bitcode V26 prompt and inference architecture boundary is coherent.');
  }
}

function findRepoRoot(startPath: string): string {
  let current = path.resolve(startPath);

  while (true) {
    if (fs.existsSync(path.join(current, 'specifications/BITCODE_SPEC.txt'))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Could not find Bitcode repo root from ${startPath}.`);
    }

    current = parent;
  }
}

new ArchitectureReviewer().review();
