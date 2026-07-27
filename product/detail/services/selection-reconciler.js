/**
 * Keeps one Cafe24 suffix option selected for each pack group.
 * The suffix index is the pack count: `_1` means 1, `_2` means 2.
 */
export function createSelectionReconciler({ config, adapter, view }) {
  let stopObserving = null;
  const transitions = new Map();

  function getGroup(groupId) {
    return config.groups.find((group) => group.id === groupId);
  }

  function getSelectedOptionValue(group, selectedValues) {
    return [...group.optionValues].reverse().find((value) => selectedValues.has(value)) || null;
  }

  function getGroupState(group, selectedValues) {
    const selectedOptionValue = getSelectedOptionValue(group, selectedValues);
    const selectedIndex = selectedOptionValue ? group.optionValues.indexOf(selectedOptionValue) : -1;
    const transition = transitions.get(group.id);
    const isUpdating = Boolean(transition);
    const transitionOptionValue =
      transition?.toOptionValue || transition?.displayOptionValue || null;
    const transitionIndex = transitionOptionValue
      ? group.optionValues.indexOf(transitionOptionValue)
      : -1;
    const selectedCount = isUpdating ? transitionIndex + 1 : selectedIndex + 1;

    return {
      id: group.id,
      selectedCount,
      limit: group.maxSelectable ?? group.optionValues.length,
      isSelectionDisabled: selectedCount > 0,
      isUpdating
    };
  }

  function advanceTransition(groupId, selectedValues) {
    const transition = transitions.get(groupId);
    if (!transition) return;

    const { removeOptionValues, toOptionValue } = transition;
    const nextOptionValueToRemove = removeOptionValues.find((value) => selectedValues.has(value));

    if (nextOptionValueToRemove) {
      if (!adapter.removeOptionValue(nextOptionValueToRemove)) {
        transitions.delete(groupId);
      }
      return;
    }

    if (toOptionValue && !selectedValues.has(toOptionValue)) {
      if (!adapter.selectOptionValue(toOptionValue)) {
        transitions.delete(groupId);
      }
      return;
    }

    transitions.delete(groupId);
  }

  function sync() {
    const selectedValues = new Set(adapter.getSelectedOptionValues());

    transitions.forEach((_, groupId) => advanceTransition(groupId, selectedValues));

    const refreshedSelectedValues = new Set(adapter.getSelectedOptionValues());
    const states = config.groups.map((group) => getGroupState(group, refreshedSelectedValues));
    view.updateStates(states);
  }

  function transitionToCount(groupId, targetCount) {
    const group = getGroup(groupId);
    if (!group || transitions.has(groupId)) return false;

    const selectedValues = new Set(adapter.getSelectedOptionValues());
    const selectedOptionValues = group.optionValues.filter((value) => selectedValues.has(value));
    const currentOptionValue = getSelectedOptionValue(group, selectedValues);
    const currentCount = currentOptionValue ? group.optionValues.indexOf(currentOptionValue) + 1 : 0;
    const limit = group.maxSelectable ?? group.optionValues.length;

    if (targetCount < 0 || targetCount > limit || targetCount === currentCount) return false;

    const toOptionValue = targetCount === 0 ? null : group.optionValues[targetCount - 1];
    transitions.set(groupId, {
      toOptionValue,
      displayOptionValue: currentOptionValue,
      removeOptionValues:
        targetCount === 0 ? [...selectedOptionValues].reverse() : [currentOptionValue].filter(Boolean)
    });

    sync();
    return true;
  }

  return {
    requestInitialOption(groupId) {
      return transitionToCount(groupId, 1);
    },
    incrementGroup(groupId) {
      const group = getGroup(groupId);
      if (!group) return false;

      const selectedValues = new Set(adapter.getSelectedOptionValues());
      const currentOptionValue = getSelectedOptionValue(group, selectedValues);
      const currentCount = currentOptionValue ? group.optionValues.indexOf(currentOptionValue) + 1 : 0;
      return transitionToCount(groupId, currentCount + 1);
    },
    decrementGroup(groupId) {
      const group = getGroup(groupId);
      if (!group) return false;

      const selectedValues = new Set(adapter.getSelectedOptionValues());
      const currentOptionValue = getSelectedOptionValue(group, selectedValues);
      const currentCount = currentOptionValue ? group.optionValues.indexOf(currentOptionValue) + 1 : 0;
      return transitionToCount(groupId, currentCount - 1);
    },
    clearGroup(groupId) {
      return transitionToCount(groupId, 0);
    },
    start() {
      sync();
      stopObserving = adapter.observeSelectedProducts(sync);
    },
    stop() {
      stopObserving?.();
      stopObserving = null;
      transitions.clear();
    }
  };
}
