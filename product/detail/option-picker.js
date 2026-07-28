import { getOptionPickerConfig } from './config/catalog.js?v=20260728-18';
import { createCafe24Adapter } from './adapters/cafe24-product.js?v=20260728-28';
import { createOptionPicker } from './core/create-option-picker.js?v=20260728-28';
import { createMobileOptionSheetView } from './ui/mobile-option-sheet-view.js?v=20260728-28';

function toPriceNumber(value) {
  const digits = String(value || '').replace(/[^0-9]/g, '');
  return digits ? Number(digits) : null;
}

function getConfiguredSummaryPrice(config, selectedOptionValues) {
  let total = 0;

  for (const group of config.groups) {
    const selectedIndex = group.optionValues.findIndex((value) => selectedOptionValues.includes(value));
    if (selectedIndex < 0) continue;

    const price = toPriceNumber(group.summaryPrices?.[selectedIndex]);
    if (price === null) return null;
    total += price;
  }

  return total;
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
  const syncSummary = () => {
    const selectedOptionValues = adapter.getSelectedOptionValues();
    const selectedSetCount = selectedOptionValues.length;
    const configuredPrice = getConfiguredSummaryPrice(config, selectedOptionValues);
    const cafe24Price = toPriceNumber(adapter.getTotalPriceText());
    const price = configuredPrice ?? cafe24Price;
    setCount.textContent = `총 ${selectedSetCount}세트`;
    if (price !== null) {
      totalPrice.textContent = `총 ${new Intl.NumberFormat('ko-KR').format(price)}원`;
    }
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
