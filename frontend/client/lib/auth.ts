export type AdminUser = {
  email: string;
  role: "admin" | "superadmin";
};

const TOKEN_KEY = "gele_token";
const USER_KEY = "gele_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: AdminUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): AdminUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const user = getUser();
  return !!user && (user.role === "admin" || user.role === "superadmin");
}

export function isSuperadmin(): boolean {
  const user = getUser();
  return !!user && user.role === "superadmin";
}