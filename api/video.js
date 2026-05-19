export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { prompt } = req.body;
  const AK = process.env.KLING_ACCESS_KEY;
  const SK = process.env.KLING_SECRET_KEY;

  try {
    const jwt = await makeJWT(AK, SK);
    
    const response = await fetch('https://api.klingai.com/v1/videos/text2video', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        model_name: 'kling-v1',
        prompt,
        negative_prompt: 'text, watermark, blurry',
        cfg_scale: 0.5,
        mode: 'std',
        duration: '5'
      })
    });

    const data = await response.json();
    console.log('Kling response:', JSON.stringify(data));
    res.status(200).json(data);
  } catch(err) {
    console.log('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function makeJWT(ak, sk) {
  const now = Math.floor(Date.now() / 1000);
  
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: ak,
    exp: now + 1800,
    nbf: now - 5
  }));
  
  const signingInput = `${header}.${payload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(sk),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput)
  );
  
  const sig = base64url(new Uint8Array(signature));
  return `${signingInput}.${sig}`;
}

function base64url(input) {
  let str;
  if (input instanceof Uint8Array) {
    str = String.fromCharCode(...input);
  } else {
    str = input;
  }
  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//