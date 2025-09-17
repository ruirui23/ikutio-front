export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  profileId?: string;  // バックエンドから返されるprofile_id
  createdAt?: string;
  updatedAt?: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}