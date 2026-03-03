import {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  ProductDiscountSelectionStrategy,
} from '../generated/api';

const MINIMUM_QUANTITY = 2;
const DISCOUNT_PERCENTAGE = 15;
const DISCOUNT_MESSAGE = "15% OFF discount applied!";

export function cartLinesDiscountsGenerateRun(
  input: CartInput,
): CartLinesDiscountsGenerateRunResult {

  const targets: { cartLine: { id: string } }[] = [];

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;
    if (line.merchandise.product.isGiftCard) continue;
    if (!line.merchandise.product.hasAnyTag) continue;
    if (line.quantity < MINIMUM_QUANTITY) continue;

    targets.push({ cartLine: { id: line.id } });
  }

  if (targets.length === 0) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates: [
            {
              message: DISCOUNT_MESSAGE,
              targets,
              value: {
                percentage: { value: DISCOUNT_PERCENTAGE },
              },
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}