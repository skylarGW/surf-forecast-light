// 安全工具函数
class SecurityUtils {
    // XSS防护 - 严格的输入清理
    static sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        
        // 移除所有HTML标签和特殊字符
        return str.replace(/<[^>]*>/g, '')
                 .replace(/[<>"'&]/g, '')
                 .trim();
    }
    
    // XSS防护 - 安全的DOM操作
    static safeSetHTML(element, content) {
        if (!element) return;
        
        // 严格验证内容类型
        if (typeof content !== 'string' && typeof content !== 'number') {
            console.warn('Invalid content type for DOM operation');
            return;
        }
        
        // 只使用textContent，永不使用innerHTML
        element.textContent = String(content);
    }
    
    // XSS防护 - 安全的属性设置
    static safeSetAttribute(element, attr, value) {
        if (!element || !attr) return;
        
        // 白名单验证属性名
        const allowedAttrs = ['id', 'class', 'data-*', 'aria-*'];
        if (!allowedAttrs.some(allowed => 
            allowed.endsWith('*') ? attr.startsWith(allowed.slice(0, -1)) : attr === allowed
        )) {
            console.warn('Attribute not in whitelist:', attr);
            return;
        }
        
        // 严格清理属性值
        const cleanValue = String(value)
            .replace(/[<>"'&\n\r\t]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
        
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