import { Name } from "ajv";

export function getAvatarUrl(email: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    email
  )}&background=random`;
}
