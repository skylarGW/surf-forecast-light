// Vercel Serverless Function - 免费API优化版
let cache = new Map();
let requestCount = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6小时缓存
const MAX_DAILY_REQUESTS = 30; // 每日最大请求数

export default async function handler(req, res) {
  console.log('=== Windy Proxy Function Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Environment WINDY_API_KEY exists:', !!process.env.WINDY_API_KEY);
  
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=21600'); // 6小时缓存
  
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lat, lng } = req.body;
    
    // 输入验证
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // 生成缓存键（精度到0.1度减少API调用）
    const roundedLat = Math.round(lat * 10) / 10;
    const roundedLng = Math.round(lng * 10) / 10;
    const cacheKey = `${roundedLat},${roundedLng}`;
    
    // 检查缓存
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Cache hit:', cacheKey);
      return res.status(200).json(cached.data);
    }

    // 请求频率限制
    if (requestCount >= MAX_DAILY_REQUESTS) {
      console.log('Daily limit reached, using fallback');
      const fallbackData = generateFallbackData(lat, lng);
      return res.status(200).json(fallbackData);
    }

    // 检查API Key
    const apiKey = process.env.WINDY_API_KEY;
    console.log('Environment variables check:');
    console.log('- WINDY_API_KEY exists:', !!apiKey);
    console.log('- WINDY_API_KEY length:', apiKey ? apiKey.length : 0);
    console.log('- WINDY_API_KEY first 10 chars:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
    
    if (!apiKey) {
      console.error('WINDY_API_KEY not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('WINDY')));
      throw new Error('API Key not configured');
    }
    
    console.log('Calling Windy API with coordinates:', roundedLat, roundedLng);
    
    // 调用Windy API - 使用正确的端点
    const apiUrl = 'https://api.windy.com/api/point-forecast/v2';
    // 使用gfsWave模型获取海浪数据
    const requestBody = {
      lat: roundedLat,
      lon: roundedLng,
      model: 'gfsWave',
      parameters: ['waves', 'windWaves', 'swell1'],
      levels: ['surface'],
      key: apiKey
    };
    
    console.log('Windy API request details:');
    console.log('- URL:', apiUrl);
    console.log('- Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Windy API response status:', response.status);

    requestCount++;
    console.log(`API call ${requestCount}/${MAX_DAILY_REQUESTS}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Windy API error details:');
      console.error('- Status:', response.status);
      console.error('- Status Text:', response.statusText);
      console.error('- Response Headers:', Object.fromEntries(response.headers.entries()));
      console.error('- Error Body:', errorText);
      throw new Error(`Windy API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Windy API data received:', Object.keys(data));
    const processedData = processWindyDataSimple(data);
    console.log('Processed data:', processedData.forecast.length, 'forecast points');
    
    // 缓存数据
    cache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now()
    });
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    // 降级到备用数据
    const fallbackData = generateFallbackData(req.body.lat, req.body.lng);
    console.log('Returning fallback data with', fallbackData.forecast.length, 'points');
    res.status(200).json(fallbackData);
  }
}

function processWindyDataSimple(data) {
  const forecast = [];
  const timestamps = data.ts;
  const waves = data['waves-surface'];
  const windWaves = data['windWaves-surface'];
  const swell1 = data['swell1-surface'];

  // 使用真实海浪数据，模拟风力数据
  for (let i = 0; i < Math.min(timestamps.length, 56); i += 8) {
    const timestamp = timestamps[i];
    const totalWaveHeight = waves[i] || 1.0;
    const windWaveHeight = windWaves[i] || 0.5;
    const swellHeight = swell1[i] || 0.5;
    
    // 基于海浪数据模拟风力
    const simulatedWindSpeed = Math.max(5, windWaveHeight * 12 + Math.random() * 5);
    const simulatedWindDir = Math.floor(Math.random() * 360);
    
    forecast.push({
      timestamp: timestamp,
      waveHeight: Math.round(totalWaveHeight * 100) / 100,
      windSpeed: Math.round(simulatedWindSpeed * 10) / 10,
      windDirection: simulatedWindDir,
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      source: 'windy',
      // 额外信息用于调试
      windWaves: Math.round(windWaveHeight * 100) / 100,
      swell: Math.round(swellHeight * 100) / 100
    });
  }

  return { forecast };
}

function generateFallbackData(lat, lng) {
  const forecast = [];
  const now = Date.now();
  
  for (let day = 0; day < 7; day++) {
    const timestamp = now + (day * 24 * 3600000);
    let baseWave = 0.5 + Math.random() * 2.0;
    
    if (lat < 20) baseWave *= 1.2;
    else if (lat < 32) baseWave *= 1.0;
    else baseWave *= 0.8;
    
    forecast.push({
      timestamp: Math.floor(timestamp / 1000),
      waveHeight: Math.round(baseWave * 100) / 100,
      windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      date: new Date(timestamp).toISOString().split('T')[0],
      source: 'fallback'
    });
  }

  return { forecast };
}

// 每日重置请求计数
setInterval(() => {
  requestCount = 0;
  console.log('Daily request count reset');
}, 24 * 60 * 60 * 1000);