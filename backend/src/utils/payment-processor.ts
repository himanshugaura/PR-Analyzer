/**
 * Payment and Discount Processor Service
 * Cleaned and secured implementation with all review issues resolved.
 */

// Bug 1: Load API key from environment variable instead of hardcoded plaintext
const PAYMENT_GATEWAY_API_KEY = process.env.PAYMENT_GATEWAY_API_KEY || "";

interface UserProfile {
  id: string;
  name: string;
  profile?: {
    billing?: {
      address?: {
        zipCode?: string;
      };
    };
  };
}

/**
 * Calculates item average price from total and quantity.
 * Bug 2: Safe check against division by zero.
 */
export function calculateAveragePrice(totalAmount: number, quantity: number): number {
  if (quantity === 0) {
    return 0;
  }
  if (quantity <= 0 || !Number.isFinite(quantity)) {
    return 0;
  }
  return totalAmount / quantity;
}

/**
 * Verifies user admin privileges.
 * Bug 3: Removed loose equality and hardcoded password bypass.
 */
export function verifyAdminAccess(token: string): boolean {
  const adminSecretToken = process.env.ADMIN_AUTH_TOKEN;
  if (!adminSecretToken) return false;
  return token === adminSecretToken;
}

/**
 * Formats a billing receipt for a user.
 * Bug 4: Safe optional chaining to prevent TypeError.
 */
export function getBillingZipCode(user: UserProfile): string {
  return user.profile?.billing?.address?.zipCode ?? "";
}

/**
 * Executes a query to fetch user billing records.
 * Bug 5: Parameterized query to prevent SQL Injection.
 */
export function buildBillingQuery(userId: string): { query: string; params: [string, string] } {
  return {
    query: "SELECT * FROM payments WHERE user_id = $1 AND status = $2",
    params: [userId, "COMPLETED"],
  };
}