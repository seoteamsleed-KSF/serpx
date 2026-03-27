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
  const label =
    m === 'cls'
      ? v.toFixed(3)
      : m === 'lcp'
      ? (v / 1000).toFixed(2) + 's'
      : v + 'ms';

  if (good) return { label, color: '#085041', bg: '#e1f5ee' };
  if (poor) return { label, color: '#501313', bg: '#fdecea' };
  return { label, color: '#633806', bg: '#fff4e0' };
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function getPath(url) {
  try {
    const u = new URL(url);
    return u.pathname + (u.search || '');
  } catch {
    return '';
  }
}

const S = {
  app: { background: '#0a0a0f', minHeight: '100vh', color: '#e8e8f0', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  header: { padding: '20px 28px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between' },
  logo: { fontWeight: 800, fontSize: 22, color: '#7c6aff' },
  searchArea: { padding: '20px 28px', display: 'flex', gap: 10 },
  input: { flex: 1, background: '#111118', border: '1px solid #1e1e2e', color: '#fff', padding: '10px', borderRadius: 6 },
  btn: { padding: '10px 20px', background: '#7c6aff', border: 'none', color: '#fff', borderRadius: 6 },
  tableWrap: { padding: 20 }
};

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'error');

      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>SERP·X</title>
      </Head>

      <div style={S.app}>
        <header style={S.header}>
          <div style={S.logo}>SERP·X</div>
        </header>

        <div style={S.searchArea}>
          <input
            style={S.input}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="keyword"
          />
          <button style={S.btn} onClick={analyze}>
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>

        {error && <div style={{ color: 'red', padding: 20 }}>{error}</div>}

        <div style={S.tableWrap}>
          {!loading && results.length === 0 && <div>No results</div>}

          {Array.isArray(results) && results.length > 0 && (
            <table style={{ width: '100%', fontSize: 12 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>URL</th>
                  <th>DR</th>
                  <th>RD</th>
                  <th>LCP</th>
                  <th>INP</th>
                  <th>CLS</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const lcp = cwvInfo('lcp', r.lcp);
                  const inp = cwvInfo('inp', r.inp);
                  const cls = cwvInfo('cls', r.cls);

                  return (
                    <tr key={i}>
                      <td>{r.position || i + 1}</td>
                      <td>{getDomain(r.url)}</td>
                      <td>{Math.round(r.domain_rating || 0)}</td>
                      <td>{Number(r.refdomains || 0)}</td>
                      <td>{lcp.label}</td>
                      <td>{inp.label}</td>
                      <td>{cls.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
