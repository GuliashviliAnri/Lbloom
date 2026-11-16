import {defineCloudflareConfig} from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import {withRegionalCache} from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

// ISR on Workers: rendered pages and catalog data live in R2, with a per-location Cache API copy
// in front so most visits never read R2. Admin revalidation writes tags to D1.
export default defineCloudflareConfig({
 incrementalCache:withRegionalCache(r2IncrementalCache,{mode:'long-lived'}),
 tagCache:d1NextTagCache,
 queue:memoryQueue,
 // Serve cached ISR pages before loading the Next.js server, which is where most CPU time goes.
 enableCacheInterception:true
});
