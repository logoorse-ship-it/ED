import { KlingAPI } from 'kling-api';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { prompt } = req.body;

  try {
    const api = new KlingAPI({
      accessKey: process.env.KLING_ACCESS_KEY,
      secretKey: process.env.KLING_SECRET_KEY
    });

    const task = await api.textToVideo({
      prompt,
      model_name: 'kling-v1',
      duration: '5',
      mode: 'std'
    });

    console.log('Task response:', JSON.stringify(task));
    res.status(200).json(task);
  } catch(err) {
    console.log('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}