/**
 * Stremio addon client
 *
 * Instead of wrapping the Stremio app (which has no timestamp deep-link support),
 * we query Stremio addons directly for stream URLs, then play them in our own
 * player at the correct time offset.
 *
 * Architecture:
 * 1. Query Cinemeta addon for content metadata
 * 2. Query stream addons (e.g. torrentio) for stream URLs
 * 3. Feed stream URL to mpv/HTML5 player with --start=<offsetSeconds>
 *
 * This gives us true "tune in mid-content" without depending on any
 * streaming service's deep link support.
 */

const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';
const TORRENTIO_BASE = 'https://torrentio.strem.fun';

export interface StreamioMeta {
  id: string;
  type: 'movie' | 'series';
  name: string;
  year?: number;
  runtime?: number; // minutes
  poster?: string;
}

export interface StremioStream {
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  title?: string;
  name?: string;
}

/**
 * Fetch metadata for a content item from Cinemeta
 */
export async function getMeta(type: string, id: string): Promise<StreamioMeta | null> {
  try {
    const res = await fetch(`${CINEMETA_BASE}/meta/${type}/${id}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.meta || null;
  } catch {
    return null;
  }
}

/**
 * Get stream URLs from Torrentio (open addon, no auth required)
 * Returns streams that can be played with an HTTP player supporting byte-range
 */
export async function getStreams(type: string, id: string): Promise<StremioStream[]> {
  try {
    // Torrentio config: sort by seeders, quality filter
    const config = 'sort=seeders|qualityfilter=480p,scr,cam';
    const res = await fetch(`${TORRENTIO_BASE}/${config}/stream/${type}/${id}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.streams || []).slice(0, 5); // top 5 streams
  } catch {
    return [];
  }
}

/**
 * Build a local stream URL via Stremio's server.js (bundled as a child process)
 * server.js converts torrent infoHashes into seekable HTTP streams
 */
export function buildLocalStreamUrl(stream: StremioStream): string | null {
  if (stream.url) return stream.url;
  if (stream.infoHash) {
    const fileIdx = stream.fileIdx ?? 0;
    // stremio-service HTTP server (started as child process on port 11470)
    return `http://127.0.0.1:11470/${stream.infoHash}/${fileIdx}`;
  }
  return null;
}
