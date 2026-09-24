// Lily — pleasant British female (ElevenLabs). Needs ELEVENLABS_API_KEY on Vercel.
var LILY = 'pFZP5JQG7iQjIQuC4Bku';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  var key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    res.status(503).json({ error: 'ELEVENLABS_API_KEY is not set' });
    return;
  }
  var text = req.body && req.body.text ? String(req.body.text).trim() : '';
  if (!text || text.length > 3500) {
    res.status(400).json({ error: 'text required' });
    return;
  }
  var upstream = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + LILY, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.42, similarity_boost: 0.78, style: 0.15 }
    })
  });
  if (!upstream.ok) {
    res.status(upstream.status).json({ error: 'elevenlabs' });
    return;
  }
  var buf = Buffer.from(await upstream.arrayBuffer());
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(buf);
};
