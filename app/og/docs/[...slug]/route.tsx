// NOTE: OG image generation can significantly inflate the Cloudflare Worker bundle size
// (via image-response / resvg). For the free-plan 3MiB Worker limit, we serve a minimal
// response instead of generating dynamic images.
export async function GET() {
  return new Response(null, { status: 404 });
}
