# QA checklist

Test the published storefront URL in a logged-out/incognito browser after the edited skin has been set as the representative design.

| # | Check | Result | Evidence / notes |
| --- | --- | --- | --- |
| 1 | The custom pick-and-add option UI is visible. | ☐ | |
| 2 | Selecting a custom card updates the native Cafe24 option and purchase flow. | ☐ | |
| 3 | Repeated clicks and reselection do not create duplicates or errors. | ☐ | |
| 4 | The `_1`, `_2` suffix variants enforce the per-group add limit. | ☐ | |
| 5 | Option-specific price/additional price is correctly shown by Cafe24. | ☐ | |
| 6 | Quantity, total, cart, and direct purchase work. | ☐ | |
| 7 | Selected and disabled states are clearly shown. | ☐ | |
| 8 | Copy, badges, descriptions, limits, and display prices are configurable. | ☐ | |
| 9 | Layout works at desktop, 768px, and 375px widths. | ☐ | |

## Evidence to capture

- Custom-card selection updating a native selected-product row.
- A group reaching its `_1`, `_2` limit and becoming disabled.
- Removing a native selected-product row and the custom-card state recovering.
- Cart or direct-purchase action after a selection.
