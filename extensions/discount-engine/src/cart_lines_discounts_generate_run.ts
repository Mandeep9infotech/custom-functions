import {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  ProductDiscountSelectionStrategy,
} from "../generated/api";

const MIN_QTY = 2;
const DISCOUNT_PERCENT = 0.15;

export function cartLinesDiscountsGenerateRun(input: CartInput): CartLinesDiscountsGenerateRunResult {

  const candidates:any[] = [];

  for (const line of input.cart.lines) {

    if (line.merchandise.__typename !== "ProductVariant") continue;

    const product = line.merchandise.product;

    /*
    FREE GIFT
    */

    if (line.freeGift !== null) {

      candidates.push({
        message: "Free gift added!",
        targets: [{ cartLine: { id: line.id }}],
        value: {
          percentage: { value: 100 }
        }
      });

      continue;
    }

    /*
    VOLUME DISCOUNT
    */

    if (!product.hasAnyTag) continue;
    if (product.isGiftCard) continue;
    if (line.quantity < MIN_QTY) continue;

    const price = Number(line.cost.amountPerQuantity.amount);

    const discountAmount =
      price * DISCOUNT_PERCENT * (line.quantity - 1);

    candidates.push({
      message: "15% OFF additional units!",
      targets: [{ cartLine: { id: line.id }}],
      value: {
        fixedAmount: {
          amount: discountAmount.toFixed(2)
        }
      }
    });

  }

  if (!candidates.length) {
    return { operations: [] };
  }

  return {
    operations: [{
      productDiscountsAdd: {
        candidates,
        selectionStrategy: ProductDiscountSelectionStrategy.First
      }
    }]
  };
}