import { request, type ApiResponse } from "./client";
import { isApiRecord } from "./data";

const DEFAULT_PAGE_SIZE = 10;

export interface CommentCreator extends Record<string, unknown> {
  _id?: string | null;
  name?: string | null;
  username?: string | null;
  photo?: string | null;
}

export interface Comment extends Record<string, unknown> {
  _id?: string | null;
  content?: string | null;
  image?: string | null;
  commentCreator?: CommentCreator | null;
  post?: string | null;
  parentComment?: unknown;
  likes?: unknown[] | null;
  createdAt?: string | null;
  repliesCount?: number | null;
}

export interface CommentsData {
  comments: Comment[];
}

export interface CommentsPagination {
  currentPage: number;
  limit: number;
  total: number;
  numberOfPages: number;
}

export interface CommentsMetadata {
  pagination?: CommentsPagination | null;
}

export type CommentsResponse = ApiResponse<CommentsData, CommentsMetadata>;

export function parseComments(data: unknown): Comment[] {
  if (
    !isApiRecord(data) ||
    !Array.isArray(data.comments) ||
    !data.comments.every(isApiRecord)
  ) {
    throw new Error("The comments response did not contain a comments list.");
  }
  return data.comments;
}

export function parseCommentsPagination(value: unknown): CommentsPagination | null {
  if (!isApiRecord(value)) return null;
  const { currentPage, limit, total, numberOfPages } = value;
  if (
    typeof currentPage !== "number" ||
    !Number.isInteger(currentPage) ||
    currentPage < 1 ||
    typeof limit !== "number" ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    typeof total !== "number" ||
    !Number.isInteger(total) ||
    total < 0 ||
    typeof numberOfPages !== "number" ||
    !Number.isInteger(numberOfPages) ||
    numberOfPages < 0
  ) {
    return null;
  }
  return { currentPage, limit, total, numberOfPages };
}

export function getComments(
  postId: string,
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
): Promise<CommentsResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return request<CommentsData, CommentsMetadata>(
    `/posts/${encodeURIComponent(postId)}/comments?${query.toString()}`,
  );
}

export function createComment(postId: string, content: string, image?: File) {
  const formData = new FormData();
  formData.append("content", content);
  if (image) formData.append("image", image);

  return request<unknown>(
    `/posts/${encodeURIComponent(postId)}/comments`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export function updateComment(
  postId: string,
  commentId: string,
  content: string,
  image?: File,
) {
  const formData = new FormData();
  formData.append("content", content);
  if (image) formData.append("image", image);

  return request<unknown>(
    `/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PUT",
      body: formData,
    },
  );
}

export function deleteComment(postId: string, commentId: string) {
  return request<unknown>(
    `/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" },
  );
}
