/**
 * Converts Cafe24's selected option values into card counts and availability.
 * It owns no DOM and never calculates final prices.
 */
export function createSelectionReconciler({ config, adapter, view }) {
  let stopObserving = null;
  const pendingOptionValues = new Set();

  function getGroup(groupId) {
    return config.groups.find((group) => group.id === groupId);
  }

  function sync() {
    const selectedValues = new Set([
      ...adapter.getSelectedOptionValues(),
      ...pendingOptionValues
    ]);
    const states = config.groups.map((group) => {
      const selectedCount = group.optionValues.filter((value) => selectedValues.has(value)).length;

      return {
        id: group.id,
        selectedCount,
        limit: group.maxSelectable ?? group.optionValues.length,
        isDisabled: selectedCount >= (group.maxSelectable ?? group.optionValues.length)
      };
    });

    view.updateStates(states);
  }

  return {
    requestNextOption(groupId) {
      const group = getGroup(groupId);
      if (!group) return false;

      const selectedValues = new Set([
        ...adapter.getSelectedOptionValues(),
        ...pendingOptionValues
      ]);
      const limit = group.maxSelectable ?? group.optionValues.length;
      const selectedCount = group.optionValues.filter((value) => selectedValues.has(value)).length;

      if (selectedCount >= limit) return false;

      const nextOptionValue = group.optionValues.find((value) => !selectedValues.has(value));
      if (!nextOptionValue) return false;

      pendingOptionValues.add(nextOptionValue);
      sync();

      if (!adapter.selectOptionValue(nextOptionValue)) {
        pendingOptionValues.delete(nextOptionValue);
        sync();
        return false;
      }

      window.setTimeout(() => {
        pendingOptionValues.delete(nextOptionValue);
        sync();
      }, 1000);

      return true;
    },
    start() {
      sync();
      stopObserving = adapter.observeSelectedProducts(sync);
    },
    stop() {
      stopObserving?.();
      stopObserving = null;
      pendingOptionValues.clear();
    }
  };
}
