declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      CRON_MONITOR_URL: string;
      DATABASE_URL: string;
      ADMIN_KEY: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_BUCKET: string;
      AWS_SECRET_ACCESS_KEY: string;
    }
  }
}

export {}
