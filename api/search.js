export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ items: [] });

  const { query = "UK audio post production services" } = req.body || {};

  const prompt = `
Search for UK companies or posts looking for:
audio post-production, localisation, subtitling, QC, or archive services.

Return ONLY valid JSON:
[
  {
    "title": "Title",
    "source": "Source",
    "description": "What they need",
    "url": "",
    "tags": ["audio","localisation"],
    "relevance": "Why relevant to PIP Studios"
  }
]
`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt + `\nQuery: ${query}` }],
      tools: [{ type: "web_search_20250305", name: "web_search" }]
    })
  });

  const data = await r.json();
  const text = data.content?.find(b => b.type === "text")?.text || "[]";

  try {
    const items = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || "[]");
    return res.status(200).json({ items });
  } catch {
    return res.status(200).json({ items: [] });
  }
}

