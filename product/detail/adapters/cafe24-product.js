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
  const totalPriceArea = doc.querySelector('[data-option-picker-total-price], #totalPrice');

  function getNativeOptionItems() {
    if (!nativeOptionArea) return [];

    return Array.from(nativeOptionArea.querySelectorAll('.ec-product-button > li'));
  }

  function getOptionValue(item) {
    return item.querySelector('span')?.textContent.trim() || '';
  }

  function rowContainsOptionValue(row, optionValue) {
    const escapedOptionValue = optionValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const optionValuePattern = new RegExp(
      `(^|[\\s\\-:])${escapedOptionValue}(?=$|[\\s(,+])`
    );
    return optionValuePattern.test(row.textContent.replace(/\s+/g, ' ').trim());
  }

  function getKnownOptionValues() {
    return getNativeOptionItems().map(getOptionValue).filter(Boolean);
  }

  function findSelectedProductRow(optionValue) {
    if (!selectedProductArea) return null;

    return Array.from(selectedProductArea.querySelectorAll('tr, [id^="option_box"]')).find((row) =>
      rowContainsOptionValue(row, optionValue)
    );
  }

  function getPurchaseAction() {
    return Array.from(doc.querySelectorAll('.xans-product-action')).find((element) => (
      element.querySelector("a[onclick*='product_submit(1']")
    )) || null;
  }

  function getTotalPriceText() {
    if (!totalPriceArea) return null;

    const totalValue = totalPriceArea.querySelector(
      '[data-option-picker-total-value], .total em, .total strong, .total'
    )?.textContent || '';
    return /\d/.test(totalValue) ? totalValue : null;
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
    removeOptionValue(optionValue) {
      const selectedRow = findSelectedProductRow(optionValue);
      const deleteControl = selectedRow?.querySelector(
        '.delete, .option_box_del'
      );
      const deleteButton = deleteControl?.closest('a, button') || deleteControl;

      if (!deleteButton) {
        console.warn('[option-picker] Selected Cafe24 option is unavailable.', optionValue);
        return false;
      }

      deleteButton.click();
      return true;
    },
    hideSelectedProducts() {
      selectedProductArea?.classList.add('option-picker__native-selected-products');
    },
    observeSelectedProducts(callback) {
      if (!selectedProductArea) return () => {};

      const observer = new MutationObserver(callback);
      observer.observe(selectedProductArea, { childList: true, subtree: true, characterData: true });
      return () => observer.disconnect();
    },
    getSelectedOptionValues() {
      if (!selectedProductArea) return [];

      const selectedProductRows = selectedProductArea.querySelectorAll('tr, [id^="option_box"]');

      return getKnownOptionValues().filter((optionValue) =>
        Array.from(selectedProductRows).some((row) => rowContainsOptionValue(row, optionValue))
      );
    },
    getPurchaseAction,
    getTotalPriceText,
    observePurchaseSummary(callback) {
      const observer = new MutationObserver(callback);
      [selectedProductArea, totalPriceArea].filter(Boolean).forEach((element) => {
        observer.observe(element, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
      });
      return () => observer.disconnect();
    }
  };
}
