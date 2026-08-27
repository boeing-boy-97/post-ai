export interface SanitizedError {
  message: string;
  code: string;
  statusCode: number;
  action?: 'RECONNECT_ACCOUNT' | 'CHECK_MEDIA' | 'RETRY_LATER' | 'SIGN_IN';
}

export function sanitizeError(err: any): SanitizedError {
  const rawMsg = String(err?.message || err || '');
  const lower = rawMsg.toLowerCase();

  // Authentication errors
  if (lower.includes('token') && (lower.includes('expired') || lower.includes('invalid') || lower.includes('jwt'))) {
    return {
      message: 'Your session has expired. Please sign in again.',
      code: 'AUTH_SESSION_EXPIRED',
      statusCode: 401,
      action: 'SIGN_IN',
    };
  }

  // Social OAuth Token / Permission errors
  if (lower.includes('oauth') || lower.includes('meta') || lower.includes('instagram')) {
    if (lower.includes('expired') || lower.includes('revoked') || lower.includes('190')) {
      return {
        message: 'Instagram authorization has expired. Please reconnect in the Social Accounts tab.',
        code: 'INSTAGRAM_AUTH_EXPIRED',
        statusCode: 400,
        action: 'RECONNECT_ACCOUNT',
      };
    }
  }

  if (lower.includes('linkedin')) {
    if (lower.includes('permission') || lower.includes('unauthorized') || lower.includes('403')) {
      return {
        message: 'LinkedIn does not have permission to publish to this target. Please reconnect with required page roles.',
        code: 'LINKEDIN_PERMISSION_DENIED',
        statusCode: 400,
        action: 'RECONNECT_ACCOUNT',
      };
    }
    if (lower.includes('token') || lower.includes('expired')) {
      return {
        message: 'LinkedIn connection needs attention. Please reconnect your account.',
        code: 'LINKEDIN_AUTH_EXPIRED',
        statusCode: 400,
        action: 'RECONNECT_ACCOUNT',
      };
    }
  }

  // Database Duplicate / Constraint errors
  if (lower.includes('unique constraint') || lower.includes('p2002') || lower.includes('already exists')) {
    return {
      message: 'An item with these details is already registered.',
      code: 'RESOURCE_DUPLICATE',
      statusCode: 409,
    };
  }

  // Media upload errors
  if (lower.includes('upload') || lower.includes('file') || lower.includes('media')) {
    return {
      message: 'We could not process this media asset. Please verify the file format and try again.',
      code: 'MEDIA_PROCESSING_FAILED',
      statusCode: 400,
      action: 'CHECK_MEDIA',
    };
  }

  // Network / Provider connectivity
  if (lower.includes('econnrefused') || lower.includes('etimedout') || lower.includes('timeout') || lower.includes('network')) {
    return {
      message: 'We could not complete the request due to a temporary network issue. Please try again.',
      code: 'NETWORK_TIMEOUT',
      statusCode: 503,
      action: 'RETRY_LATER',
    };
  }

  // Generic safe operational error
  return {
    message: err.isOperational ? err.message : 'We could not complete that action right now. Please try again.',
    code: err.code || 'OPERATIONAL_ERROR',
    statusCode: err.statusCode || 400,
  };
}
