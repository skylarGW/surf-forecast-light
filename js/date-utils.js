// 日期工具函数
class DateUtils {
    // 生成7天日期数据
    static generateDates() {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                date: date.toISOString().split('T')[0],
                day: i === 0 ? '今天' : ['周日','周一','周二','周三','周四','周五','周六'][date.getDay()],
                dateStr: `${date.getMonth() + 1}/${date.getDate()}`
            });
        }
        return dates;
    }

    // 格式化日期显示
    static formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    // 获取今天的日期字符串
    static getTodayString() {
        return new Date().toISOString().split('T')[0];
    }
}