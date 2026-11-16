import {defineCloudflareConfig} from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import {withRegionalCache} from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

// ISR on Workers Free, with no paid products: rendered pages and catalog data live in Workers KV,
// with a per-location Cache API copy in front so most visits never read KV. Admin revalidation
// writes tags to D1. Free-plan limits fail closed (no charges); a failed cache read just re-renders.
export default defineCloudflareConfig({
 incrementalCache:withRegionalCache(kvIncrementalCache,{mode:'long-lived'}),
 tagCache:d1NextTagCache,
 queue:memoryQueue,
 // Serve cached ISR pages before loading the Next.js server, which is where most CPU time goes.
 enableCacheInterception:true
});
