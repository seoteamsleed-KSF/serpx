import { useState } from 'react';
import Head from 'next/head';

const T = {
  lcp: { good: 2500, poor: 4000 },
  inp: { good: 200, poor: 500 },
  cls: { good: 0.1, poor: 0.25 }
};

function cwvInfo(m, v) {
  if (v == null) return { label: 'N/A', color: '#888', bg: '#f0f0f0' };
  const good = v <= T[m].good;
  const poor = v > T[m].poor;
  const label = m === 'cls' ? v.toFixed(3) : m === 'lcp' ? (v / 1000).toFixed(2) + 's' : v + 'ms';
  if (good)  return { label, color: '#085041', bg: '#e1f5ee' };
  if (poor)  return { label, color: '#501313', bg: '#fdecea' };
  return { label, color: '#633806', bg: '#fff4e0' };
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}
function getPath(url) {
  try { const u = new URL(url); return u.pathname + (u.search || ''); } catch { return ''; }
}

const S = {
  app: { background: '#0a0a0f', minHeight: '100vh', color: '#e8e8f0', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  header: { padding: '20px 28px', borderBottom: '1px solid #1e1e2e', background: 'linear-gradient(180deg,#0e0e1c,#0a0a0f)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  logoWrap: { display: 'flex', alignItems: 'baseline', gap: 10 },
  logo: { fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#7c6aff,#00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  version: { fontFamily: 'monospace', fontSize: 10, background: '#1e1e2e', color: '#555', padding: '2px 6px', borderRadius: 4 },
  pills: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pill: { fontFamily: 'monospace', fontSize: 10, padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(0,212,170,0.4)', color: '#00d4aa', background: 'rgba(0,212,170,0.07)' },
  searchArea: { padding: '20px 28px', borderBottom: '1px solid #1e1e2e', display: 'flex', gap: 10, alignItems: 'flex-end' },
  label: { display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', background: '#111118', border: '1px solid #1e1e2e', color: '#e8e8f0', fontFamily: 'inherit', fontSize: 15, padding: '11px 16px', borderRadius: 8, outline: 'none' },
  btn: { background: 'linear-gradient(135deg,#7c6aff,#5a4de0)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, padding: '11px 28px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' },
  btnDis: { opacity: 0.35, cursor: 'not-allowed' },
  error: { margin: '12px 28px 0', padding: '10px 14px', background: 'rgba(255,77,109,0.08)', border: '1px solid #ff4d6d', borderRadius: 8, fontSize: 13, color: '#ff4d6d' },
  loader: { padding: '20px 28px' },
  loaderBar: { height: 3, background: '#1e1e2e', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  loaderTxt: { fontFamily: 'monospace', fontSize: 11, color: '#555', marginTop: 8 },
  results: { padding: '18px 28px 48px' },
  meta: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 },
  metaTitle: { fontSize: 15, fontWeight: 600 },
  metaSub: { fontFamily: 'monospace', fontSize: 10, color: '#555' },
  legend: { display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' },
  legItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#666' },
  tableWrap: { overflowX: 'auto', borderRadius: 10, border: '1px solid #1e1e2e' },
  th: { background: '#111118', padding: '8px 10px', textAlign: 'left', fontFamily: 'monospace', fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid #1e1e2e', whiteSpace: 'nowrap' },
  td: { padding: '10px 10px', verticalAlign: 'middle' },
  empty: { textAlign: 'center', padding: '72px 28px', color: '#555' },
};

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  async function analyze() {
    const kw = keyword.trim();
    if (!kw || loading) return;
    setLoading(true); setError(''); setResults([]); setSearched(kw);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResults(data.results || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Head>
        <title>SERP·X</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <div style={S.app}>

        <header style={S.header}>
          <div style={S.logoWrap}>
            <span style={S.logo}>SERP·X</span>
            <span style={S.version}>v2.1</span>
          </div>
          <div style={S.pills}>
            {['🇬🇷 Greece', '📱 Mobile CWV', 'Ahrefs', 'CrUX'].map(p =>
              <span key={p} style={S.pill}>{p}</span>)}
          </div>
        </header>

        <div style={S.searchArea}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Keyword</label>
            <input
              style={S.input}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="e.g. ασφάλεια αυτοκινήτου"
              disabled={loading}
              autoFocus
            />
          </div>
          <button
            style={{ ...S.btn, ...(loading || !keyword.trim() ? S.btnDis : {}) }}
            onClick={analyze}
            disabled={loading || !keyword.trim()}
          >
            {loading ? 'Analyzing…' : 'Analyze →'}
          </button>
        </div>

        {error && <div style={S.error}>⚠ {error}</div>}

        {loading && (
          <div style={S.loader}>
            <div style={S.loaderBar}>
              <div style={{
                position: 'absolute', top: 0, left: '-40%', width: '40%', height: '100%',
                background: 'linear-gradient(90deg,#7c6aff,#00d4aa)',
                animation: 'slide 1.2s ease infinite'
              }} />
            </div>
            <div style={S.loaderTxt}>Fetching Ahrefs SERP + CrUX in parallel…</div>
            <style>{`@keyframes slide { to { left: 100%; } }`}</style>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div style={S.results}>
            <div style={S.meta}>
              <div style={S.metaTitle}>
                Results for <span style={{ color: '#7c6aff' }}>"{searched}"</span>
              </div>
              <div style={S.metaSub}>{results.length} results · gr · mobile CWV</div>
            </div>

            <div style={S.legend}>
              {[['#085041','#e1f5ee','Good'], ['#633806','#fff4e0','Needs impr.'], ['#501313','#fdecea','Poor']].map(([c,,l]) => (
                <span key={l} style={S.legItem}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>

            <div style={S.tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 600 }}>
                <thead>
                  <tr>{['#','URL','Title','DR','Ref Domains','LCP','INP','CLS'].map(h =>
                    <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.position} style={{ borderBottom: i < results.length - 1 ? '1px solid #171724' : 'none' }}>
                      <td style={{ ...S.td, fontFamily: 'monospace', color: '#555', width: 32, textAlign: 'center' }}>{r.position}</td>
                      <td style={{ ...S.td, maxWidth: 170 }}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <span style={{ display: 'block', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#e8e8f0' }}>{getDomain(r.url)}</span>
                          <span style={{ display: 'block', fontFamily: 'monospace', fontSize: 10, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getPath(r.url)}</span>
                        </a>
                      </td>
                      <td style={{ ...S.td, maxWidth: 220 }}>
                        <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#c0c0d0', fontSize: 11 }} title={r.title}>{r.title || '—'}</span>
                      </td>
                      <td style={S.td}>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: 'rgba(124,106,255,0.13)', color: '#9d8fff', display: 'inline-block' }}>
                          {Math.round(r.domain_rating)}
                        </span>
                      </td>
                      <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 12 }}>
                        {Number(r.refdomains).toLocaleString()}
                      </td>
                      {['lcp', 'inp', 'cls'].map(m => {
                        const { label, color, bg } = cwvInfo(m, r[m]);
                        return (
                          <td key={m} style={S.td}>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: bg, color, display: 'inline-block', whiteSpace: 'nowrap' }}>
                              {label}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div style={S.empty}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>◎</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#e8e8f0', marginBottom: 6 }}>Ready to Analyze</div>
            <div style={{ fontSize: 13 }}>Enter a keyword and hit Analyze.</div>
          </div>
        )}

      </div>
    </>
  );
}
