import type { VercelRequest, VercelResponse } from '@vercel/node';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateDeliveryModelsAsync } from '@kontent-ai/model-generator';

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
  try {
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

    // Extract webhook data for logging
    const webhookData = request.body;
    console.log('📥 Webhook received from Kontent.ai');
    console.log('📋 Full webhook payload:', JSON.stringify(webhookData, null, 2));

    // Generate models
    console.log('🚀 Starting model generation...');

    // Try to write to local src/model directory (works in local dev)
    // Fall back to /tmp if local directory doesn't exist (serverless)
    const localOutputDir = join(process.cwd(), 'src', 'model');
    const outputDir = existsSync(join(process.cwd(), 'src')) 
      ? localOutputDir 
      : '/tmp/models/src/model';

    console.log(`📁 Generating models to: ${outputDir}`);
    console.log(`📁 Current working directory: ${process.cwd()}`);
    console.log(`📁 Output directory exists: ${existsSync(outputDir)}`);
    
    // Ensure the output directory exists
    if (!existsSync(outputDir)) {
      console.log(`📁 Creating output directory: ${outputDir}`);
      mkdirSync(outputDir, { recursive: true });
    }

    // Dynamic import for ESM module (required for Vercel serverless functions)
    console.log('📦 Loading model generator module...');
    console.log('✅ Model generator module loaded');

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
    console.log(`📦 Output directory: ${outputDir}`);
    
    return response.status(200).json({ 
      success: true,
      message: 'Models generated successfully',
      outputDir: outputDir,
      timestamp: new Date().toISOString(),
      webhookReceived: true
    });
  } catch (error) {
    console.error('💥 Error in webhook handler:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('💥 Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return response.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
  }
}
