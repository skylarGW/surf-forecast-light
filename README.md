# 🌊 浪点预测网站 - 详细浪高分量数据版

## 功能特点

### 🎯 核心功能
- **真实海洋数据**: 调用Windy API获取准确的海浪预测
- **详细浪高分量**: 显示总浪高、风浪分量、涌浪分量数据
- **智能推荐**: AI分析长板/短板最佳浪点
- **7天预测**: 完整一周浪况预报
- **多地区覆盖**: 海南、青岛、舟山13个精选浪点

### 📊 数据显示
API调用返回以下4个关键数值：
1. **总浪高** (waves_height-surface) - 海面总体浪高
2. **风浪分量** (wwaves_height-surface) - 由风力产生的浪高  
3. **涌浪分量** (swell1_height-surface) - 远程传播的涌浪高度
4. **时间戳** (ts) - 预测时间点

### 🎨 界面特色
- 响应式设计，支持手机/平板/电脑
- 海洋主题渐变背景
- 直观的评分系统和推荐文案
- 按时间显示详细浪高分量数据

## 文件结构

```
light版/
├── api/
│   ├── windy-proxy.js          # Vercel API代理函数
│   ├── test-windy.js           # API测试函数
│   └── env-test.js             # 环境变量测试
├── js/
│   ├── windy-service.js        # Windy API服务类
│   ├── surf-evaluation.js      # 冲浪评估算法
│   ├── surf-spots.js          # 浪点数据
│   ├── wave-calibration.js    # 浪高校准模型
│   ├── date-utils.js          # 日期工具函数
│   └── security-utils.js      # 安全工具函数
├── index.html                  # 主页面
├── test-wave-components.html   # 浪高分量数据测试页面
├── api-test.html              # API测试页面
├── debug-windy.html           # Windy调试页面
├── vercel.json                # Vercel配置
├── 新手部署指南.md             # 详细部署教程
└── README.md                  # 项目说明
```

## 快速开始

### 1. 部署到Vercel
1. Fork此项目到你的GitHub
2. 在Vercel导入项目
3. 设置环境变量 `WINDY_API_KEY`
4. 部署完成

### 2. 获取Windy API Key
1. 访问 https://api.windy.com/
2. 注册账户并申请免费API Key
3. 在Vercel环境变量中配置

### 3. 测试功能
- 主网站: `https://your-project.vercel.app`
- 数据测试: `https://your-project.vercel.app/test-wave-components.html`
- API测试: `https://your-project.vercel.app/api-test.html`

## 技术架构

### 前端技术
- 纯HTML/CSS/JavaScript
- 响应式设计
- 安全的DOM操作
- 本地缓存优化

### 后端服务
- Vercel Serverless Functions
- Windy API集成
- 智能缓存策略
- 降级备用数据

### 数据处理
- 真实海洋数据校准
- 地理位置调整算法
- 冲浪条件评估模型
- 多时间点预测

## 浪点数据

### 海南地区 (6个浪点)
- 陵水万豪、陵水银滩、陵水香水湾
- 万宁石梅湾、万宁南燕湾、万宁高尔夫

### 青岛地区 (3个浪点)  
- 石老人海水浴场、流清河海水浴场、黄岛两河口

### 舟山地区 (4个浪点)
- 东沙冲浪公园、岱山鹿栏等

## API使用说明

### 请求格式
```javascript
POST /api/windy-proxy
{
  "lat": 18.527192,
  "lng": 110.107462
}
```

### 响应格式
```javascript
{
  "forecast": [
    {
      "timestamp": 1703123456,
      "totalWaveHeight": 1.2,
      "windWaveHeight": 0.7,
      "swellHeight": 0.5,
      "date": "2023-12-21",
      "time": "14:00",
      "source": "windy"
    }
  ]
}
```

## 优化特性

### 性能优化
- 6小时数据缓存
- 批量API调用
- 坐标精度优化
- 请求频率限制

### 用户体验
- 加载状态显示
- 错误处理机制
- 数据源标识
- 离线降级方案

## 部署配置

### 环境变量
```
WINDY_API_KEY=your_windy_api_key_here
```

### Vercel配置 (vercel.json)
```json
{
  "functions": {
    "api/windy-proxy.js": {
      "maxDuration": 30
    }
  }
}
```

## 监控和维护

### 数据源监控
- 实时数据比例
- API调用成功率
- 缓存命中率
- 错误日志分析

### 用户体验监控
- 页面加载时间
- 数据更新频率
- 移动端适配
- 浏览器兼容性

## 贡献指南

欢迎提交Issue和Pull Request来改进项目：

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License - 可自由使用和修改

## 联系方式

如有问题或建议，请通过GitHub Issues联系。

---

🌊 享受冲浪，享受代码！ 🏄‍♂️