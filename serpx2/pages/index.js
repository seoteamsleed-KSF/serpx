import { useState } from 'react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });

    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h1>SLEED SEO: SERP Analyzer</h1>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ padding: 10, marginRight: 10 }}
      />

      <button onClick={analyze}>
        {loading ? 'Loading...' : 'Analyze'}
      </button>

      <table style={{ width: '100%', marginTop: 30 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Domain</th>
            <th>URL</th>
            <th>Title</th>
            <th>Traffic</th>
            <th>Keywords</th>
            <th>LCP</th>
            <th>INP</th>
            <th>CLS</th>
          </tr>
        </thead>

        <tbody>
          {results.map((r, i) => {
            const domain = new URL(r.url).hostname;

            return (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{domain}</td>

                <td>
                  <a href={r.url} target="_blank" style={{ color: '#4ea1ff' }}>
                    link
                  </a>
                </td>

                <td>{r.title}</td>

                {/* ✅ DATA */}
                <td style={{ color: '#00ffcc' }}>{r.traffic}</td>
                <td style={{ color: '#00ffcc' }}>{r.keywords}</td>

                {/* ✅ COLORS */}
                <td style={{ color: r.lcp > 2500 ? 'red' : '#00ffcc' }}>
                  {r.lcp}
                </td>

                <td style={{ color: r.inp > 200 ? 'orange' : '#00ffcc' }}>
                  {r.inp}
                </td>

                <td style={{ color: r.cls > 0.1 ? 'red' : '#00ffcc' }}>
                  {r.cls}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
