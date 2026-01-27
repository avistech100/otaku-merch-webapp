import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { creators, products } from '../src/data/mockData';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log('🚀 Starting migration...');

  try {
    // 1. Migrate Categories
    const categoryNames = [...new Set(products.map(p => p.category))];
    console.log(`📦 Migrating ${categoryNames.length} categories...`);
    
    for (const name of categoryNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      await supabase.from('categories').upsert({
        name,
        slug,
        type: name.includes('Crypto') ? 'crypto' : 'anime'
      }, { onConflict: 'slug' });
    }

    const { data: categories } = await supabase.from('categories').select('*');
    const categoryMap = Object.fromEntries(categories?.map(c => [c.name, c.id]) || []);

    // 2. Migrate Products
    console.log(`👕 Migrating ${products.length} products...`);
    
    for (const prod of products) {
      const slug = prod.title.toLowerCase().replace(/\s+/g, '-');
      const { data: newProd, error: prodError } = await supabase
        .from('products')
        .upsert({
          title: prod.title,
          slug: slug,
          sku: `SKU-${slug.toUpperCase()}`,
          description: prod.description,
          price: prod.price,
          category_id: categoryMap[prod.category],
          is_limited_edition: prod.isLimited,
          hype_score: prod.hypeLevel === 'Legendary' ? 95 : prod.hypeLevel === 'High' ? 75 : 50,
          status: 'approved',
          story: prod.details.designStory,
          metadata: { materials: prod.details.materials }
        }, { onConflict: 'slug' })
        .select()
        .single();


      if (prodError) {
        console.error(`❌ Error migrating product "${prod.title}":`, JSON.stringify(prodError, null, 2));
        continue;
      }


      // 3. Migrate Images
      if (prod.images && prod.images.length > 0) {
        const images = prod.images.map((img, idx) => ({
          product_id: newProd.id,
          src: img,
          position: idx
        }));
        await supabase.from('product_images').upsert(images, { onConflict: 'product_id, src' });
      }

      // 4. Migrate Variants (Sizes)
      if (prod.sizes && prod.sizes.length > 0) {
        const variants = prod.sizes.map(size => ({
          product_id: newProd.id,
          option1: size,
          quantity: 50,
          price: prod.price
        }));
        await supabase.from('product_variants').upsert(variants, { onConflict: 'product_id, option1' });
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

migrate();
