import { db, pool } from '../server/db';
import { reviews, reviewTemplates } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Starting database migration...');
  
  try {
    // Step 1: Add missing columns if they don't exist
    console.log('Adding missing columns if needed...');
    
    try {
      // Add answers jsonb column to reviews table if it doesn't exist
      await pool.query(`
        ALTER TABLE reviews 
        ADD COLUMN IF NOT EXISTS answers JSONB;
      `);
      console.log('Added answers column if needed');
      
      // Add shareable_id column to review_templates if it doesn't exist
      await pool.query(`
        ALTER TABLE review_templates 
        ADD COLUMN IF NOT EXISTS shareable_id VARCHAR(64) UNIQUE;
      `);
      console.log('Added shareable_id column if needed');
      
      // Add custom_questions jsonb column to review_templates if it doesn't exist
      await pool.query(`
        ALTER TABLE review_templates 
        ADD COLUMN IF NOT EXISTS custom_questions JSONB;
      `);
      console.log('Added custom_questions column if needed');
      
      // Add settings jsonb column to review_templates if it doesn't exist
      await pool.query(`
        ALTER TABLE review_templates 
        ADD COLUMN IF NOT EXISTS settings JSONB;
      `);
      console.log('Added settings column if needed');
      
      // Add allow_relationship_change boolean column to review_templates if it doesn't exist
      await pool.query(`
        ALTER TABLE review_templates 
        ADD COLUMN IF NOT EXISTS allow_relationship_change BOOLEAN DEFAULT TRUE;
      `);
      console.log('Added allow_relationship_change column if needed');
      
      // Add thank_you_message text column to review_templates if it doesn't exist
      await pool.query(`
        ALTER TABLE review_templates 
        ADD COLUMN IF NOT EXISTS thank_you_message TEXT;
      `);
      console.log('Added thank_you_message column if needed');
      
      // Add redirect_url varchar column to review_templates if it doesn't exist
      await pool.query(`
        ALTER TABLE review_templates 
        ADD COLUMN IF NOT EXISTS redirect_url VARCHAR(255);
      `);
      console.log('Added redirect_url column if needed');
      
      // Add reviewer_email column to reviews table if it doesn't exist
      await pool.query(`
        ALTER TABLE reviews 
        ADD COLUMN IF NOT EXISTS reviewer_email VARCHAR(255);
      `);
      console.log('Added reviewer_email column if needed');
      
    } catch (err) {
      console.error('Error adding columns:', err);
      throw err;
    }
    
    // Step 2: Migrate existing reviews data if needed
    console.log('Migrating existing review data...');
    try {
      // First check if we have the old columns to migrate
      const columnsResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name IN ('answer1', 'answer2', 'answer3');
      `);
      
      const hasOldColumns = columnsResult.rowCount > 0;
      
      if (hasOldColumns) {
        // Migrate data from old columns to JSON format
        await pool.query(`
          UPDATE reviews
          SET answers = jsonb_build_object(
            'answer1', COALESCE(answer1, ''),
            'answer2', COALESCE(answer2, ''),
            'answer3', COALESCE(answer3, '')
          )
          WHERE answers IS NULL OR answers = '{}'::jsonb;
        `);
        console.log('Migrated answers data to JSON format');
      } else {
        console.log('No old columns found, skipping data migration');
      }
    } catch (err) {
      console.error('Error migrating data:', err);
      throw err;
    }
    
    // Step 3: Generate shareable IDs for existing templates
    console.log('Generating shareable IDs for existing templates...');
    try {
      // Get templates that don't have shareable IDs
      const templatesResult = await pool.query(`
        SELECT id FROM review_templates
        WHERE shareable_id IS NULL;
      `);
      
      if (templatesResult.rows.length > 0) {
        for (const template of templatesResult.rows) {
          const templateId = template.id;
          // Generate shareable ID
          const randomBytes = require('crypto').randomBytes(8);
          const shareableId = `t-${templateId}-${randomBytes.toString('hex')}`;
          
          // Update template with shareable ID
          await pool.query(`
            UPDATE review_templates
            SET shareable_id = $1
            WHERE id = $2;
          `, [shareableId, templateId]);
          
          console.log(`Generated shareable ID for template ${templateId}: ${shareableId}`);
        }
      } else {
        console.log('No templates without shareable IDs found');
      }
    } catch (err) {
      console.error('Error generating shareable IDs:', err);
      throw err;
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migration
runMigration();