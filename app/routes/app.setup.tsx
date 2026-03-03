import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  console.log("🔥 Setup route triggered");

  // 1️⃣ Fetch Shopify functions
  const functionsRes = await admin.graphql(`
    query {
      shopifyFunctions(first: 20) {
        nodes {
          id
          title
          apiType
        }
      }
    }
  `);

  const functionsData = await functionsRes.json();
  const functions = functionsData.data.shopifyFunctions.nodes;

  return json({
    success: true,
    functions,
  });
};