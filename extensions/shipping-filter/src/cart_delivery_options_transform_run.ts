import {
  CartDeliveryOptionsTransformRunInput,
  CartDeliveryOptionsTransformRunResult,
} from "../generated/api";

export function cartDeliveryOptionsTransformRun(
  input: CartDeliveryOptionsTransformRunInput
): CartDeliveryOptionsTransformRunResult {

  const operations: CartDeliveryOptionsTransformRunResult["operations"] = [];

  for (const group of input.cart?.deliveryGroups ?? []) {

    const address = group.deliveryAddress;
    if (!address) continue;

    const country = address.countryCode?.toUpperCase();
    const province = address.provinceCode?.toUpperCase();

    if (country !== "AU") continue;

    for (const option of group.deliveryOptions ?? []) {

      const title = option.title?.toUpperCase() ?? "";
      const isPickup = title.includes("PICK");

      if (province !== "VIC") {
        if (isPickup) {
          operations.push({
            deliveryOptionHide: {
              deliveryOptionHandle: option.handle,
            },
          });
        }
      } else {
        if (isPickup) {

          const totalOptions = group.deliveryOptions?.length ?? 0;

          operations.push({
            deliveryOptionMove: {
              deliveryOptionHandle: option.handle,
              index: totalOptions - 1,
            },
          });
        }
      }
    }
  }

  return { operations };
}