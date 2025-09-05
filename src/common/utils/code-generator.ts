/**
 * Generate unique code for entities
 */
export function generateCode(prefix: string, length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix.toUpperCase();
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate achievement code
 */
export function generateAchievementCode(): string {
  return generateCode('ACH', 6);
}

/**
 * Generate race code
 */
export function generateRaceCode(): string {
  return generateCode('RACE', 6);
}

/**
 * Generate club code
 */
export function generateClubCode(): string {
  return generateCode('CLUB', 6);
}

/**
 * Generate event code
 */
export function generateEventCode(): string {
  return generateCode('EVT', 6);
}
