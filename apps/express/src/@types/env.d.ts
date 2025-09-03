declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_NAME?: string;
    readonly NODE_ENV?: string;
    readonly EXPRESS_PORT?: string;
    readonly SESSION_SECRET?: string;
    readonly SESSION_NAME?: string;
    readonly SESSION_DOMAIN?: string;
    readonly SESSION_PATH?: string;
    readonly SECRET_KEY?: string;
    readonly OPENAI_API_KEY?: string;
  }
}
