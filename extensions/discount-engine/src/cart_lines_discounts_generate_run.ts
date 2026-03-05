import {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
  ProductDiscountSelectionStrategy,
} from "../generated/api";

const MIN_QTY = 2;
const DISCOUNT_PERCENT = 15;

export function cartLinesDiscountsGenerateRun(
  input: CartInput
): CartLinesDiscountsGenerateRunResult {

  const candidates: any[] = [];

  for (const line of input.cart.lines) {

    if (line.merchandise.__typename !== "ProductVariant") continue;

    const product = line.merchandise.product;

    /*
    ==========================================
    FREE GIFT LOGIC
    ==========================================
    Detect property added by auto-gwp.js
    properties: { free_gift: "" }
    */

    if (line.freeGift !== null) {

      candidates.push({
        message: "Free gift added!",
        targets: [
          {
            cartLine: {
              id: line.id,
              quantity: line.quantity
            }
          }
        ],
        value: {
          percentage: {
            value: 100
          }
        }
      });

      continue;
    }

    /*
    ==========================================
    VOLUME DISCOUNT LOGIC
    ==========================================
    */

    if (product.isGiftCard) continue;

    if (!product.hasAnyTag) continue;

    if (line.quantity < MIN_QTY) continue;

    const discountedQty = line.quantity - 1;

    candidates.push({
      message: "15% OFF additional units!",
      targets: [
        {
          cartLine: {
            id: line.id,
            quantity: discountedQty
          }
        }
      ],
      value: {
        percentage: {
          value: DISCOUNT_PERCENT
        }
      }
    });
  }

  if (!candidates.length) {
    return {
      operations: []
    };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy: ProductDiscountSelectionStrategy.First
        }
      }
    ]
  };
}