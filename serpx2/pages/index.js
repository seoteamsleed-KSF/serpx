import { useState } from 'react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
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
  };

  const formatMs = (ms) => {
    if (!ms) return '-';
    return (ms / 1000).toFixed(2) + 's';
  };

  const color = (value, good, bad) => {
    if (value === null) return 'white';
    if (value <= good) return '#00ffcc';
    if (value >= bad) return '#ff4d4d';
    return '#ffaa00';
  };

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: 30 }}>
      <h1>SLEED SEO: SERP Analyzer</h1>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="keyword"
        style={{ padding: 10, marginRight: 10 }}
      />
      <button onClick={analyze}>Analyze</button>

      {loading && <p>Loading...</p>}

      <table style={{ width: '100%', marginTop: 30 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Domain</th>
            <th>URL</th>
            <th>Title</th>
            <th>DR</th>
            <th>Traffic</th>
            <th>Keywords</th>
            <th>LCP</th>
            <th>INP</th>
            <th>CLS</th>
          </tr>
        </thead>

        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.position}</td>
              <td>{r.domain}</td>
              <td><a href={r.url} target="_blank">link</a></td>
              <td>{r.title}</td>

              <td>{r.dr}</td>
              <td>{r.traffic}</td>
              <td>{r.keywords}</td>

              <td style={{ color: color(r.lcp, 2.5, 4) }}>
                {formatMs(r.lcp)}
              </td>

              <td style={{ color: color(r.inp, 200, 500) }}>
                {r.inp ? r.inp + 'ms' : '-'}
              </td>

              <td style={{ color: color(r.cls, 0.1, 0.25) }}>
                {r.cls ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
