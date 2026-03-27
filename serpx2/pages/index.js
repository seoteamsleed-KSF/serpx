import { useState } from 'react';

function cwv(v, type) {
  if (typeof v !== 'number') return 'N/A';

  if (type === 'lcp') return (v / 1000).toFixed(2) + 's';
  if (type === 'cls') return v.toFixed(3);
  return Math.round(v) + 'ms';
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);

  async function analyze() {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });

    const data = await res.json();
    setResults(data.results || []);
  }

  return (
    <div style={{ padding: 40, background: '#0a0a0f', minHeight: '100vh', color: '#fff' }}>
      
      <h1>SERP·X</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="keyword"
          style={{ padding: 10, width: 300 }}
        />
        <button onClick={analyze} style={{ marginLeft: 10 }}>
          Analyze
        </button>
      </div>

      <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
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
            <tr key={i} style={{ borderBottom: '1px solid #222' }}>
              <td>{r.position}</td>
              <td>{new URL(r.url).hostname}</td>

              <td>
                <a href={r.url} target="_blank" style={{ color: '#7c6aff' }}>
                  link
                </a>
              </td>

              <td>{r.title}</td>
              <td>{r.domain_rating}</td>
              <td>{cwv(r.lcp, 'lcp')}</td>
              <td>{cwv(r.inp, 'inp')}</td>
              <td>{cwv(r.cls, 'cls')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
