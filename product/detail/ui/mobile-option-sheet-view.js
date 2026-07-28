import { clearElement, createElement } from '../utils/dom.js';

function createIcon(pathData) {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  icon.append(path);
  return icon;
}

function createBadge(badge) {
  const element = createElement('span', {
    className: 'option-picker-sheet__badge',
    text: typeof badge === 'string' ? badge : badge?.label || ''
  });
  if (badge && typeof badge === 'object') {
    if (badge.color) element.style.setProperty('--option-picker-sheet-badge-color', badge.color);
    if (badge.backgroundColor) element.style.setProperty('--option-picker-sheet-badge-background', badge.backgroundColor);
  }
  return element;
}

export function createMobileOptionSheetView({ root, groups }) {
  let cards = new Map();
  let selections = new Map();
  let layer;
  let trigger;
  let doneButton;
  let selectedTotal = 0;

  function setOpen(isOpen) {
    if (!layer) return;
    layer.hidden = !isOpen;
    trigger.setAttribute('aria-expanded', String(isOpen));
    document.documentElement.classList.toggle('option-picker-sheet-open', isOpen);
  }

  return {
    render({ onGroupRequest, onGroupIncrement, onGroupDecrement, onGroupRemove }) {
      clearElement(root);
      cards = new Map();
      selections = new Map();

      trigger = createElement('button', {
        className: 'option-picker-sheet__trigger',
        type: 'button',
        'aria-expanded': 'false',
        'aria-controls': 'option-picker-sheet'
      });
      trigger.append(
        createElement('strong', { className: 'option-picker-sheet__trigger-label', text: '옵션 선택 (필수)' }),
        createIcon('M6 14L12 8L18 14')
      );
      trigger.addEventListener('click', () => setOpen(true));

      layer = createElement('div', {
        className: 'option-picker-sheet__layer',
        id: 'option-picker-sheet',
        hidden: ''
      });
      const backdrop = createElement('button', {
        className: 'option-picker-sheet__backdrop',
        type: 'button',
        'aria-label': '옵션 선택 닫기'
      });
      backdrop.addEventListener('click', () => setOpen(false));
      const sheet = createElement('section', {
        className: 'option-picker-sheet__panel',
        role: 'dialog',
        'aria-label': '옵션 선택',
        'aria-modal': 'true'
      });
      const header = createElement('div', { className: 'option-picker-sheet__header' });
      const close = createElement('button', {
        className: 'option-picker-sheet__close', type: 'button', 'aria-label': '옵션 선택 닫기'
      });
      close.append(createIcon('M5 5L19 19M19 5L5 19'));
      close.addEventListener('click', () => setOpen(false));
      header.append(
        createElement('span', { className: 'option-picker-sheet__handle', 'aria-hidden': 'true' }),
        createElement('strong', { className: 'option-picker-sheet__title', text: '옵션 선택 (필수)' }),
        close
      );

      const list = createElement('div', { className: 'option-picker-sheet__list' });
      groups.forEach((group) => {
        const card = createElement('button', {
          className: 'option-picker-sheet__card', type: 'button',
          dataset: { optionPickerGroup: group.id }, 'aria-pressed': 'false'
        });
        const choice = createElement('span', { className: 'option-picker-sheet__choice' });
        choice.append(
          createElement('span', { className: 'option-picker-sheet__radio', 'aria-hidden': 'true' }),
          createElement('strong', { className: 'option-picker-sheet__label', text: group.label })
        );
        const priceLine = createElement('span', { className: 'option-picker-sheet__price-line' });
        priceLine.append(
          createElement('strong', { className: 'option-picker-sheet__price-value', text: group.displayPrice || '' }),
          createElement('span', { className: 'option-picker-sheet__discount-rate', text: group.discountRate || '' }),
          createBadge(group.badge)
        );
        const price = createElement('span', { className: 'option-picker-sheet__price' });
        price.append(priceLine, createElement('span', {
          className: 'option-picker-sheet__description', text: group.unitPrice || ''
        }));
        card.append(choice, price);
        card.addEventListener('click', () => onGroupRequest(group.id));
        cards.set(group.id, card);
        list.append(card);
      });

      const selectedList = createElement('div', { className: 'option-picker-sheet__selected-list', hidden: '' });
      groups.forEach((group) => {
        const item = createElement('div', { className: 'option-picker-sheet__selected-item', hidden: '' });
        const count = createElement('strong', { className: 'option-picker-sheet__count', text: '0' });
        const decrement = createElement('button', { className: 'option-picker-sheet__quantity-button', type: 'button', text: '−' });
        const increment = createElement('button', { className: 'option-picker-sheet__quantity-button', type: 'button', text: '+' });
        const remove = createElement('button', { className: 'option-picker-sheet__remove', type: 'button', 'aria-label': `${group.label} 선택 삭제` });
        remove.append(createIcon('M5 5L19 19M19 5L5 19'));
        const controls = createElement('span', { className: 'option-picker-sheet__quantity-controls' });
        controls.append(decrement, count, increment);
        const footer = createElement('div', { className: 'option-picker-sheet__selected-footer' });
        const price = createElement('strong', { className: 'option-picker-sheet__summary-price' });
        footer.append(controls, price);
        const itemHeader = createElement('div', { className: 'option-picker-sheet__selected-header' });
        itemHeader.append(createElement('strong', { className: 'option-picker-sheet__selected-label', text: group.label }), remove);
        item.append(itemHeader, footer);
        decrement.addEventListener('click', () => onGroupDecrement(group.id));
        increment.addEventListener('click', () => onGroupIncrement(group.id));
        remove.addEventListener('click', () => onGroupRemove(group.id));
        selections.set(group.id, { item, count, decrement, increment, remove, price, group });
        selectedList.append(item);
      });

      doneButton = createElement('button', { className: 'option-picker-sheet__done', type: 'button', text: '선택완료', disabled: '' });
      doneButton.hidden = true;
      doneButton.addEventListener('click', () => setOpen(false));
      sheet.append(header, list, selectedList, doneButton);
      layer.append(backdrop, sheet);
      root.append(trigger, layer);
    },
    updateStates(states) {
      selectedTotal = states.reduce((total, state) => total + state.selectedCount, 0);
      trigger.querySelector('.option-picker-sheet__trigger-label').textContent = selectedTotal
        ? `선택한 옵션 ${selectedTotal}개` : '옵션 선택 (필수)';
      trigger.hidden = selectedTotal === 0;
      doneButton.disabled = selectedTotal === 0 || states.some(({ isUpdating }) => isUpdating);
      doneButton.hidden = selectedTotal === 0;
      layer.querySelector('.option-picker-sheet__selected-list').hidden = selectedTotal === 0;
      states.forEach(({ id, selectedCount, limit, isSelectionDisabled, isUpdating }) => {
        const card = cards.get(id);
        const selection = selections.get(id);
        if (!card || !selection) return;
        card.disabled = isSelectionDisabled;
        card.classList.toggle('is-selected', selectedCount > 0);
        card.setAttribute('aria-pressed', String(selectedCount > 0));
        selection.item.hidden = selectedCount === 0;
        selection.count.textContent = String(selectedCount);
        selection.decrement.disabled = isUpdating || selectedCount === 0;
        selection.increment.disabled = isUpdating || selectedCount >= limit;
        selection.remove.disabled = isUpdating;
        selection.price.textContent = selection.group.summaryPrices?.[selectedCount - 1] || '';
      });
    },
    hasSelectedOptions() { return selectedTotal > 0; },
    open() { setOpen(true); },
    destroy() {
      document.documentElement.classList.remove('option-picker-sheet-open');
      clearElement(root);
      cards.clear();
      selections.clear();
    }
  };
}
