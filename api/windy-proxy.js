// Vercel Serverless Function - 免费API优化版
let cache = new Map();
let requestCount = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6小时缓存
const MAX_DAILY_REQUESTS = 30; // 每日最大请求数

export default async function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=21600'); // 6小时缓存
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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

    // 调用Windy API
    const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lat: roundedLat,
        lon: roundedLng,
        model: 'gfs',
        parameters: ['waves', 'wind', 'windDir', 'period'],
        levels: ['surface'],
        key: process.env.WINDY_API_KEY
      })
    });

    requestCount++;
    console.log(`API call ${requestCount}/${MAX_DAILY_REQUESTS}`);

    if (!response.ok) {
      throw new Error(`Windy API error: ${response.status}`);
    }

    const data = await response.json();
    const processedData = processWindyData(data);
    
    // 缓存数据
    cache.set(cacheKey, {
      data: processedData,
      timestamp: Date.now()
    });
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('API Error:', error);
    // 降级到备用数据
    const fallbackData = generateFallbackData(req.body.lat, req.body.lng);
    res.status(200).json(fallbackData);
  }
}

function processWindyData(data) {
  const forecast = [];
  const timestamps = data.ts;
  const waves = data['waves-surface'];
  const wind = data['wind-surface'];
  const windDir = data['windDir-surface'];
  const period = data['period-surface'];

  for (let i = 0; i < Math.min(timestamps.length, 56); i += 8) {
    forecast.push({
      timestamp: timestamps[i],
      waveHeight: waves[i],
      windSpeed: wind[i],
      windDirection: windDir[i],
      period: period[i],
      date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
      source: 'windy'
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
      period: Math.round((6 + Math.random() * 8) * 10) / 10,
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