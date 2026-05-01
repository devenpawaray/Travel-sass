import { rulesEngineService, SystemConfig } from './rulesEngine.service';

export const pricingService = {
  /**
   * Calculates the final quote price.
   */
  calculatePrice(inventory: any, config: SystemConfig) {
    // Basic margin logic
    const marginPercent = 0.12; // 12%
    const price = inventory.base_price * (1 + marginPercent);
    const profit_margin = price - inventory.base_price;

    return {
      price,
      profit_margin
    };
  }
};
