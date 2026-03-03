import { db, pool } from '../server/db';
import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';
import { reviewTemplates, businessProfiles, users } from '../shared/schema';

async function seedDemoData() {
  console.log('Starting demo data seeding...');
  
  try {
    // Check if we already have templates
    const existingTemplates = await db.select({ count: sql`count(*)` }).from(reviewTemplates);
    
    if (Number(existingTemplates[0].count) > 0) {
      console.log('Templates already exist, skipping seeding...');
      return;
    }
    
    // Check if we have any business profiles
    const existingBusinessProfiles = await db.select({ count: sql`count(*)` }).from(businessProfiles);
    
    // Create business profiles if they don't exist
    if (Number(existingBusinessProfiles[0].count) === 0) {
      console.log('Creating business profiles...');
      
      // Create business profiles for user with ID 1 (Jason)
      const businessProfilesData = [
        {
          businessName: 'Floor Daddy',
          businessLocation: 'Atlanta, GA',
          businessService: 'Professional flooring installation and services',
          representativeName: 'Jason',
          userId: 1,
          isPrimary: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          businessName: 'Maya\'s Plumbing',
          businessLocation: 'Seattle, WA',
          businessService: 'Expert plumbing services',
          representativeName: 'Maya',
          userId: 1,
          isPrimary: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Insert business profiles
      for (const profile of businessProfilesData) {
        // Insert business profile
        const result = await pool.query(`
          INSERT INTO business_profiles
          (business_name, business_location, business_service, representative_name, user_id, is_primary, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `, [
          profile.businessName,
          profile.businessLocation,
          profile.businessService,
          profile.representativeName,
          profile.userId,
          profile.isPrimary,
          profile.createdAt,
          profile.updatedAt
        ]);
        
        console.log(`Created business profile "${profile.businessName}" with ID ${result.rows[0].id}`);
      }
    } else {
      console.log('Business profiles already exist, using existing ones');
    }
    
    // Verify business profiles and get their IDs
    const businessProfilesList = await db.select().from(businessProfiles).where(sql`user_id = 1`);
    
    if (businessProfilesList.length < 2) {
      console.log('Not enough business profiles found for user ID 1. Please check the data.');
      return;
    }
    
    // Use the first two business profiles
    const businessProfile1Id = businessProfilesList[0].id;
    const businessProfile2Id = businessProfilesList.length > 1 ? businessProfilesList[1].id : businessProfilesList[0].id;
    
    console.log(`Using business profile IDs: ${businessProfile1Id} and ${businessProfile2Id}`);
    
    // Create some demo templates
    const templates = [
      {
        name: 'Floor Daddy - Customer Review',
        description: 'Share your experience with Floor Daddy',
        relationshipType: 'customer',
        allowRelationshipChange: false,
        userId: 1,
        businessProfileId: businessProfile1Id,
        isPublic: true,
        customQuestions: JSON.stringify([
          {
            question: 'What did you like about our service?',
            subtitle: 'Tell us what stood out to you',
            placeholder: 'e.g. Quick installation, friendly staff...'
          },
          {
            question: 'How was the quality of our work?',
            subtitle: 'We value your honest opinion',
            placeholder: 'e.g. The floors look amazing...'
          },
          {
            question: 'Would you recommend us to others?',
            subtitle: 'This helps others make decisions',
            placeholder: 'e.g. Yes, because...'
          }
        ]),
        settings: JSON.stringify({
          prefilledFields: ['businessName', 'businessLocation', 'businessService'],
          editableFields: [],
          displayLogo: true,
          useCustomColors: false,
          primaryColor: '#2563eb'
        }),
        thankYouMessage: 'Thank you for your review! We appreciate your feedback.',
        redirectUrl: ''
      },
      {
        name: 'Maya\'s Plumbing - Appointment Review',
        description: 'How was your appointment with Maya\'s Plumbing?',
        relationshipType: 'appointment',
        allowRelationshipChange: true,
        userId: 1,
        businessProfileId: businessProfile2Id,
        isPublic: true,
        customQuestions: JSON.stringify([
          {
            question: 'How was your appointment experience?',
            subtitle: 'Tell us about your interaction',
            placeholder: 'e.g. The plumber was professional...'
          },
          {
            question: 'Was the issue resolved to your satisfaction?',
            subtitle: 'We want to ensure you\'re happy with our work',
            placeholder: 'e.g. Yes, the leak was fixed...'
          },
          {
            question: 'What could we improve for next time?',
            subtitle: 'Your feedback helps us get better',
            placeholder: 'e.g. Arrival time could be more specific...'
          }
        ]),
        settings: JSON.stringify({
          prefilledFields: ['businessName', 'businessLocation'],
          editableFields: ['businessService'],
          displayLogo: true,
          useCustomColors: true,
          primaryColor: '#0891b2'
        }),
        thankYouMessage: 'Thank you for your feedback! We hope to serve you again soon.',
        redirectUrl: ''
      }
    ];
    
    // Insert templates and generate shareable IDs
    for (const template of templates) {
      // Add createdAt and updatedAt
      const now = new Date();
      const templateWithDates = {
        ...template,
        createdAt: now,
        updatedAt: now
      };
      
      // Insert one by one
      const result = await pool.query(`
        INSERT INTO review_templates 
        (name, description, relationship_type, allow_relationship_change, user_id, business_profile_id, 
         is_public, custom_questions, settings, thank_you_message, redirect_url, created_at, updated_at)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        templateWithDates.name, 
        templateWithDates.description, 
        templateWithDates.relationshipType,
        templateWithDates.allowRelationshipChange,
        templateWithDates.userId,
        templateWithDates.businessProfileId,
        templateWithDates.isPublic,
        templateWithDates.customQuestions,
        templateWithDates.settings,
        templateWithDates.thankYouMessage,
        templateWithDates.redirectUrl,
        templateWithDates.createdAt,
        templateWithDates.updatedAt
      ]);
      
      const insertedTemplate = { id: result.rows[0].id };
      
      // Generate shareable ID
      const templateId = insertedTemplate.id;
      const randomBytes = crypto.randomBytes(8);
      const shareableId = `t-${templateId}-${randomBytes.toString('hex')}`;
      
      // Update template with shareable ID
      await db.update(reviewTemplates)
        .set({ shareableId })
        .where(sql`id = ${templateId}`);
      
      console.log(`Created template "${template.name}" with ID ${templateId} and shareable ID ${shareableId}`);
    }
    
    console.log('Demo data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the seeding
seedDemoData();