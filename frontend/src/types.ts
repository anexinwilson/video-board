// Shared app types: auth forms and axios config helpers.
import type { AxiosRequestConfig } from "axios";

// Form payload used by sign-up; sign-in consumes a subset.
export interface AuthFormData {
  email: string;
  password: string;
  username: string;
}

// Axios config with JWT header attached; callers can spread/extend as needed.
export interface ConfigWithJWT extends AxiosRequestConfig {
  headers: {
    Authorization: string; // e.g., `Bearer <token>`
  };
}
