// 浪高校准算法 - 基于四因素预测模型分析
class WaveCalibrationModel {
    constructor() {
        // 简化的校准参数 - 移除潮汐校准，更新地形参数
        this.calibrationFactors = {
            // 地形系数 - 仅保留开放和封闭两种
            terrain: {
                open: 0.9,            // 开放海湾，影响小
                enclosed: 0.4         // 封闭海湾，影响大
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
        
        // 3. 能量衰减
        calibrated *= this.calibrationFactors.energy;
        
        return Math.max(0.3, calibrated);
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
            windDirection: Math.round(Math.random() * 360)
        };
    }
}