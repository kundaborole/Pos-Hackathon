import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']!;
const restaurantId = env['NEXT_PUBLIC_RESTAURANT_ID']!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Restaurant ID from env:", restaurantId);
  const { data } = await supabase.from('products').select('name, restaurant_id, image_url');
  console.log(JSON.stringify(data, null, 2));

  // Try updating without checking restaurant ID!
  await supabase.from('products').update({ image_url: '/images/pizza.png' }).eq('name', 'Margherita Pizza');
  await supabase.from('products').update({ image_url: '/images/cappuccino.png' }).eq('name', 'Cappuccino');
  await supabase.from('products').update({ image_url: '/images/burger.png' }).eq('name', 'Cheese Burger');

  console.log("Updated without restaurant filter.");
}

main().catch(console.error);
