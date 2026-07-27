/**
 * Product-specific presentation data and Cafe24 option-value mappings.
 *
 * Add each product only after checking the exact option labels output by the
 * storefront. This file must never contain stock, final-price, cart, checkout,
 * account, or other non-public business data.
 */
export const OPTION_CATALOG = Object.freeze({
  default: Object.freeze({
    enabled: false,
    groups: Object.freeze([])
  })
});

export function getCurrentProductNo(search = window.location.search) {
  return new URLSearchParams(search).get('product_no');
}

export function getOptionPickerConfig(productNo = getCurrentProductNo()) {
  return OPTION_CATALOG[productNo] || OPTION_CATALOG.default;
}
