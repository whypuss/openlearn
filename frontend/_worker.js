export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Serve Next.js static chunks (remap /_next/ → .next/)
    if (pathname.startsWith('/_next/')) {
      const assetPath = pathname.replace('/_next/', '.next/');
      return env.ASSETS.fetch(new Request(`${url.origin}${assetPath}`, request));
    }

    // Map paths to .next/server/app/ HTML files
    const pageMap = {
      '/': '.next/server/app/index',
      '/decks': '.next/server/app/decks',
      '/decks/': '.next/server/app/decks',
      '/import': '.next/server/app/import',
      '/import/': '.next/server/app/import',
      '/settings': '.next/server/app/settings',
      '/settings/': '.next/server/app/settings',
    };

    if (pageMap[pathname]) {
      // Try .html first, fall back to bare path
      const htmlPath = pageMap[pathname] + '.html';
      const response = await env.ASSETS.fetch(new Request(`${url.origin}/${htmlPath}`, request));
      if (response.status === 200) return response;
      // Fallback: try without .html
      return env.ASSETS.fetch(new Request(`${url.origin}/${pageMap[pathname]}`, request));
    }

    // Dynamic routes → serve index shell
    if (pathname.startsWith('/decks/') || pathname.startsWith('/practice/') || pathname.startsWith('/review/')) {
      return env.ASSETS.fetch(new Request(`${url.origin}/.next/server/app/index`, request));
    }

    return new Response('Not Found', { status: 404 });
  }
};
