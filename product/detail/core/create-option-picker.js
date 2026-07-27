import { createOptionPickerView } from '../ui/option-picker-view.js?v=20260727-4';
import { createSelectionReconciler } from '../services/selection-reconciler.js';

/**
 * Coordinates rendering and synchronisation. It contains no Cafe24 selector
 * knowledge and no product-specific content.
 */
export function createOptionPicker({ root, config, adapter }) {
  const view = createOptionPickerView({ root, groups: config.groups });
  const reconciler = createSelectionReconciler({ config, adapter, view });

  function onGroupRequest(groupId) {
    reconciler.requestNextOption(groupId);
  }

  return {
    mount() {
      if (!adapter.isReady()) {
        console.warn('[option-picker] Native Cafe24 option or total area was not found.');
        return;
      }

      view.render(onGroupRequest);
      reconciler.start();
    },
    destroy() {
      reconciler.stop();
      view.destroy();
    }
  };
}
