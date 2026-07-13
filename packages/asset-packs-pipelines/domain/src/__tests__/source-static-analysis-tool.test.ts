// @ts-nocheck
import { AgentExecution } from '@bitcode/agent-generics';
import {
  analyzeStaticSourceFile,
  analyzeStaticSource,
  SourceStaticAnalysisTool,
  registerSourceStaticAnalysisTool,
  resolveSourceStaticAnalysisTool,
} from '../agents/validation/source-static-analysis-tool';

const TS = `export function foo() {}
export const bar = () => {}
export interface Baz { x: number }
type Qux = string
class Thing {}`;

const PY = `def foo():
    pass
async def bar():
    pass
class Baz:
    pass`;

const RS = `fn foo() {}
struct Bar {}
enum Baz {}
type Qux = u8;`;

describe('source static analysis — per-file (language-generic)', () => {
  it('counts TS functions (function + arrow) and types (interface/type/class)', () => {
    const a = analyzeStaticSourceFile({ path: 'a.ts', content: TS });
    expect(a.ext).toBe('ts');
    expect(a.functions).toBe(2); // function foo + arrow bar
    expect(a.types).toBe(3); // interface Baz, type Qux, class Thing
    expect(a.lines).toBe(5);
    expect(a.symbols).toBeGreaterThan(0);
  });

  it('counts Python def/class', () => {
    const a = analyzeStaticSourceFile({ path: 'b.py', content: PY });
    expect(a.ext).toBe('py');
    expect(a.functions).toBe(2); // def foo + async def bar
    expect(a.types).toBe(1); // class Baz
  });

  it('counts Rust fn and struct/enum/type', () => {
    const a = analyzeStaticSourceFile({ path: 'c.rs', content: RS });
    expect(a.ext).toBe('rs');
    expect(a.functions).toBe(1); // fn foo
    expect(a.types).toBe(3); // struct Bar, enum Baz, type Qux =
  });

  it('normalizes tsx/jsx/mjs to ts and falls back generically for unknown exts', () => {
    expect(analyzeStaticSourceFile({ path: 'x.tsx', content: TS }).ext).toBe('ts');
    const generic = analyzeStaticSourceFile({ path: 'y.unknown', content: 'function z() {}\nclass W {}' });
    expect(generic.functions).toBe(1);
    expect(generic.types).toBe(1);
  });
});

describe('source static analysis — aggregate + covered-set estimate', () => {
  it('aggregates samples, measures density, and estimates the covered set (exact where sampled)', () => {
    const report = analyzeStaticSource({
      files: [
        { path: 'a.ts', content: TS },
        { path: 'b.py', content: PY },
      ],
      targetPaths: ['a.ts', 'b.py', 'c.ts'], // c.ts unsampled -> ts density applies
    });
    expect(report.sampledFileCount).toBe(2);
    expect(report.functionCount).toBe(4); // 2 + 2
    expect(report.typeCount).toBe(4); // 3 + 1
    expect(report.targetFileCount).toBe(3);
    // a.ts(2 exact) + b.py(2 exact) + c.ts(ts density = 2) = 6
    expect(report.estimatedFunctionCount).toBe(6);
    // 3 + 1 + 3 = 7
    expect(report.estimatedTypeCount).toBe(7);
    expect(report.coverageRatio).toBe(0.67); // 2/3 sampled
    expect(report.measuredFromSamples).toBe(true);
  });

  it('degrades honestly with no source (path-only)', () => {
    const report = analyzeStaticSource({ files: [], targetPaths: ['x.ts', 'y.ts'] });
    expect(report.measuredFromSamples).toBe(false);
    expect(report.functionCount).toBe(0);
    expect(report.estimatedFunctionCount).toBe(0);
    expect(report.targetFileCount).toBe(2);
    expect(report.coverageRatio).toBe(0);
  });
});

describe('static-analysis tool registry (add/replace hierarchy)', () => {
  it('registers/resolves and honors priority: same replaces, higher overrides', async () => {
    const exec = new AgentExecution('agent:test-static-analysis');
    const toolA = new SourceStaticAnalysisTool();
    const toolB = new SourceStaticAnalysisTool();
    const toolC = new SourceStaticAnalysisTool();

    registerSourceStaticAnalysisTool(exec, toolA, 0);
    expect(resolveSourceStaticAnalysisTool(exec)).toBe(toolA);

    // same priority REPLACES
    registerSourceStaticAnalysisTool(exec, toolB, 0);
    expect(resolveSourceStaticAnalysisTool(exec)).toBe(toolB);

    // higher priority OVERRIDES
    registerSourceStaticAnalysisTool(exec, toolC, 5);
    expect(resolveSourceStaticAnalysisTool(exec)).toBe(toolC);

    // a subsequent base-priority register does not dislodge the higher override
    registerSourceStaticAnalysisTool(exec, new SourceStaticAnalysisTool(), 0);
    expect(resolveSourceStaticAnalysisTool(exec)).toBe(toolC);

    // the resolved tool measures via use()
    const report = await resolveSourceStaticAnalysisTool(exec)!.use({
      files: [{ path: 'a.ts', content: TS }],
      targetPaths: ['a.ts'],
    });
    expect(report.functionCount).toBe(2);
  });
});
