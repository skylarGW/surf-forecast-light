// 环境变量测试函数
export default async function handler(req, res) {
  console.log('=== Environment Variables Test ===');
  
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 获取所有环境变量
    const allEnvVars = Object.keys(process.env);
    const windyRelatedVars = allEnvVars.filter(key => 
      key.toLowerCase().includes('windy') || 
      key.toLowerCase().includes('api')
    );
    
    // 检查WINDY_API_KEY
    const windyApiKey = process.env.WINDY_API_KEY;
    const hasWindyKey = !!windyApiKey;
    
    console.log('Environment analysis:');
    console.log('- Total env vars:', allEnvVars.length);
    console.log('- Windy/API related vars:', windyRelatedVars);
    console.log('- WINDY_API_KEY exists:', hasWindyKey);
    console.log('- WINDY_API_KEY length:', windyApiKey ? windyApiKey.length : 0);
    
    // 检查常见的环境变量名称变体
    const possibleNames = [
      'WINDY_API_KEY',
      'windy_api_key',
      'WINDY_API_KEY ',  // 带空格
      ' WINDY_API_KEY',  // 前面带空格
      'WINDYAPI_KEY',
      'WINDY_KEY'
    ];
    
    const foundVars = {};
    possibleNames.forEach(name => {
      if (process.env[name]) {
        foundVars[name] = {
          exists: true,
          length: process.env[name].length,
          firstChars: process.env[name].substring(0, 10) + '...'
        };
      }
    });
    
    const result = {
      success: true,
      environment: {
        totalEnvVars: allEnvVars.length,
        windyRelatedVars: windyRelatedVars,
        windyApiKeyExists: hasWindyKey,
        windyApiKeyLength: windyApiKey ? windyApiKey.length : 0,
        windyApiKeyPreview: windyApiKey ? windyApiKey.substring(0, 10) + '...' : null,
        possibleVariants: foundVars,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        timestamp: new Date().toISOString()
      }
    };
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Environment test error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}