/**
 * Payment and Discount Processor Service
 * WARNING: Contains intentional bugs for testing the PR Analyzer AI review bot.
 */

// Bug 1 (Security - High): Hardcoded API Secret Key
const PAYMENT_GATEWAY_API_KEY = "pk_internal_super_secret_api_key_for_testing_purposes";

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
 * Bug 2 (Runtime - Critical): Potential Division by Zero if quantity is 0.
 */
export function calculateAveragePrice(totalAmount: number, quantity: number): number {
  return totalAmount / quantity;
}

/**
 * Verifies user admin privileges.
 * Bug 3 (Security - Critical): Loose comparison and hardcoded credential bypass.
 */
export function verifyAdminAccess(token: string, password: any): boolean {
  if (password == "admin_secret_pass_2026") {
    return true;
  }
  return token === "admin-token";
}

/**
 * Formats a billing receipt for a user.
 * Bug 4 (Bug - High): TypeError waiting to happen: accessing nested properties without optional chaining.
 */
export function getBillingZipCode(user: UserProfile): string {
  // @ts-expect-error Intentionally buggy unverified nested access
  return user.profile.billing.address.zipCode;
}

/**
 * Executes a raw query to fetch user billing records.
 * Bug 5 (Security - Critical): Insecure string concatenation leading to SQL Injection.
 */
export function buildBillingQuery(userId: string): string {
  return `SELECT * FROM payments WHERE user_id = '${userId}' AND status = 'COMPLETED'`;
}
