/** Single source of truth for warehouse location label (matches DB + UI). */
export const HUBBYBOX_WAREHOUSE_LOCATION = 'คลังกลาง Hubbybox' as const;

export const BOX_STATUS = {
  SHIPPING_TO_WAREHOUSE: 'shipping_to_warehouse',
  RETURNING: 'returning',
  REQUESTED_RETURN: 'requested_return',
} as const;
