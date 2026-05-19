export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { prompt } = req.body;
  const AK = process.env.KLING_ACCESS_KEY;
  const SK = process.env.KLING_SECRET_KEY;

  try {
    const { SignJWT } = await import('jose');
    const secret = new TextEncoder().encode(SK);
    const jwt = await new SignJWT({ iss: AK })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30m')
      .setNotBefore('0s')
      .sign(secret);

    const response = await fetch('https://api.klingai.com/v1/videos/text2video', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
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
    console.log('FULL KLING RESPONSE:', JSON.stringify(data));
    
    // Return everything so frontend can see it
    res.status(200).json(data);
  } catch(err) {
    console.log('ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
}