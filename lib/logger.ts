type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    const parts = [`[${timestamp}]`, level.toUpperCase(), message];

    if (context && Object.keys(context).length > 0) {
      parts.push(JSON.stringify(context));
    }

    if (error) {
      parts.push(`\n${error.stack || error.message}`);
    }

    return parts.join(" ");
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formatted = this.formatMessage(entry);

    switch (level) {
      case "debug":
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      case "info":
        console.log(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }

    // In production, you might want to send logs to a service
    // if (process.env.NODE_ENV === "production" && level === "error") {
    //   // Send to error tracking service (Sentry, etc.)
    // }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log("error", message, context, error);
  }
}

export const logger = new Logger();
