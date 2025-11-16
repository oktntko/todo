export const message = {
  error: {
    BAD_REQUEST: `Invalid request. Please check your input.`, // 400
    UNAUTHORIZED: `You need to sign in to continue.`, // 401
    FORBIDDEN: `You don't have permission to access this.`, // 403
    NOT_FOUND: `The requested resource was not found.`, // 404
    METHOD_NOT_ALLOWED: `Method Not Allowed`, // 405
    TIMEOUT: `Request Timeout`, // 408
    CONFLICT: `A conflict occurred. Please try again.`, // 409
    CONFLICT_DUPLICATE_WHEN_CREATE: `This value is already in use. Please use a different one.`, // 409
    CONFLICT_DUPLICATE_WHEN_UPDATE: `This value is already in use by another record.`, // 409
    CONFLICT_PREVIOUS_UPDATED:
      'The item has been changed by another update. Please reload the latest data and try again.', // 409
    INTERNAL_SERVER_ERROR: `An internal server error occurred.`, // 500
    BAD_GATEWAY: `The server is temporarily unavailable. Please try again later.`, // 502
    SERVICE_UNAVAILABLE: `The service is currently unavailable. Please try again later.`, // 503
    GATEWAY_TIMEOUT: `The request took too long to respond. Please try again.`, // 504
  },
};
