import type { AxiosRequestConfig } from "axios";

export interface AuthFormData {
  email: string;
  password: string;
  username: string;
}

export interface ConfigWithJWT extends AxiosRequestConfig {
  headers: {
    Authorization: string
  }
}
