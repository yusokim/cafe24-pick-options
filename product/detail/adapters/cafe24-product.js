/**
 * The only module allowed to know Cafe24 DOM selectors and events.
 *
 * The Basic skin used by the test product renders native options as
 * `.ec-product-button > li` and selected products inside `#totalProducts`.
 * Data attributes remain supported as an explicit override for a skin whose
 * markup differs from that structure.
 */
export function createCafe24Adapter(doc) {
  const nativeOptionArea = doc.querySelector(
    '[data-option-picker-native-options], table.xans-product-option'
  );
  const selectedProductArea = doc.querySelector(
    '[data-option-picker-selected-list], #totalProducts'
  );

  function getNativeOptionItems() {
    if (!nativeOptionArea) return [];

    return Array.from(nativeOptionArea.querySelectorAll('.ec-product-button > li'));
  }

  function getOptionValue(item) {
    return item.querySelector('span')?.textContent.trim() || '';
  }

  function getKnownOptionValues() {
    return getNativeOptionItems().map(getOptionValue).filter(Boolean);
  }

  return {
    isReady() {
      return Boolean(selectedProductArea && getNativeOptionItems().length);
    },
    selectOptionValue(optionValue) {
      const nativeItem = getNativeOptionItems().find(
        (item) => getOptionValue(item) === optionValue
      );
      const nativeLink = nativeItem?.querySelector('a');

      if (!nativeLink || nativeItem.classList.contains('ec-product-soldout')) {
        console.warn('[option-picker] Native option is unavailable.', optionValue);
        return false;
      }

      nativeLink.click();
      return true;
    },
    observeSelectedProducts(callback) {
      const observer = new MutationObserver(callback);
      observer.observe(selectedProductArea, { childList: true, subtree: true, characterData: true });
      return () => observer.disconnect();
    },
    getSelectedOptionValues() {
      if (!selectedProductArea) return [];

      const selectedProductText = selectedProductArea.textContent;

      return getKnownOptionValues().filter((optionValue) =>
        selectedProductText.includes(optionValue)
      );
    }
  };
}
