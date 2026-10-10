/**
 * Safe Address Parsing Utility
 * Prevents JSON.parse SyntaxErrors when shipping_address is plain text, malformed, or null.
 */
export function parseAddress(shippingAddress) {
  if (!shippingAddress) return {};
  if (typeof shippingAddress === 'object') return shippingAddress;
  try {
    const parsed = JSON.parse(shippingAddress);
    return typeof parsed === 'object' && parsed !== null ? parsed : { address_line1: String(shippingAddress) };
  } catch {
    return { address_line1: String(shippingAddress) };
  }
}

export function formatAddress(address) {
  const addr = parseAddress(address);
  const parts = [addr.address_line1, addr.address_line2, addr.city, addr.state].filter(Boolean);
  const pincode = addr.pincode ? ` - ${addr.pincode}` : '';
  return parts.join(', ') + pincode;
}
