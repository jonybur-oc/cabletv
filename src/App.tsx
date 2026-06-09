import { useState, useEffect, useRef } from 'react';
import { CHANNELS } from './channels';
import { getNowPlaying, formatOffset } from './scheduler';
import type { NowPlaying } from './scheduler';

// Electron injects this
declare global {
  interface Window {
    electronAPI?: { isElectron: boolean };
  }
}

const isElectron = !!window.electronAPI?.isElectron;

export default function App() {
  const [channelIndex, setChannelIndex] = useState(0);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [tick, setTick] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const webviewRef = useRef<Electron.WebviewTag | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = CHANNELS[channelIndex];
    const np = getNowPlaying(channel);
    setNowPlaying(np);

    // In Electron, navigate the webview to the content at the right timestamp
    if (isElectron && webviewRef.current) {
      webviewRef.current.src = np.deepLink;
    }
  }, [channelIndex, tick]);

  const prevChannel = () =>
    setChannelIndex(i => (i - 1 + CHANNELS.length) % CHANNELS.length);
  const nextChannel = () =>
    setChannelIndex(i => (i + 1) % CHANNELS.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') nextChannel();
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') prevChannel();
      if (e.key === 'g' || e.key === 'G') setShowGuide(g => !g);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!nowPlaying) return null;
  const { channel, content, offsetSeconds, deepLink } = nowPlaying;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {isElectron ? (
        // ELECTRON MODE: embedded webview fills the screen
        <div style={{ flex: 1, position: 'relative' }}>
          {/* @ts-ignore — webview is an Electron-specific element */}
          <webview
            ref={webviewRef}
            src={deepLink}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowpopups="true"
            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          />

          {/* Overlay HUD — shows briefly then fades */}
          <ChannelHUD
            channel={channel}
            content={content}
            offsetSeconds={offsetSeconds}
            channelNumber={channelIndex + 1}
          />

          {/* TV Guide overlay */}
          {showGuide && (
            <TVGuide
              channels={CHANNELS}
              currentIndex={channelIndex}
              onSelect={setChannelIndex}
              onClose={() => setShowGuide(false)}
            />
          )}

          {/* Bottom bar */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px 16px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
            color: '#666',
          }}>
            <span>← → to flip</span>
            <span>·</span>
            <span>G for guide</span>
            <div style={{ flex: 1 }} />
            <span style={{ color: channel.color, fontWeight: 700 }}>{channel.name}</span>
          </div>
        </div>
      ) : (
        // WEB MODE: show info + deep link
        <WebMode
          channel={channel}
          content={content}
          offsetSeconds={offsetSeconds}
          deepLink={deepLink}
          channels={CHANNELS}
          channelIndex={channelIndex}
          onSelect={setChannelIndex}
          onPrev={prevChannel}
          onNext={nextChannel}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}

// ── Channel HUD (Electron only) ───────────────────────────────────────────────

function ChannelHUD({ channel, content, offsetSeconds, channelNumber }: {
  channel: any; content: any; offsetSeconds: number; channelNumber: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [channel.id, content.id]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '48px',
      left: '24px',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '16px 20px',
      borderLeft: `3px solid ${channel.color}`,
      animation: 'fadeIn 0.3s ease',
      maxWidth: '340px',
    }}>
      <div style={{ fontSize: '11px', color: channel.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
        CH {channelNumber} · {channel.name}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>{content.title}</div>
      <div style={{ fontSize: '13px', color: '#888' }}>{formatOffset(offsetSeconds)}</div>
    </div>
  );
}

// ── TV Guide overlay ──────────────────────────────────────────────────────────

function TVGuide({ channels, currentIndex, onSelect, onClose }: {
  channels: any[]; currentIndex: number; onSelect: (i: number) => void; onClose: () => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px',
      animation: 'fadeIn 0.2s ease',
    }}
      onClick={onClose}
    >
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        TV Guide · Press G to close
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {channels.map((ch, i) => {
          const np = getNowPlaying(ch);
          return (
            <div
              key={ch.id}
              onClick={e => { e.stopPropagation(); onSelect(i); onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: '10px',
                background: i === currentIndex ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === currentIndex ? ch.color : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: '3px', height: '40px', background: ch.color, borderRadius: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: ch.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>
                  CH {i + 1} · {ch.name}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{np.content.title}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{formatOffset(np.offsetSeconds)}</div>
              </div>
              {i === currentIndex && (
                <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  NOW
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Web mode (non-Electron) ───────────────────────────────────────────────────

function WebMode({ channel, content, offsetSeconds, deepLink, channels, channelIndex, onSelect, onPrev, onNext }: any) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Channel tabs */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #1a1a1a', overflowX: 'auto' }}>
        {channels.map((ch: any, i: number) => (
          <button key={ch.id} onClick={() => onSelect(i)} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap',
            background: i === channelIndex ? ch.color : '#1a1a1a',
            color: i === channelIndex ? '#fff' : '#666',
          }}>
            {ch.name}
          </button>
        ))}
      </div>

      {/* Now playing */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em' }}>LIVE · CH {channelIndex + 1}</span>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '12px', color: channel.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{channel.name}</div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.2 }}>{content.title}</h1>
          <p style={{ color: '#888', fontSize: '15px', margin: '0 0 6px' }}>{content.description}</p>
          <p style={{ color: '#444', fontSize: '13px', margin: '0 0 24px' }}>{content.year} · {formatOffset(offsetSeconds)}</p>

          <div style={{ width: '100%', height: '3px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '28px' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (offsetSeconds / (content.durationMins * 60)) * 100)}%`, background: channel.color, borderRadius: '2px' }} />
          </div>

          <a href={deepLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', padding: '14px 32px', background: channel.color,
            color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px',
          }}>
            Open in {channel.service === 'netflix' ? 'Netflix' : 'HBO Max'} →
          </a>

          <p style={{ color: '#333', fontSize: '12px', marginTop: '12px' }}>
            Download the desktop app for the full inline experience
          </p>
        </div>

        <div style={{ display: 'flex', gap: '24px', color: '#333', fontSize: '13px' }}>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '20px' }}>←</button>
          <span>arrow keys to flip</span>
          <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '20px' }}>→</button>
        </div>
      </div>

      {/* Bottom guide */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #1a1a1a', display: 'flex', gap: '16px', overflowX: 'auto' }}>
        {channels.map((ch: any, i: number) => {
          const np = getNowPlaying(ch);
          return (
            <button key={ch.id} onClick={() => onSelect(i)} style={{
              background: 'none', border: `1px solid ${i === channelIndex ? ch.color : '#1a1a1a'}`,
              borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
              minWidth: '160px', color: '#fff',
            }}>
              <div style={{ fontSize: '10px', color: ch.color, fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase' }}>{ch.name}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>{np.content.title}</div>
              <div style={{ fontSize: '11px', color: '#555' }}>{formatOffset(np.offsetSeconds)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
