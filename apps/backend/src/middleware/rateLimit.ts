/**
 * Rate Limiting Middleware
 * Protege a API contra abuso e ataques DDoS
 */

interface RateLimitOptions {
  windowMs: number; // Janela de tempo em ms
  max: number; // Máximo de requisições por janela
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Store simples em memória (em produção, usar Redis)
const store: RateLimitStore = {};

// Limpar entradas expiradas periodicamente
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Limpar a cada minuto

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos padrão
    max = 100, // 100 requisições padrão
    message = 'Muitas requisições. Tente novamente mais tarde.',
    skipSuccessfulRequests = false
  } = options;

  return (req: any, res: any, next: any) => {
    // Em modo demo, rate limiting mais permissivo
    if (process.env.AUTH_DEMO === 'true') {
      return next();
    }

    // Identificar cliente (IP ou user ID)
    const identifier = req.ip || 
                      req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.connection.remoteAddress || 
                      'unknown';

    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    // Inicializar ou resetar se expirado
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Incrementar contador
    store[key].count++;

    // Verificar limite
    if (store[key].count > max) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Retry-After', Math.ceil((store[key].resetTime - now) / 1000));
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }

    // Se skipSuccessfulRequests, decrementar em sucesso
    if (skipSuccessfulRequests) {
      const originalSend = res.send;
      res.send = function(data: any) {
        if (res.statusCode < 400 && store[key]) {
          store[key].count = Math.max(0, store[key].count - 1);
        }
        return originalSend.call(this, data);
      };
    }

    // Adicionar headers informativos
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    next();
  };
}

// Rate limiters pré-configurados
export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

export const apiRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60 // 60 requisições por minuto
});

