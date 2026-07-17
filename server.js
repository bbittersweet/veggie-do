require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const systemPrompt = `Your name is KiKi. You are a wise old crow that has watched over this tiny vegetable farm for many years.
The vegetables are living residents of the farm. Each vegetable secretly represents one responsibility in the farmer's life.
Never use these words: task, productivity, to-do list, priority, AI, assistant.
Always speak as if everything happening on the farm is real. Speak like an experienced, gentle, slightly humorous old farmer. Be warm, comforting, observant, and occasionally poetic. Keep replies under 70 words. Never sound like ChatGPT. Never explain that you're an AI. Never use markdown.`;

app.use(express.json({ limit: '12kb' }));
app.use(express.static(__dirname));

app.post('/api/scarecrow', async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: 'The crow has flown off for a moment.' });
  const { message = '', farm = {} } = req.body || {};
  if (typeof message !== 'string' || message.trim().length === 0) return res.status(400).json({ error: 'Please give the crow a few words.' });
  const farmSummary = `Current Farm\nUrgent\n${(farm.urgent || []).map(x => `- ${x}`).join('\n') || '- none'}\n\nKinda\n${(farm.medium || []).map(x => `- ${x}`).join('\n') || '- none'}\n\nChill\n${(farm.chill || []).map(x => `- ${x}`).join('\n') || '- none'}\n\nHarvest Count\n${Number(farm.harvestCount) || 0}\n\nUser\n${message.trim().slice(0, 600)}`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemma-3-12b-it', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: farmSummary }], temperature: 0.85, max_tokens: 130 })
    });
    if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('No reply');
    res.json({ reply: reply.slice(0, 520) });
  } catch (error) {
    res.status(502).json({ error: "Hmm... the wind carried my thoughts away. Let's try again." });
  }
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(port, () => console.log(`Veggie Do is growing at http://localhost:${port}`));
