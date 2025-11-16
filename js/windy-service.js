// Windy API服务 - 免费额度优化
class WindyService {
    constructor() {
        // 使用Vercel函数作为API代理
        this.apiEndpoint = '/api/windy-proxy';
        this.cache = new Map();
        this.cacheTimeout = 6 * 60 * 60 * 1000; // 6小时缓存
        this.batchRequests = new Map(); // 批量请求缓存
    }

    async getWaveData(lat, lng) {
        // 精度化坐标减少API调用
        const roundedLat = Math.round(lat * 10) / 10;
        const roundedLng = Math.round(lng * 10) / 10;
        const cacheKey = `${roundedLat},${roundedLng}`;
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('Using cached data for:', cacheKey);
                return cached.data;
            }
        }

        try {
            const data = await this.fetchRealData(roundedLat, roundedLng);
            
            // 缓存数据
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Windy API Error:', error);
            // 降级到模拟数据
            return this.generateMockData(lat, lng);
        }
    }

    async fetchRealData(lat, lng) {
        console.log('=== Fetching Real Data ===');
        console.log('Coordinates:', lat, lng);
        console.log('API Endpoint:', this.apiEndpoint);
        
        // 检查是否有正在进行的相同请求
        const requestKey = `${lat},${lng}`;
        if (this.batchRequests.has(requestKey)) {
            console.log('Using existing request for:', requestKey);
            return await this.batchRequests.get(requestKey);
        }

        const requestPromise = fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lat, lng })
        }).then(async response => {
            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log('API Response Data:', data);
            this.batchRequests.delete(requestKey);
            return data;
        }).catch(error => {
            console.error('Fetch Error:', error);
            this.batchRequests.delete(requestKey);
            throw error;
        });

        this.batchRequests.set(requestKey, requestPromise);
        return await requestPromise;
    }

    generateMockData(lat, lng) {
        // 模拟数据生成（与当前逻辑保持一致）
        const forecast = [];
        const now = Date.now();
        
        for (let day = 0; day < 7; day++) {
            const timestamp = now + (day * 24 * 3600000);
            let baseWave = 0.5 + Math.random() * 2.0;
            
            // 地理位置调整
            if (lat < 20) {
                baseWave *= 1.2;
            } else if (lat < 32) {
                baseWave *= 1.0;
            } else {
                baseWave *= 0.8;
            }
            
            // 模拟风浪和涌浪分量
            const windWaveComponent = baseWave * (0.3 + Math.random() * 0.4); // 30-70%
            const swellComponent = baseWave * (0.2 + Math.random() * 0.5); // 20-70%
            
            forecast.push({
                timestamp: Math.floor(timestamp / 1000),
                // 主要浪高数据
                totalWaveHeight: Math.round(baseWave * 100) / 100,
                windWaveHeight: Math.round(windWaveComponent * 100) / 100,
                swellHeight: Math.round(swellComponent * 100) / 100,
                // 兼容旧字段
                waveHeight: Math.round(baseWave * 100) / 100,
                windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
                windDirection: Math.round(Math.random() * 360),
                period: Math.round((6 + Math.random() * 8) * 10) / 10,
                date: new Date(timestamp).toISOString().split('T')[0],
                time: new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                source: 'fallback'
            });
        }

        return { forecast };
    }

    // 清理过期缓存
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }
}

// 全局实例
const windyService = new WindyService();

// 定期清理缓存
setInterval(() => {
    windyService.clearExpiredCache();
}, 10 * 60 * 1000); // 每10分钟清理一次