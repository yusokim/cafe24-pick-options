import { getOptionPickerConfig } from './config/catalog.js';
import { createCafe24Adapter } from './adapters/cafe24-product.js';
import { createOptionPicker } from './core/create-option-picker.js';
import { createMobileOptionSheetView } from './ui/mobile-option-sheet-view.js';

function toPriceNumber(value) {
  const priceText = String(value || '').split('(')[0];
  const digits = priceText.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
}

function getSelectedSetCount(config, selectedOptionValues) {
  return config.groups.reduce((total, group) => {
    const selectedIndex = group.optionValues.findIndex((value) => selectedOptionValues.includes(value));
    return total + (selectedIndex < 0 ? 0 : selectedIndex + 1);
  }, 0);
}

function bindMobilePurchaseTriggers(doc, picker, adapter, config) {
  const purchaseAction = adapter.getPurchaseAction();

  if (!purchaseAction) {
    console.warn('[option-picker] Mobile purchase action was not found. Showing the option trigger.');
    picker.view().setPurchaseActionAvailable(false);
    return null;
  }

  picker.view().setPurchaseActionAvailable(true);
  purchaseAction.dataset.optionPickerFixedAction = 'true';
  const summary = doc.createElement('div');
  const setCount = doc.createElement('strong');
  const totalPrice = doc.createElement('strong');
  summary.className = 'option-picker-mobile-summary';
  setCount.className = 'option-picker-mobile-summary__count';
  totalPrice.className = 'option-picker-mobile-summary__price';
  totalPrice.textContent = '총 0원';
  summary.append(setCount, totalPrice);
  purchaseAction.prepend(summary);

  let summaryFrame;
  let lastTotalPrice = 0;
  const syncSummary = () => {
    const selectedOptionValues = adapter.getSelectedOptionValues();
    const selectedSetCount = getSelectedSetCount(config, selectedOptionValues);
    const cafe24Price = toPriceNumber(adapter.getTotalPriceText());
    if (cafe24Price !== null) lastTotalPrice = cafe24Price;
    setCount.textContent = `총 ${selectedSetCount}세트`;
    totalPrice.textContent = `총 ${new Intl.NumberFormat('ko-KR').format(lastTotalPrice)}원`;
  };
  const scheduleSummarySync = () => {
    cancelAnimationFrame(summaryFrame);
    summaryFrame = requestAnimationFrame(syncSummary);
  };
  syncSummary();
  const stopObservingSummary = adapter.observePurchaseSummary(scheduleSummarySync);
  const controls = purchaseAction.querySelectorAll(
    "a[onclick*='product_submit(1'], a[onclick*='product_submit(2']"
  );
  const handleRequest = (event) => {
    if (picker.view().isUpdating()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (adapter.getSelectedOptionValues().length > 0) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    picker.view().open(event.currentTarget);
  };
  controls.forEach((control) => control.addEventListener('click', handleRequest, true));
  return () => {
    cancelAnimationFrame(summaryFrame);
    stopObservingSummary?.();
    controls.forEach((control) => control.removeEventListener('click', handleRequest, true));
    summary.remove();
    delete purchaseAction.dataset.optionPickerFixedAction;
  };
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
  if (isMobileSheet) picker.addCleanup(bindMobilePurchaseTriggers(document, picker, adapter, config));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
