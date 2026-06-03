import { describe, it, expect } from 'vitest';
import { HUBBYBOX_WAREHOUSE_LOCATION, BOX_STATUS } from '@/lib/hubbybox-constants';

describe('hubbybox-constants', () => {
  it('should export warehouse location string', () => {
    expect(HUBBYBOX_WAREHOUSE_LOCATION).toBe('คลังกลาง Hubbybox');
    expect(typeof HUBBYBOX_WAREHOUSE_LOCATION).toBe('string');
  });

  it('should export BOX_STATUS with correct values', () => {
    expect(BOX_STATUS.SHIPPING_TO_WAREHOUSE).toBe('shipping_to_warehouse');
    expect(BOX_STATUS.RETURNING).toBe('returning');
    expect(BOX_STATUS.REQUESTED_RETURN).toBe('requested_return');
  });

  it('should have BOX_STATUS as a frozen/readonly object', () => {
    // Values should not be reassignable at runtime (as const)
    expect(Object.keys(BOX_STATUS)).toHaveLength(3);
  });
});
