import { KlingAPI } from 'kling-api';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { taskId } = req.query;

  try {
    const api = new KlingAPI({
      accessKey: process.env.KLING_ACCESS_KEY,
      secretKey: process.env.KLING_SECRET_KEY
    });

    const result = await api.getVideoTask(taskId);
    res.status(200).json(result);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}