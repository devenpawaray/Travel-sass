import { BookingState, ALLOWED_TRANSITIONS } from '@/constants/states';

export const stateMachineService = {
  /**
   * Validates if a transition from current state to next state is allowed.
   */
  validateTransition(current: BookingState, next: BookingState): boolean {
    const transitions = ALLOWED_TRANSITIONS[current];
    return transitions ? transitions.includes(next) : false;
  },

  /**
   * Enforces the transition, throwing an error if invalid.
   */
  enforceTransition(current: BookingState, next: BookingState) {
    if (!this.validateTransition(current, next)) {
      throw new Error(`Invalid state transition: ${current} -> ${next}`);
    }
    return true;
  }
};
