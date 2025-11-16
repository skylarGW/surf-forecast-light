// 简化的Windy API测试函数
export default async function handler(req, res) {
  console.log('=== Windy API Test Function ===');
  
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 环境变量检查
    const apiKey = process.env.WINDY_API_KEY;
    console.log('Environment check:');
    console.log('- API Key exists:', !!apiKey);
    console.log('- API Key length:', apiKey ? apiKey.length : 0);
    console.log('- All env vars:', Object.keys(process.env).filter(k => k.includes('WINDY')));
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'WINDY_API_KEY not configured',
        availableEnvVars: Object.keys(process.env).filter(k => k.includes('WINDY')),
        allEnvVarsCount: Object.keys(process.env).length
      });
    }

    // 测试坐标
    const testLat = 18.5;
    const testLng = 110.1;
    
    console.log('Testing with coordinates:', testLat, testLng);
    
    // 构建请求
    const requestBody = {
      lat: testLat,
      lon: testLng,
      model: 'gfsWave',
      parameters: ['waves', 'period'],
      levels: ['surface'],
      key: apiKey
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // 调用Windy API
    const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Windy API response status:', response.status);
    console.log('Windy API response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Windy API response text:', responseText);
    
    if (!response.ok) {
      return res.status(200).json({
        success: false,
        error: `Windy API error: ${response.status}`,
        statusText: response.statusText,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: responseText,
        requestBody: requestBody
      });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(200).json({
        success: false,
        error: 'JSON parse error',
        parseError: parseError.message,
        responseText: responseText
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Windy API call successful',
      data: data,
      requestBody: requestBody
    });
    
  } catch (error) {
    console.error('Test function error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
  }
}