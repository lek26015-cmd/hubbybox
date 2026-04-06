const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const HUBBYBOX_WAREHOUSE_LOCATION = 'คลังกลาง Hubbybox';
const BOX_STATUS = {
  SHIPPING_TO_WAREHOUSE: 'shipping_to_warehouse',
  RETURNING: 'returning',
  REQUESTED_RETURN: 'requested_return'
};

async function test() {
  console.log('Testing query...');
  const { data, error } = await supabase
    .from('boxes')
    .select('id, name, status, location')
    .or(`location.ilike."%${HUBBYBOX_WAREHOUSE_LOCATION}%",status.eq.${BOX_STATUS.SHIPPING_TO_WAREHOUSE},status.eq.${BOX_STATUS.RETURNING},status.eq.${BOX_STATUS.REQUESTED_RETURN}`)
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data.length, 'rows');
  }
}

test();
