import {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  ProductDiscountSelectionStrategy,
} from '../generated/api';

const MINIMUM_QUANTITY = 2;
const DISCOUNT_PERCENTAGE = 15;
const DISCOUNT_MESSAGE = "15% OFF additional units!";

export function cartLinesDiscountsGenerateRun(
  input: CartInput,
): CartLinesDiscountsGenerateRunResult {

  const candidates = [];

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;
    if (line.merchandise.product.isGiftCard) continue;
    if (!line.merchandise.product.hasAnyTag) continue;
    if (line.quantity < MINIMUM_QUANTITY) continue;

    const discountedQty = line.quantity - 1;

    candidates.push({
      message: DISCOUNT_MESSAGE,
      targets: [
        {
          cartLine: {
            id: line.id,
            quantity: discountedQty,
          },
        },
      ],
      value: {
        percentage: { value: DISCOUNT_PERCENTAGE },
      },
    });
  }

  if (candidates.length === 0) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}