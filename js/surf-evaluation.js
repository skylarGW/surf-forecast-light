// 冲浪评估算法
class SurfEvaluationModel {
    constructor() {
        // 长板和短板评估标准
        this.surfCriteria = {
            longboard: {
                waveHeight: { min: 0.3, max: 1.5, optimal: [0.5, 1.0] },
                period: { min: 8, max: 20, optimal: [10, 16] },
                windSpeed: { min: 0, max: 15, optimal: [0, 8] }
            },
            shortboard: {
                waveHeight: { min: 0.8, max: 3.0, optimal: [1.2, 2.5] },
                period: { min: 6, max: 16, optimal: [8, 14] },
                windSpeed: { min: 0, max: 25, optimal: [5, 15] }
            }
        };
    }

    // 评估浪点适合度
    evaluateSpot(spot, waveData, boardType) {
        const criteria = this.surfCriteria[boardType];
        let score = 0;
        
        // 浪高评分
        const heightScore = this.scoreParameter(waveData.waveHeight, criteria.waveHeight);
        score += heightScore * 0.4;
        
        // 周期评分
        const periodScore = this.scoreParameter(waveData.period, criteria.period);
        score += periodScore * 0.3;
        
        // 风速评分
        const windScore = this.scoreParameter(waveData.windSpeed, criteria.windSpeed);
        score += windScore * 0.3;
        
        return {
            score: Math.round(score * 100) / 100,
            rating: this.getRating(score),
            factors: { height: heightScore, period: periodScore, wind: windScore }
        };
    }

    // 参数评分函数
    scoreParameter(value, criteria) {
        if (value < criteria.min || value > criteria.max) return 0;
        
        const [optimalMin, optimalMax] = criteria.optimal;
        if (value >= optimalMin && value <= optimalMax) return 1.0;
        
        if (value < optimalMin) {
            return (value - criteria.min) / (optimalMin - criteria.min) * 0.8;
        } else {
            return (criteria.max - value) / (criteria.max - optimalMax) * 0.8;
        }
    }

    // 获取评级
    getRating(score) {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.6) return 'good';
        if (score >= 0.4) return 'fair';
        if (score >= 0.2) return 'poor';
        return 'flat';
    }

    // 推荐文案
    getLongboardRecommendation(score) {
        if (score >= 0.8) return '完美的长板条件！平稳长浪，适合滑行走板';
        if (score >= 0.6) return '不错的长板条件，适合练习和休闲冲浪';
        if (score >= 0.4) return '一般条件，初学者可以尝试';
        return '条件不适合长板冲浪';
    }

    getShortboardRecommendation(score) {
        if (score >= 0.8) return '绝佳的短板条件！有力浪墙，适合激进动作';
        if (score >= 0.6) return '良好的短板条件，适合技术练习';
        if (score >= 0.4) return '可以冲浪，但条件一般';
        return '条件不适合短板冲浪';
    }
}