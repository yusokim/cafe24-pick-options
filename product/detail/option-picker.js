import { getOptionPickerConfig } from './config/catalog.js?v=20260728-18';
import { createCafe24Adapter } from './adapters/cafe24-product.js?v=20260728-18';
import { createOptionPicker } from './core/create-option-picker.js?v=20260728-23';
import { createMobileOptionSheetView } from './ui/mobile-option-sheet-view.js?v=20260728-23';

function bindMobilePurchaseTriggers(doc, picker) {
  const purchaseAction = Array.from(doc.querySelectorAll('.xans-product-action')).find((element) => (
    element.querySelector("a[onclick*='product_submit(1']")
  ));

  if (!purchaseAction) return;

  purchaseAction.dataset.optionPickerFixedAction = 'true';
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
  if (isMobileSheet) bindMobilePurchaseTriggers(document, picker);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
