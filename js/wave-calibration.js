// 浪高校准算法 - 基于四因素预测模型分析
class WaveCalibrationModel {
    constructor() {
        // 简化的校准参数 - 去掉海床深度、遮蔽系数、中国近岸衰减
        this.calibrationFactors = {
            // 地形系数 - 开放海湾影响最小
            terrain: {
                open: 0.85,           // 开放海湾，地形影响很小
                semi_enclosed: 0.65,  // 半封闭海湾，中等影响  
                enclosed: 0.4         // 封闭海湾，影响较大
            },
            
            // 海床类型影响
            seabedType: {
                sand: 0.7,           // 沙底 - 能量吸收适中
                sand_rock: 0.75,     // 沙石混合
                rock: 0.85,          // 岩石 - 能量反射较强
                reef: 0.9,           // 礁石 - 能量反射最强
                rock_reef: 0.8,      // 岩礁混合
                sand_reef: 0.75      // 沙礁混合
            },
            
            // 潮汐系数
            tidal: {
                low: 0.6,
                mid_low: 0.75,
                mid: 0.85,
                mid_high: 0.9,
                high: 0.8
            },
            
            // 能量衰减
            energy: 0.9
        };
    }

    // 生成基础浪高数据 - 根据地理位置优化
    generateBaseWave(spot) {
        const { min, max } = this.calibrationFactors.baseWaveRange;
        let baseWave = min + Math.random() * (max - min);
        
        // 根据地理位置调整基础浪高
        if (spot.lat < 20) {
            // 海南地区 - 热带海域，浪高相对较大
            baseWave *= 1.3;
        } else if (spot.lat < 32) {
            // 东海南海地区
            baseWave *= 1.1;
        } else {
            // 黄海渤海地区 - 浪高相对较小
            baseWave *= 0.9;
        }
        
        return baseWave;
    }

    // 简化的浪高校准模型
    calibrateWaveHeight(baseWave, spot) {
        let calibrated = baseWave;
        
        // 1. 地形影响
        calibrated *= this.calibrationFactors.terrain[spot.bayShape];
        
        // 2. 海床类型影响
        calibrated *= this.calibrationFactors.seabedType[spot.seabedType];
        
        // 3. 潮汐影响
        const tidalPhase = this.getCurrentTidalPhase();
        calibrated *= this.calibrationFactors.tidal[tidalPhase];
        
        // 4. 能量衰减
        calibrated *= this.calibrationFactors.energy;
        
        return Math.max(0.1, calibrated);
    }

    // 获取当前潮汐相位
    getCurrentTidalPhase() {
        const hour = new Date().getHours();
        const cycle = (hour % 12) / 12;
        if (cycle < 0.2) return 'low';
        if (cycle < 0.4) return 'mid_low';
        if (cycle < 0.6) return 'mid';
        if (cycle < 0.8) return 'mid_high';
        return 'high';
    }

    // 生成模拟浪况数据
    generateWaveData(spot, date) {
        const baseWave = this.generateBaseWave(spot);
        const calibratedWave = this.calibrateWaveHeight(baseWave, spot);
        
        return {
            date: date,
            waveHeight: Math.round(calibratedWave * 100) / 100,
            period: Math.round((6 + Math.random() * 8) * 10) / 10,
            windSpeed: Math.round((5 + Math.random() * 15) * 10) / 10,
            windDirection: Math.round(Math.random() * 360),
            tidalPhase: this.getCurrentTidalPhase()
        };
    }
}