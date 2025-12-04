export default function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'GET') {
    // 환경변수에서 구글 API 키 가져오기
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googleApiKey) {
      return res.status(500).json({ error: 'Google API key not configured' });
    }

    return res.status(200).json({ apiKey: googleApiKey });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
