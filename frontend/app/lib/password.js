export const MAC_ADDRESS_PATTERN = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

export function validateMacAddress(macAddress) {
  return MAC_ADDRESS_PATTERN.test(macAddress);
}

export function formatMacAddress(value) {
  const cleaned = value.replace(/[^0-9A-Fa-f]/g, "");
  const formatted = cleaned.match(/.{1,2}/g)?.join(":") ?? cleaned;
  return formatted.slice(0, 17);
}
