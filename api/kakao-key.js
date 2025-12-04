export default function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'GET') {
    // 환경변수에서 카카오 API 키 가져오기
    const kakaoApiKey = process.env.KAKAO_API_KEY;

    if (!kakaoApiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    return res.status(200).json({ apiKey: kakaoApiKey });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
