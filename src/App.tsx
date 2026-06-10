import { useState, useEffect, useRef } from 'react';
import { CHANNELS } from './channels';
import { UpdateBanner } from './UpdateBanner';

declare global {
  interface Window {
    electronAPI?: { isElectron: boolean };
  }
}

const isElectron = !!window.electronAPI?.isElectron;

// Each channel maps to a streaming service home page
// The user is logged into their own account — the service decides what plays
const CHANNEL_URLS: Record<string, string> = {
  'hbo-fantasy':    'https://play.max.com/browse/genre/fantasy',
  'netflix-crime':  'https://www.netflix.com/browse/genre/6396',
  'hbo-war':        'https://play.max.com/browse/genre/war',
  'netflix-scifi':  'https://www.netflix.com/browse/genre/1492',
};

export default function App() {
  const [channelIndex, setChannelIndex] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const webviewRefs = useRef<Record<string, Electron.WebviewTag | null>>({});
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const channel = CHANNELS[channelIndex];

  const showHud = () => {
    setHudVisible(true);
    if (hudTimer.current) clearTimeout(hudTimer.current);
    hudTimer.current = setTimeout(() => setHudVisible(false), 4000);
  };

  useEffect(() => {
    showHud();
  }, [channelIndex]);

  const prevChannel = () => setChannelIndex(i => (i - 1 + CHANNELS.length) % CHANNELS.length);
  const nextChannel = () => setChannelIndex(i => (i + 1) % CHANNELS.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { nextChannel(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { prevChannel(); }
      if (e.key === 'g' || e.key === 'G') setShowGuide(g => !g);
      if (e.key === 'Escape') setShowGuide(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', overflow: 'hidden', position: 'relative' }}>

      {isElectron ? (
        // ELECTRON: one webview per channel, only active one is visible
        <>
          {CHANNELS.map((ch, i) => (
            <div
              key={ch.id}
              style={{
                position: 'absolute', inset: 0,
                display: i === channelIndex ? 'block' : 'none',
              }}
            >
              {/* @ts-ignore */}
              <webview
                ref={(el: Electron.WebviewTag | null) => { webviewRefs.current[ch.id] = el; }}
                src={CHANNEL_URLS[ch.id] || 'about:blank'}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowpopups="true"
                useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              />
            </div>
          ))}

          {/* Channel HUD */}
          {hudVisible && (
            <div style={{
              position: 'absolute', bottom: '48px', left: '24px',
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
              borderRadius: '12px', padding: '14px 18px',
              borderLeft: `3px solid ${channel.color}`,
              animation: 'fadeIn 0.25s ease',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '11px', color: channel.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                CH {channelIndex + 1} · {channel.name}
              </div>
              <div style={{ fontSize: '13px', color: '#aaa' }}>{channel.genre}</div>
            </div>
          )}

          {/* TV Guide overlay */}
          {showGuide && (
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', padding: '32px', animation: 'fadeIn 0.2s ease' }}
              onClick={() => setShowGuide(false)}
            >
              <div style={{ fontFamily: 'system-ui', fontSize: '12px', color: '#555', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>
                TV Guide · Press G or Esc to close
              </div>
              {CHANNELS.map((ch, i) => (
                <div
                  key={ch.id}
                  onClick={e => { e.stopPropagation(); setChannelIndex(i); setShowGuide(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 18px', borderRadius: '8px', marginBottom: '8px',
                    background: i === channelIndex ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${i === channelIndex ? ch.color : 'transparent'}`,
                    cursor: 'pointer',
                    fontFamily: 'system-ui',
                  }}
                >
                  <div style={{ width: '3px', height: '36px', background: ch.color, borderRadius: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: ch.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>CH {i + 1}</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{ch.name}</div>
                    <div style={{ fontSize: '12px', color: '#555' }}>{ch.service === 'netflix' ? 'Netflix' : 'HBO Max'} · {ch.genre}</div>
                  </div>
                  {i === channelIndex && (
                    <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                      NOW
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '8px 16px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            display: 'flex', alignItems: 'center', gap: '12px',
            fontFamily: 'system-ui', fontSize: '12px', color: '#444',
          }}>
            <span>← → to flip</span>
            <span>·</span>
            <span>G for guide</span>
            <div style={{ flex: 1 }} />
            <span style={{ color: channel.color, fontWeight: 700 }}>{channel.name}</span>
          </div>
        </>
      ) : (
        // WEB: show channel grid with links
        <WebMode channels={CHANNELS} channelIndex={channelIndex} onSelect={setChannelIndex} onPrev={prevChannel} onNext={nextChannel} channelUrls={CHANNEL_URLS} />
      )}

      <UpdateBanner />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        * { box-sizing: border-box; }
        body { margin: 0; color: #fff; font-family: system-ui; }
      `}</style>
    </div>
  );
}

function WebMode({ channels, channelIndex, onSelect, onPrev, onNext, channelUrls }: any) {
  const ch = channels[channelIndex];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ padding: '16px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #1a1a1a', overflowX: 'auto' }}>
        {channels.map((c: any, i: number) => (
          <button key={c.id} onClick={() => onSelect(i)} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap',
            background: i === channelIndex ? c.color : '#1a1a1a',
            color: i === channelIndex ? '#fff' : '#666',
          }}>{c.name}</button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '40px' }}>
        <div style={{ fontSize: '11px', color: ch.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CH {channelIndex + 1} · {ch.name}</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, textAlign: 'center' }}>{ch.genre} is on.</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: 0, textAlign: 'center' }}>
          Download the desktop app to watch inline.<br />Or open {ch.service === 'netflix' ? 'Netflix' : 'HBO Max'} directly.
        </p>
        <a href={channelUrls[ch.id]} target="_blank" rel="noopener noreferrer" style={{
          padding: '12px 28px', background: ch.color, color: '#fff',
          borderRadius: '8px', textDecoration: 'none', fontWeight: 700,
        }}>
          Open {ch.service === 'netflix' ? 'Netflix' : 'HBO Max'} →
        </a>
        <div style={{ display: 'flex', gap: '24px', color: '#333', fontSize: '13px', marginTop: '8px' }}>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '18px' }}>←</button>
          <span>arrow keys to flip</span>
          <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '18px' }}>→</button>
        </div>
      </div>
    </div>
  );
}
