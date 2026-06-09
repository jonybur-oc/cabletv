import { useEffect, useState } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getVersion: () => Promise<string>;
      installUpdate: () => void;
      onUpdateStatus: (cb: (data: { status: string }) => void) => void;
    };
  }
}

export function UpdateBanner() {
  const [updateReady, setUpdateReady] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.isElectron) return;
    window.electronAPI.onUpdateStatus(({ status }) => {
      if (status === 'downloading') setDownloading(true);
      if (status === 'ready') { setDownloading(false); setUpdateReady(true); }
    });
  }, []);

  if (!updateReady && !downloading) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '48px',
      right: '24px',
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '10px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '13px',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease',
    }}>
      {downloading ? (
        <>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1.5s infinite' }} />
          <span style={{ color: '#888' }}>Downloading update...</span>
        </>
      ) : (
        <>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ color: '#ccc' }}>Update ready</span>
          <button
            onClick={() => window.electronAPI?.installUpdate()}
            style={{
              background: '#22c55e',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Restart & install
          </button>
        </>
      )}
    </div>
  );
}
