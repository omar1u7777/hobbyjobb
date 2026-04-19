// git commit: "feat(s1): add Stripe configuration for payment processing"

const stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PLATFORM_FEE_PERCENT = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT || 8);

if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured - payments will not work');
}

const stripeClient = STRIPE_SECRET_KEY ? stripe(STRIPE_SECRET_KEY) : null;

module.exports = {
  stripe: stripeClient,
  PLATFORM_FEE_PERCENT: STRIPE_PLATFORM_FEE_PERCENT,
  
  /**
   * Calculate platform fee amount (default 8%)
   * @param {number} amount - Amount in öre (Stripe uses smallest currency unit)
   * @returns {number} Platform fee in öre
   */
  calculatePlatformFee(amount) {
    return Math.round(amount * (this.PLATFORM_FEE_PERCENT / 100));
  },
  
  /**
   * Calculate recipient amount after fee
   * @param {number} totalAmount - Total amount in öre
   * @returns {number} Recipient amount in öre
   */
  calculateRecipientAmount(totalAmount) {
    const fee = this.calculatePlatformFee(totalAmount);
    return totalAmount - fee;
  },
  
  /**
   * Convert SEK to öre (Stripe uses smallest currency unit)
   * @param {number} sek - Amount in SEK
   * @returns {number} Amount in öre
   */
  toOre(sek) {
    return Math.round(sek * 100);
  },
  
  /**
   * Convert öre to SEK
   * @param {number} ore - Amount in öre
   * @returns {number} Amount in SEK
   */
  toSEK(ore) {
    return ore / 100;
  },
};
