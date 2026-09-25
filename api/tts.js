// British woman from the Pixtolearn app. The key stays on that project.
var UPSTREAM = 'https://pixtolearn-parents-vic-s-projects1.vercel.app/api/voice/speak';
var LILY = 'pFZP5JQG7iQjIQuC4Bku';

function chunksOf(text) {
  var words = String(text || '').trim().split(/\s+/).filter(Boolean);
  var out = [];
  var current = '';
  for (var i = 0; i < words.length; i++) {
    var next = current ? current + ' ' + words[i] : words[i];
    if (next.length > 1000 && current) {
      out.push(current);
      current = words[i];
    } else {
      current = next;
    }
  }
  if (current) out.push(current);
  return out;
}

async function speakDirect(text, key) {
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
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.05 }
    })
  });
  if (!upstream.ok) return null;
  return Buffer.from(await upstream.arrayBuffer());
}

async function speakViaPixtolearn(text) {
  var parts = [];
  var pieces = chunksOf(text);
  for (var i = 0; i < pieces.length; i++) {
    var upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: pieces[i], lang: 'en' })
    });
    var data = await upstream.json().catch(function () { return {}; });
    if (!upstream.ok || !data.audioBase64) return null;
    parts.push(Buffer.from(data.audioBase64, 'base64'));
  }
  return parts.length ? Buffer.concat(parts) : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  var text = req.body && req.body.text ? String(req.body.text).trim() : '';
  if (!text || text.length > 3500) {
    res.status(400).json({ error: 'text required' });
    return;
  }
  var key = process.env.ELEVENLABS_API_KEY;
  var buf = key ? await speakDirect(text, key) : null;
  if (!buf) buf = await speakViaPixtolearn(text);
  if (!buf || !buf.length) {
    res.status(502).json({ error: 'voice' });
    return;
  }
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(buf);
};
