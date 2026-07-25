export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
