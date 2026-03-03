import {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  ProductDiscountSelectionStrategy,
} from "../generated/api";

const DISCOUNT_MESSAGE = "Free gift added!";

export function cartLinesDiscountsGenerateRun(
  input: CartInput
): CartLinesDiscountsGenerateRunResult {

  const targets: { cartLine: { id: string } }[] = [];

  for (const line of input.cart.lines) {

    // Only apply if quantity is exactly 1
    if (line.quantity !== 1) {
      continue;
    }

    // If attribute doesn't exist, skip
    if (!line.attribute) {
      continue;
    }

    // Check value of the property
    if (line.attribute.value !== "true") {
      continue;
    }

    // If all conditions pass, mark this line for discount
    targets.push({
      cartLine: {
        id: line.id,
      },
    });
  }

  // If no matching lines, return nothing
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
                percentage: {
                  value: 100,
                },
              },
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}