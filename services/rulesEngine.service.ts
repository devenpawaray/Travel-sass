export interface SystemConfig {
  min_margin: number;
  commission_rules: any;
  risk_rules: {
    high_risk_partners: string[];
  };
}

export const rulesEngineService = {
  /**
   * Evaluates if a quote is valid based on margin and partner risk.
   */
  evaluateQuote(inventory: any, partner: any, config: SystemConfig) {
    const margin = ((inventory.base_price * 1.12) - inventory.base_price);

    if (margin < config.min_margin) {
      return { allowed: false, reason: "Margin below threshold" };
    }

    if (partner.risk_level === 'high' || config.risk_rules.high_risk_partners.includes(partner.id)) {
      return { allowed: false, reason: "High risk partner requires admin override", manual_approval_required: true };
    }

    return { allowed: true };
  }
};
