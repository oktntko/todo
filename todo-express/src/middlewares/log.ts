/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import log4js from "log4js";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

log4js.configure({
  appenders: {
    application: {
      type: "file",
      filename: "logs/application.log",
      maxLogSize: 1024 * 1024 * 10,
      backups: 5,
      compress: true,
      keepFileExt: true,
      encoding: "utf-8",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} (%z) [%-5p] %m (%f{1}:%l)",
      },
    },
    access: {
      type: "file",
      filename: "logs/access.log",
      maxLogSize: 1024 * 1024 * 10,
      backups: 5,
      compress: true,
      keepFileExt: true,
      encoding: "utf-8",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} (%z) [%-5p] %m",
      },
    },
    db: {
      type: "file",
      filename: "logs/db.log",
      maxLogSize: 1024 * 1024 * 10,
      backups: 5,
      compress: true,
      keepFileExt: true,
      encoding: "utf-8",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} (%z) [%-5p] %m",
      },
    },
    stdout: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} (%z) [%[%-5p%]] %[%m%] (%f{1}:%l)",
      },
    },
  },
  categories: {
    default: {
      appenders: import.meta.env.PROD ? ["application"] : ["stdout", "application"],
      level: import.meta.env.PROD ? "info" : "all",
      enableCallStack: true,
    },
    access: {
      appenders: import.meta.env.PROD ? ["access"] : ["stdout", "application", "access"],
      level: import.meta.env.PROD ? "info" : "all",
      enableCallStack: true,
    },
    db: {
      appenders: import.meta.env.PROD ? ["db"] : ["stdout", "application", "db"],
      level: import.meta.env.PROD ? "info" : "all",
      enableCallStack: true,
    },
  },
});

// * app log
const log = log4js.getLogger();

log.debug("Logger initialized.");

export default log;

// * access log
const access = log4js.getLogger("access");
const accessMsg = (
  method: string,
  url: string,
  httpVersion: string,
  ip: string,
  referer?: string,
  ua?: string,
  statusCode?: number
) =>
  `"${method} ${url} HTTP/${httpVersion}" ${
    statusCode == null ? "( )" : statusCode
  } - ${ip} "${referer}" ${ua}`;

// Authorized の後、 controller の前
@Middleware({ type: "before" })
export class BeforeLogHandler implements ExpressMiddlewareInterface {
  use(req: Request, _: Response, next: (err?: any) => any) {
    try {
      const { ip, method, url, httpVersion, headers } = req;
      const { referer, "user-agent": ua } = headers;

      access.info("REQ >", accessMsg(method, url, httpVersion, ip, referer, ua));
    } finally {
      next();
    }
  }
}

@Middleware({ type: "after" })
export class AfterLogHandler implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: (err?: any) => any) {
    try {
      const { ip, method, url, httpVersion, headers } = req;
      const { referer, "user-agent": ua } = headers;
      const { statusCode } = res;

      if (statusCode < 400) {
        access.info("RES <", accessMsg(method, url, httpVersion, ip, referer, ua, statusCode));
      } else if (statusCode < 500) {
        access.warn("RES <", accessMsg(method, url, httpVersion, ip, referer, ua, statusCode));
      } else {
        access.error("RES <", accessMsg(method, url, httpVersion, ip, referer, ua, statusCode));
      }
    } finally {
      next();
    }
  }
}

// * db log
export const db = log4js.getLogger("db");
