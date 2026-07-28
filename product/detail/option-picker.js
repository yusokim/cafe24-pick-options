import { getOptionPickerConfig } from './config/catalog.js?v=20260728-18';
import { createCafe24Adapter } from './adapters/cafe24-product.js?v=20260728-18';
import { createOptionPicker } from './core/create-option-picker.js?v=20260728-23';
import { createMobileOptionSheetView } from './ui/mobile-option-sheet-view.js?v=20260728-24';

function bindMobilePurchaseTriggers(doc, picker, adapter) {
  const purchaseAction = Array.from(doc.querySelectorAll('.xans-product-action')).find((element) => (
    element.querySelector("a[onclick*='product_submit(1']")
  ));

  if (!purchaseAction) return;

  purchaseAction.dataset.optionPickerFixedAction = 'true';
  const summary = doc.createElement('div');
  const setCount = doc.createElement('strong');
  const totalPrice = doc.createElement('strong');
  summary.className = 'option-picker-mobile-summary';
  setCount.className = 'option-picker-mobile-summary__count';
  totalPrice.className = 'option-picker-mobile-summary__price';
  summary.append(setCount, totalPrice);
  purchaseAction.prepend(summary);

  let summaryFrame;
  const syncSummary = () => {
    const selectedSetCount = adapter.getSelectedOptionValues().length;
    const priceText = doc.querySelector('#totalPrice .total em')?.textContent || '0';
    const price = Number(priceText.replace(/[^0-9]/g, ''));
    setCount.textContent = `총 ${selectedSetCount}세트`;
    totalPrice.textContent = `총 ${new Intl.NumberFormat('ko-KR').format(price || 0)}원`;
  };
  const scheduleSummarySync = () => {
    cancelAnimationFrame(summaryFrame);
    summaryFrame = requestAnimationFrame(syncSummary);
  };
  syncSummary();
  const totalArea = doc.querySelector('#totalPrice');
  const selectedProducts = doc.querySelector('#totalProducts');
  const summaryObserver = new MutationObserver(scheduleSummarySync);
  [totalArea, selectedProducts].filter(Boolean).forEach((element) => {
    summaryObserver.observe(element, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  });
  const controls = purchaseAction.querySelectorAll(
    "a[onclick*='product_submit(1'], a[onclick*='product_submit(2']"
  );
  const handleRequest = (event) => {
    if (picker.view().hasSelectedOptions()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    picker.view().open();
  };
  controls.forEach((control) => control.addEventListener('click', handleRequest, true));
}

function bootstrap() {
  const root = document.querySelector('[data-option-picker-root]');
  const config = getOptionPickerConfig();

  if (!root || !config.enabled || root.dataset.optionPickerInitialized === 'true') {
    return;
  }

  const adapter = createCafe24Adapter(document);
  const isMobileSheet = window.matchMedia('(max-width: 767px)').matches;
  const picker = createOptionPicker({
    root,
    config,
    adapter,
    createView: isMobileSheet ? createMobileOptionSheetView : undefined
  });

  if (!picker.mount()) return;
  root.dataset.optionPickerInitialized = 'true';
  if (isMobileSheet) bindMobilePurchaseTriggers(document, picker, adapter);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
