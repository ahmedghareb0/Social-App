import { request } from "./client";
import { isApiRecord } from "./data";

export interface ProfileUser extends Record<string, unknown> {
  _id?: string;
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  photo?: string;
  cover?: string;
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
}

export function extractProfileUser(data: unknown): ProfileUser {
  if (!isApiRecord(data) || !isApiRecord(data.user)) {
    throw new Error("The profile response did not include a user object.");
  }
  return data.user;
}

export function getProfile() {
  return request<{ user: ProfileUser }>("/users/profile-data");
}

export function changePassword(password: string, newPassword: string) {
  return request<unknown>("/users/change-password", {
    method: "PATCH",
    body: JSON.stringify({ password, newPassword }),
  });
}
