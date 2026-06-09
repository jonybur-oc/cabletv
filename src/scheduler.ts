/**
 * Cable TV Scheduler
 *
 * The core mechanic: each channel has a daily schedule.
 * Content starts at a fixed time each day. If you tune in mid-way,
 * you're mid-content — just like real cable TV.
 *
 * Schedule is deterministic from the date — same channel shows
 * the same thing at the same time every day of the week.
 */

export interface Content {
  id: string;
  title: string;
  year: number;
  durationMins: number;
  netflixId?: string;   // Netflix content ID for deep link
  hboId?: string;       // HBO Max slug
  genre: string;
  description: string;
}

export interface Channel {
  id: string;
  name: string;         // e.g. "HBO Fantasy"
  service: 'netflix' | 'hbo' | 'disney';
  genre: string;
  color: string;        // channel accent color
  schedule: Content[];  // content that rotates daily
}

export interface NowPlaying {
  channel: Channel;
  content: Content;
  offsetSeconds: number;   // how far into the content we are right now
  startedAt: Date;         // when this content "started" today
  deepLink: string;        // URL to open at the right timestamp
}

/**
 * Get what's currently playing on a channel.
 * 
 * Logic:
 * 1. Each day, the channel starts from content[0] at midnight
 * 2. Content plays back-to-back in sequence
 * 3. Given current time, calculate which content is playing and where
 */
export function getNowPlaying(channel: Channel, now: Date = new Date()): NowPlaying {
  // Seconds since midnight (local time)
  const secondsSinceMidnight =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds();

  // Use day-of-year to rotate the schedule (different starting content each day)
  const dayOfYear = getDayOfYear(now);
  const startIndex = dayOfYear % channel.schedule.length;
  
  // Build today's playlist starting from startIndex
  const playlist = [
    ...channel.schedule.slice(startIndex),
    ...channel.schedule.slice(0, startIndex),
  ];

  // Find which content is playing now
  let elapsed = 0;
  let contentIndex = 0;
  
  for (let i = 0; i < playlist.length; i++) {
    const duration = playlist[i].durationMins * 60;
    if (elapsed + duration > secondsSinceMidnight) {
      contentIndex = i;
      break;
    }
    elapsed += duration;
    // If we've exhausted all content, wrap around
    if (i === playlist.length - 1) {
      contentIndex = 0;
      elapsed = 0;
    }
  }

  const content = playlist[contentIndex];
  const offsetSeconds = secondsSinceMidnight - elapsed;
  
  const startedAt = new Date(now);
  startedAt.setHours(0, 0, elapsed, 0);

  return {
    channel,
    content,
    offsetSeconds,
    startedAt,
    deepLink: buildDeepLink(content, offsetSeconds),
  };
}

function buildDeepLink(content: Content, offsetSeconds: number): string {
  const t = Math.floor(offsetSeconds);
  
  if (content.netflixId) {
    // Netflix supports ?t= for timestamp
    return `https://www.netflix.com/watch/${content.netflixId}?t=${t}`;
  }
  
  if (content.hboId) {
    // HBO Max deep link (timestamp support varies)
    return `https://play.max.com/video/watch/${content.hboId}`;
  }
  
  return '#';
}

export function formatOffset(offsetSeconds: number): string {
  const h = Math.floor(offsetSeconds / 3600);
  const m = Math.floor((offsetSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m in`;
  return `${m}m in`;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
