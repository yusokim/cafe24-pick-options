import { clearElement, createElement } from '../utils/dom.js';

export function createOptionPickerView({ root, groups }) {
  let cards = new Map();

  return {
    render(onGroupRequest) {
      clearElement(root);
      cards = new Map();

      const list = createElement('div', { className: 'option-picker__list' });
      groups.forEach((group) => {
        const button = createElement('button', {
          className: 'option-picker__card',
          type: 'button',
          dataset: { optionPickerGroup: group.id }
        });

        button.append(
          createElement('span', { className: 'option-picker__badge', text: group.badge || '' }),
          createElement('strong', { className: 'option-picker__label', text: group.label }),
          createElement('span', { className: 'option-picker__description', text: group.description || '' }),
          createElement('span', { className: 'option-picker__price', text: group.displayPrice || '' }),
          createElement('span', { className: 'option-picker__count', text: '' })
        );

        button.addEventListener('click', () => onGroupRequest(group.id));
        cards.set(group.id, button);
        list.append(button);
      });

      root.append(list);
    },
    updateStates(states) {
      states.forEach(({ id, selectedCount, limit, isDisabled }) => {
        const card = cards.get(id);
        if (!card) return;

        card.disabled = isDisabled;
        card.classList.toggle('is-selected', selectedCount > 0);
        card.classList.toggle('is-disabled', isDisabled);
        card.querySelector('.option-picker__count').textContent = `${selectedCount} / ${limit} 선택`;
      });
    },
    destroy() {
      clearElement(root);
      cards.clear();
    }
  };
}
