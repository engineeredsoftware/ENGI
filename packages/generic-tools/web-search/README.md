# Bitcode Read-Synthesis Web Search Tools

This package keeps the retained `@bitcode/generic-tools-web-search` path while
V26 reforms its purpose: callable web search and content retrieval are admitted
only as discovery-phase external evidence support for Bitcode read synthesis.

The tools can gather source-attributed evidence, retrieve cited source content,
compare providers, classify URLs, and expose provider health when that improves
source coverage. They do not own canonical read interpretation, proof closure,
source mutation, delivery-mechanism choice, Bitcode Exchange behavior, or
Bitcode behavior. Search output is not proof closure.

## Admitted Tools

- `search`: source-attributed web search for a declared Bitcode read or proof
 gap.
- `searchWithUrlIntelligence`: URL-assisted query targeting for the active read
 only.
- `multiProviderSearch`: provider comparison when corroboration or source
 coverage matters.
- `getContents`: retrieve a cited source URL for metadata, snippet checking, and
 evidence review.
- URL utilities: support source attribution, domain review, and bounded query
 targeting.
- Provider health/metrics utilities: support evidence-collection reliability,
 not product observability ownership.

## Output Boundary

Outputs are auxiliary evidence for downstream Bitcode owners. A valid result
should preserve title, URL, snippet or retrieved content, provider/source
metadata, source-class hints, source-quality context, volatility notes, and
unresolved evidence gaps when available.

Proof systems, stable AssetPacks, mutations, and delivery mechanisms remain
owned by downstream Bitcode packages and pipelines.
