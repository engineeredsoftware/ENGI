# TODO - AssetPack Pipeline

## Immediate (v1.0)

- [ ] Complete integration tests with Bitcode execution contexts
- [ ] Add performance benchmarks for full pipeline execution
- [ ] Implement progress streaming for real-time updates
- [ ] Add BTC fee readiness and measured `$BTD` estimation

## Short Term (v1.1)

- [ ] Implement adaptive iteration strategy based on validation feedback
- [ ] Add support for multiple repository providers (GitLab, Bitbucket)
- [ ] Create specialized variations for common Read classes (bug fixes, features, refactoring)
- [ ] Add partial success handling (some files succeed, others fail)

## Medium Term (v1.2)

- [ ] Implement parallel phase execution where possible
- [ ] Add support for multi-repository changes
- [ ] Create visual pipeline execution viewer
- [ ] Implement checkpoint/resume for long-running pipelines

## Long Term (v2.0)

- [ ] ML-powered iteration optimization
- [ ] Cross-pipeline orchestration for complex projects
- [ ] Distributed execution across multiple workers
- [ ] Self-improving pipeline based on success metrics

## Testing Priorities

1. Full pipeline integration tests with mocks
2. DIV iteration scenarios (1, 2, 3 iterations)
3. Error recovery and rollback scenarios
4. Large repository performance
5. Concurrent pipeline execution

## Documentation Reads

- [ ] AssetPack pipeline customization guide
- [ ] Agent replacement/extension guide
- [ ] Performance tuning guide
- [ ] Remove any remaining callers that still expect removed pre-V26 route names; active callers must use AssetPack/SDIVF semantics directly.

## Known Issues

- [ ] Memory usage high for very large repositories (>5GB)
- [ ] Iteration feedback could be more granular
- [ ] Test generation agent needs improvement
- [ ] Documentation generation is basic
