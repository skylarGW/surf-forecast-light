// 安全工具函数
class SecurityUtils {
    // XSS防护 - HTML内容清理
    static sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // XSS防护 - 安全的DOM操作
    static safeSetHTML(element, content) {
        if (!element) return;
        
        // 清理所有HTML标签，只保留文本
        element.textContent = content;
    }
    
    // XSS防护 - 安全的属性设置
    static safeSetAttribute(element, attr, value) {
        if (!element || !attr) return;
        
        // 清理属性值
        const cleanValue = String(value).replace(/[<>"'&]/g, '');
        element.setAttribute(attr, cleanValue);
    }
    
    // 强制HTTPS重定向
    static enforceHTTPS() {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            location.replace('https:' + window.location.href.substring(window.location.protocol.length));
        }
    }
    
    // CSP违规报告
    static setupCSPReporting() {
        document.addEventListener('securitypolicyviolation', (e) => {
            console.warn('CSP Violation:', {
                directive: e.violatedDirective,
                blockedURI: e.blockedURI,
                lineNumber: e.lineNumber,
                sourceFile: e.sourceFile
            });
        });
    }
}

// 页面加载时立即执行安全检查
SecurityUtils.enforceHTTPS();
SecurityUtils.setupCSPReporting();