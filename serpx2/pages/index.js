import { useState } from 'react';

function format(v, type) {
  if (!v) return 'N/A';

  if (type === 'lcp') return (v / 1000).toFixed(2) + 's';
  if (type === 'cls') return v.toFixed(3);

  return Math.round(v) + 'ms';
}

function getColor(type, v) {
  if (!v) return '#888';

  if (type === 'lcp') {
    if (v <= 2500) return '#00d4aa';
    if (v <= 4000) return '#ffaa00';
    return '#ff4d6d';
  }

  if (type === 'inp') {
    if (v <= 200) return '#00d4aa';
    if (v <= 500) return '#ffaa00';
    return '#ff4d6d';
  }

  if (type === 'cls') {
    if (v <= 0.1) return '#00d4aa';
    if (v <= 0.25) return '#ffaa00';
    return '#ff4d6d';
  }
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResults([]);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });

    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <div style={{ padding: 40, background: '#0a0a0f', minHeight: '100vh', color: '#fff' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>SLEED SEO: SERP Analyzer</h1>

        <img
          src="https://app.linq.co/_next/image?url=https%3A%2F%2Fcollege-link-bucket.fra1.digitaloceanspaces.com%2Femployer%2Fuploads%2Fimages%2Fcompany_profile%2FSEDPQUtrCt20.png&w=3840&q=75"
          style={{ height: 50 }}
        />
      </div>

      {/* INPUT */}
      <div style={{ marginTop: 20 }}>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Enter keyword"
          style={{ padding: 10, width: 300 }}
        />
        <button onClick={analyze} style={{ marginLeft: 10 }}>
          Analyze
        </button>
      </div>

      {/* LOADING */}
      {loading && <div style={{ marginTop: 20 }}>🔄 Running analysis...</div>}

      {/* TABLE */}
      {!loading && results.length > 0 && (
        <table style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Domain</th>
              <th>URL</th>
              <th>Title</th>
              <th>DR</th>
              <th>LCP</th>
              <th>INP</th>
              <th>CLS</th>
            </tr>
          </thead>

          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.position}</td>
                <td>{new URL(r.url).hostname}</td>

                <td>
                  <a href={r.url} target="_blank" style={{ color: '#7c6aff' }}>
                    link
                  </a>
                </td>

                <td style={{ maxWidth: 300 }}>{r.title}</td>

                <td>{r.domain_rating}</td>

                <td style={{ color: getColor('lcp', r.lcp) }}>
                  {format(r.lcp, 'lcp')}
                </td>

                <td style={{ color: getColor('inp', r.inp) }}>
                  {format(r.inp, 'inp')}
                </td>

                <td style={{ color: getColor('cls', r.cls) }}>
                  {format(r.cls, 'cls')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
