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
        summaryPrices: Object.freeze(['24,700원', '49,400원']),
        discountRate: '(25% 할인)',
        unitPrice: '1개 : 2,470원',
        optionValues: Object.freeze(['10개입_1', '10개입_2']),
        maxSelectable: 2
      }),
      Object.freeze({
        id: 'pack-30',
        label: '30개입',
        displayPrice: '70,500원',
        summaryPrices: Object.freeze(['70,500원', '141,000원']),
        discountRate: '(29% 할인)',
        unitPrice: '1개 : 2,350원',
        badge: Object.freeze({
          label: '가장 많이 사요',
          color: '#ff6433',
          backgroundColor: '#fff0eb'
        }),
        optionValues: Object.freeze(['30개입_1', '30개입_2']),
        maxSelectable: 2
      }),
      Object.freeze({
        id: 'pack-50',
        label: '50개입',
        displayPrice: '111,500원',
        summaryPrices: Object.freeze(['111,500원', '223,000원']),
        discountRate: '(32% 할인)',
        unitPrice: '1개 : 2,230원',
        optionValues: Object.freeze(['50개입_1', '50개입_2']),
        maxSelectable: 2
      }),
      Object.freeze({
        id: 'pack-100',
        label: '100개입',
        displayPrice: '196,000원',
        summaryPrices: Object.freeze(['196,000원', '392,000원']),
        discountRate: '(41% 할인)',
        unitPrice: '1개 : 1,960원',
        badge: Object.freeze({
          label: '최대할인',
          color: '#f04438',
          backgroundColor: '#fff0f0'
        }),
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

export function getCurrentProductNo(search = window.location.search, doc = document) {
  const queryProductNo = new URLSearchParams(search).get('product_no');
  if (queryProductNo) return queryProductNo;

  // Cafe24 SEO URLs do not include `product_no` in the query string. The
  // rendered native option control always exposes the product number instead.
  return doc.querySelector('[option_product_no]')?.getAttribute('option_product_no') || null;
}

export function getOptionPickerConfig(productNo = getCurrentProductNo()) {
  return OPTION_CATALOG[productNo] || OPTION_CATALOG.default;
}
