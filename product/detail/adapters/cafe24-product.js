/**
 * The only module allowed to know Cafe24 DOM selectors and events.
 *
 * Mark the native option table with `data-option-picker-native-options` and
 * the `{$total.total_id}` container with `data-option-picker-selected-list`
 * as described in INTEGRATION.md. The exact text-button click implementation
 * is intentionally deferred until it is inspected in the live Basic skin.
 */
export function createCafe24Adapter(doc) {
  const nativeOptionArea = doc.querySelector('[data-option-picker-native-options]');
  const selectedProductArea = doc.querySelector('[data-option-picker-selected-list]');

  return {
    isReady() {
      return Boolean(nativeOptionArea && selectedProductArea);
    },
    selectOptionValue(optionValue) {
      // TODO: Find the native Cafe24 text-button for `optionValue`, then invoke
      // its normal click path. Do not synthesize selected-product rows here.
      console.warn('[option-picker] Native option selection is not connected yet.', optionValue);
    },
    observeSelectedProducts(callback) {
      const observer = new MutationObserver(callback);
      observer.observe(selectedProductArea, { childList: true, subtree: true, characterData: true });
      return () => observer.disconnect();
    },
    getSelectedOptionValues() {
      // TODO: Extract selected option labels from Cafe24's generated rows.
      // This must remain the source of truth for card state.
      return [];
    }
  };
}
