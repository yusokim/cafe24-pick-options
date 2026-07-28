import { clearElement, createElement } from '../utils/dom.js';

function createBadge(badge) {
  const label = typeof badge === 'string' ? badge : badge?.label;
  const badgeElement = createElement('span', {
    className: 'option-picker__badge',
    text: label || ''
  });

  if (typeof badge === 'object' && badge) {
    if (badge.color) {
      badgeElement.style.setProperty('--option-picker-badge-color', badge.color);
    }

    if (badge.backgroundColor) {
      badgeElement.style.setProperty('--option-picker-badge-background', badge.backgroundColor);
    }
  }

  return badgeElement;
}

function createChevron() {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.classList.add('option-picker__chevron');
  icon.setAttribute('viewBox', '0 0 20 20');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');

  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', 'M5 12.5L10 7.5L15 12.5');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  icon.append(path);
  return icon;
}

function createCloseIcon() {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.classList.add('option-picker__remove-icon');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');

  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', 'M5 5L19 19M19 5L5 19');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('stroke-linecap', 'round');
  icon.append(path);
  return icon;
}

export function createOptionPickerView({ root, groups }) {
  let cards = new Map();
  let selectedOptions = new Map();
  let list = null;
  let header = null;

  function setExpanded(isExpanded) {
    if (!header || !list) return;

    header.setAttribute('aria-expanded', String(isExpanded));
    list.hidden = !isExpanded;
  }

  return {
    render({ onGroupRequest, onGroupIncrement, onGroupDecrement, onGroupRemove }) {
      clearElement(root);
      cards = new Map();
      selectedOptions = new Map();

      header = createElement('button', {
        className: 'option-picker__header',
        type: 'button',
        'aria-expanded': 'true',
        'aria-controls': 'option-picker-list'
      });
      header.append(
        createElement('strong', { className: 'option-picker__title', text: '옵션 선택 (필수)' }),
        createChevron()
      );

      list = createElement('div', { className: 'option-picker__list', id: 'option-picker-list' });
      groups.forEach((group) => {
        const button = createElement('button', {
          className: 'option-picker__card',
          type: 'button',
          dataset: { optionPickerGroup: group.id },
          'aria-pressed': 'false'
        });

        const priceLine = createElement('span', { className: 'option-picker__price-line' });
        priceLine.append(
          createElement('strong', { className: 'option-picker__price-value', text: group.displayPrice || '' }),
          createElement('span', { className: 'option-picker__discount-rate', text: group.discountRate || '' }),
          createBadge(group.badge)
        );

        const price = createElement('span', { className: 'option-picker__price' });
        price.append(
          priceLine,
          createElement('span', { className: 'option-picker__description', text: group.unitPrice || '' })
        );

        const choice = createElement('span', { className: 'option-picker__choice' });
        choice.append(
          createElement('span', { className: 'option-picker__radio', 'aria-hidden': 'true' }),
          createElement('strong', { className: 'option-picker__label', text: group.label })
        );

        button.append(choice, price);

        button.addEventListener('click', () => onGroupRequest(group.id));
        cards.set(group.id, button);
        list.append(button);
      });

      const selectedOptionList = createElement('div', {
        className: 'option-picker__selected-options',
        hidden: ''
      });
      groups.forEach((group) => {
        const selectedOption = createElement('div', {
          className: 'option-picker__selected-option',
          hidden: ''
        });
        const count = createElement('strong', { className: 'option-picker__selected-count', text: '0' });
        const decrementButton = createElement('button', {
          className: 'option-picker__quantity-button',
          type: 'button',
          text: '−',
          'aria-label': `${group.label} 수량 감소`
        });
        const incrementButton = createElement('button', {
          className: 'option-picker__quantity-button',
          type: 'button',
          text: '+',
          'aria-label': `${group.label} 수량 증가`
        });
        const controls = createElement('span', { className: 'option-picker__quantity-controls' });
        controls.append(decrementButton, count, incrementButton);
        const removeButton = createElement('button', {
          className: 'option-picker__remove-button',
          type: 'button',
          'aria-label': `${group.label} 선택 삭제`
        });
        removeButton.append(createCloseIcon());
        const optionHeader = createElement('div', { className: 'option-picker__selected-header' });
        optionHeader.append(
          createElement('strong', { className: 'option-picker__selected-label', text: group.label }),
          removeButton
        );
        const summaryPrice = createElement('strong', {
          className: 'option-picker__summary-price',
          text: ''
        });
        const optionFooter = createElement('div', { className: 'option-picker__selected-footer' });
        optionFooter.append(controls, summaryPrice);
        selectedOption.append(
          optionHeader,
          optionFooter
        );

        decrementButton.addEventListener('click', () => onGroupDecrement(group.id));
        incrementButton.addEventListener('click', () => onGroupIncrement(group.id));
        removeButton.addEventListener('click', () => onGroupRemove(group.id));
        selectedOptions.set(group.id, {
          element: selectedOption,
          count,
          decrementButton,
          incrementButton,
          removeButton,
          summaryPrice,
          summaryPrices: group.summaryPrices || [group.displayPrice]
        });
        selectedOptionList.append(selectedOption);
      });

      header.addEventListener('click', () => {
        setExpanded(header.getAttribute('aria-expanded') !== 'true');
      });

      root.append(header, list, selectedOptionList);
    },
    updateStates(states) {
      const hasSelectedOption = states.some(({ selectedCount }) => selectedCount > 0);
      const selectedOptionList = root.querySelector('.option-picker__selected-options');
      selectedOptionList.hidden = !hasSelectedOption;

      states.forEach(({ id, selectedCount, limit, isSelectionDisabled, isUpdating }) => {
        const card = cards.get(id);
        const selectedOption = selectedOptions.get(id);
        if (!card || !selectedOption) return;

        card.disabled = isSelectionDisabled;
        card.classList.toggle('is-selected', selectedCount > 0);
        card.classList.toggle('is-updating', isUpdating);
        card.setAttribute('aria-pressed', String(selectedCount > 0));
        card.setAttribute('aria-busy', String(isUpdating));
        card.setAttribute(
          'aria-label',
          `${card.querySelector('.option-picker__label').textContent}, ${selectedCount} / ${limit} 선택`
        );
        selectedOption.element.hidden = selectedCount === 0;
        selectedOption.element.setAttribute('aria-busy', String(isUpdating));
        selectedOption.count.textContent = String(selectedCount);
        selectedOption.decrementButton.disabled = isUpdating || selectedCount === 0;
        selectedOption.incrementButton.disabled = isUpdating || selectedCount >= limit;
        selectedOption.removeButton.disabled = isUpdating;
        selectedOption.summaryPrice.textContent =
          selectedOption.summaryPrices[selectedCount - 1] || '';
      });
    },
    destroy() {
      clearElement(root);
      cards.clear();
      selectedOptions.clear();
      list = null;
      header = null;
    }
  };
}
