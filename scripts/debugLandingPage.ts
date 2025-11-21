import dotenv from 'dotenv';
import { createDeliveryClient } from "@kontent-ai/delivery-sdk";

dotenv.config();

const ENVIRONMENT_ID = process.env.VITE_ENVIRONMENT_ID || "f189fcee-05bc-0069-1f34-a1d35d692446";
const API_KEY = process.env.VITE_DELIVERY_API_KEY || "";

async function debugLandingPage() {
  console.log("🔍 Debugging Landing Page...\n");
  console.log(`Environment ID: ${ENVIRONMENT_ID}`);
  console.log(`API Key: ${API_KEY ? "Set" : "NOT SET"}\n`);

  if (!API_KEY) {
    console.error("❌ VITE_DELIVERY_API_KEY is not set in .env file");
    return;
  }

  const client = createDeliveryClient({
    environmentId: ENVIRONMENT_ID,
    previewApiKey: API_KEY,
    defaultQueryConfig: {
      usePreviewMode: false,
    },
  });

  try {
    // Try to find landing pages without collection filter
    console.log("\n📄 Checking Landing Pages (no collection filter):");
    const allLandingPagesResponse = await client
      .items()
      .type("landing_page")
      .limitParameter(10)
      .toPromise();
    
    const allLandingPages = allLandingPagesResponse.data.items;
    console.log(`Found ${allLandingPages.length} landing pages:`);
    allLandingPages.forEach((lp: any) => {
      console.log(`  - ${lp.system.name} (${lp.system.codename})`);
      console.log(`    Collection: ${lp.system.collection}`);
      console.log(`    Language: ${lp.system.language}`);
    });

    // Try with default collection
    console.log("\n📄 Checking Landing Pages (collection: patient_resources):");
    try {
      const filteredResponse = await client
        .items()
        .type("landing_page")
        .equalsFilter("system.collection", "patient_resources")
        .limitParameter(10)
        .toPromise();
      
      console.log(`Found ${filteredResponse.data.items.length} landing pages in patient_resources`);
    } catch (err: any) {
      console.log(`  Error: ${err.message}`);
    }

    // Try with collections found from landing pages
    const uniqueCollections = [...new Set(allLandingPages.map((lp: any) => lp.system.collection))];
    console.log(`\n📦 Unique collections found: ${uniqueCollections.join(", ")}`);

    // Try with each collection
    for (const collectionCodename of uniqueCollections) {
      console.log(`\n📄 Checking Landing Pages (collection: ${collectionCodename}):`);
      try {
        const filteredResponse = await client
          .items()
          .type("landing_page")
          .equalsFilter("system.collection", collectionCodename)
          .limitParameter(10)
          .toPromise();
        
        console.log(`Found ${filteredResponse.data.items.length} landing pages`);
        if (filteredResponse.data.items.length > 0) {
          const lp = filteredResponse.data.items[0];
          console.log(`  First landing page: ${lp.system.name}`);
          console.log(`  Has headline: ${!!lp.elements.headline?.value}`);
          console.log(`  Has subheadline: ${!!lp.elements.subheadline?.value}`);
          console.log(`  Has hero_image: ${!!lp.elements.hero_image?.value}`);
          console.log(`  Has body_copy: ${!!lp.elements.body_copy?.value}`);
          console.log(`  Has featured_content: ${!!lp.elements.featured_content?.linkedItems?.length}`);
        }
      } catch (err: any) {
        console.log(`  Error: ${err.message}`);
      }
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("401") || error.message.includes("403")) {
      console.error("\n💡 Check your VITE_DELIVERY_API_KEY in .env file");
    }
  }
}

debugLandingPage();

