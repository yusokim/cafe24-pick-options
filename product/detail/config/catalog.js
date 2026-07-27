/**
 * Product-specific presentation data and Cafe24 option-value mappings.
 *
 * Add each product only after checking the exact option labels output by the
 * storefront. This file must never contain stock, final-price, cart, checkout,
 * account, or other non-public business data.
 */
export const OPTION_CATALOG = Object.freeze({
  11: Object.freeze({
    enabled: true,
    groups: Object.freeze([
      Object.freeze({
        id: 'pack-10',
        label: '10개입',
        displayPrice: '24,700원',
        optionValues: Object.freeze(['10개입_1', '10개입_2']),
        maxSelectable: 2
      }),
      Object.freeze({
        id: 'pack-30',
        label: '30개입',
        badge: '가장 많이 사요',
        displayPrice: '70,500원',
        optionValues: Object.freeze(['30개입_1', '30개입_2']),
        maxSelectable: 2
      }),
      Object.freeze({
        id: 'pack-50',
        label: '50개입',
        displayPrice: '111,500원',
        optionValues: Object.freeze(['50개입_1', '50개입_2']),
        maxSelectable: 2
      }),
      Object.freeze({
        id: 'pack-100',
        label: '100개입',
        badge: '최대할인',
        displayPrice: '196,000원',
        optionValues: Object.freeze(['100개입_1', '100개입_2']),
        maxSelectable: 2
      })
    ])
  }),
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
