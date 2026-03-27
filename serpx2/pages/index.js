import { useState } from 'react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);

  const analyze = async () => {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });

    const data = await res.json();
    setResults(data.results || []);
  };

  return (
    <div style={{ padding: 40, color: 'white', background: '#000', minHeight: '100vh' }}>
      <h1>SLEED SEO: SERP Analyzer</h1>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="keyword"
        style={{ padding: 10, marginRight: 10 }}
      />
      <button onClick={analyze}>Analyze</button>

      <table style={{ marginTop: 30, width: '100%', color: 'white' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Domain</th>
            <th>URL</th>
            <th>Title</th>
            <th>Rank</th>
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
                  <a href={r.url} target="_blank" style={{ color: 'lightblue' }}>
                    link
                  </a>
                </td>
                <td>{r.title}</td>

                {/* 🔥 ΕΔΩ ΗΤΑΝ ΤΟ BUG */}
                <td>{r.dr}</td>
                <td>{r.traffic}</td>
                <td>{r.keywords}</td>

                <td>{r.lcp}</td>
                <td>{r.inp}</td>
                <td>{r.cls}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
