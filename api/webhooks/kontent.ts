import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateDeliveryModelsAsync } from '@kontent-ai/model-generator';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Webhook handler for Kontent.ai webhooks
 * 
 * MVP: Receives webhook notifications and generates delivery models locally.
 * 
 * Endpoint: POST /api/webhooks/kontent
 * 
 * Required Environment Variables:
 * - VITE_ENVIRONMENT_ID: Kontent.ai environment ID
 * - VITE_MANAGEMENT_API_KEY: Kontent.ai Management API key
 * 
 * Note: Webhook signature validation is disabled for demo purposes.
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  // Check for required configuration
  const environmentId = process.env.VITE_ENVIRONMENT_ID;
  const managementApiKey = process.env.VITE_MANAGEMENT_API_KEY;

  if (!environmentId || !managementApiKey) {
    console.error('❌ Missing Kontent.ai configuration');
    return response.status(500).json({ 
      error: 'Server configuration error',
      message: 'Kontent.ai configuration is missing. Please set VITE_ENVIRONMENT_ID and VITE_MANAGEMENT_API_KEY environment variables.'
    });
  }

  // Extract webhook data
  const webhookData = request.body;
  const operation = webhookData?.operation || 'unknown';
  const itemType = webhookData?.data?.type || 'unknown';
  
  console.log(`📥 Webhook received: ${operation} on ${itemType}`);

  // Only trigger on content type changes (when models need regeneration)
  const shouldTrigger = 
    operation === 'content_type_variant' || 
    operation === 'content_type' ||
    webhookData?.message?.type === 'content_type_variant' ||
    webhookData?.message?.type === 'content_type';

  if (!shouldTrigger) {
    console.log(`⏭️ Skipping model regeneration for operation: ${operation}`);
    return response.status(200).json({ 
      message: 'Webhook received but model regeneration not needed',
      operation,
      itemType
    });
  }

  try {
    console.log('🚀 Starting model generation...');

    // Try to write to local src/model directory (works in local dev)
    // Fall back to /tmp if local directory doesn't exist (serverless)
    const localOutputDir = join(process.cwd(), 'src', 'model');
    const outputDir = existsSync(join(process.cwd(), 'src')) 
      ? localOutputDir 
      : '/tmp/models/src/model';

    console.log(`📁 Generating models to: ${outputDir}`);

    // Generate models
    await generateDeliveryModelsAsync({
      environmentId: environmentId,
      managementApiKey: managementApiKey,
      addTimestamp: false,
      createFiles: true,
      outputDir: outputDir,
      moduleFileExtension: 'ts',
      fileResolvers: {
        taxonomy: 'camelCase',
        contentType: 'camelCase',
        snippet: 'camelCase'
      },
      formatOptions: {
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'all',
        parser: 'typescript'
      }
    });

    console.log('✅ Models generated successfully');
    
    return response.status(200).json({ 
      success: true,
      message: 'Models generated successfully',
      operation,
      itemType,
      outputDir: outputDir,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('💥 Error generating models:', error);
    
    return response.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
