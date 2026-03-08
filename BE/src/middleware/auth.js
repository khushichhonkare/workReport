import { verifyToken } from '../config/jwt.js';

export async function authMiddleware(req, res, next) {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies?.token
    
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.userId = decoded.userId
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function optionalAuth(req, res, next) {
  // Try to get token from cookie first, then from Authorization header
  let token = req.cookies?.token
  
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.userId = decoded.userId
    }
  }

  next()
}
  }

  next();
}
