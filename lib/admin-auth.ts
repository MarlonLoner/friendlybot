import type { NextRequest } from "next/server";

export function getAdminAccessCode() {
  return process.env.ADMIN_ACCESS_CODE || "friendlybot-admin";
}

export function isValidAdminCode(code: string | null | undefined) {
  return Boolean(code && code === getAdminAccessCode());
}

export function isAuthorizedAdminRequest(request: NextRequest) {
  return isValidAdminCode(request.headers.get("x-admin-access-code"));
}
