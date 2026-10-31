import { jsonBody, request } from "./client";

export interface SignupRequest {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  rePassword: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export function signup(values: SignupRequest) {
  return request<unknown>("/users/signup", {
    method: "POST",
    body: jsonBody(values),
  });
}

export function signin(values: SigninRequest) {
  return request<unknown>("/users/signin", {
    method: "POST",
    body: jsonBody(values),
  });
}
