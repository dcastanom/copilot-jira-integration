type LogContext = Record<string, string | number | boolean | undefined | null>;

export const logger = {
  warn(message: string, context: LogContext = {}): void {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...context,
    }));
  },

  info(message: string, context: LogContext = {}): void {
    console.info(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...context,
    }));
  },
};
