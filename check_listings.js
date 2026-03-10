const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envs = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key) acc[key] = val.join('=');
    return acc;
}, {});

const supabase = createClient(
    envs.NEXT_PUBLIC_SUPABASE_URL.trim(),
    envs.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
);

async function check() {
    const { data, error } = await supabase.from('listings').select('title, image_url').limit(5);
    console.log("Listings:", data);
    if (error) console.error("Error:", error);
}

check();
