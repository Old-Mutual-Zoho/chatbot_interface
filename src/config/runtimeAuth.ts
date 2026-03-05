let embedToken: string | null = null;

export function setEmbedToken(token: string | null) {
  embedToken = token && token.trim() ? token.trim() : null;
}

export function getEmbedToken() {
  return embedToken;
}

export function initEmbedTokenFromLocation(search: string) {
  const params = new URLSearchParams(search);
  const token = params.get("token");
  setEmbedToken(token);
  return token;
}
