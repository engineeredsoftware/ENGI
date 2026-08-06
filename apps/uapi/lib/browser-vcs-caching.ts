/**
 * UAPI-specific browser VCS caching utility
 * Ultra-specific naming and placement under apps/uapi/lib/ per architecture rules.
 */

import { VCSCache } from '@bitcode/vcs-generics';

/**
 * UAPI-specific cache with custom TTL for UI responsiveness
 */
export const uapiVCSCache = new VCSCache({
  ttl: 1 * 60 * 1000 // 1 minute for UI freshness
});

