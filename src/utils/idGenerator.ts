// Generates a unique ID for nodes and edges using the Web Crypto API
export function generateId(): string {
  return crypto.randomUUID()
}
