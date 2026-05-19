export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { taskId } = req.query;
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

    const response = await fetch(`https://api.klingai.com/v1/videos/text2video/${taskId}`, {
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}