const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from("brands").select("id, name, image_url").order("name");
  console.log("Marcas actuales en la BD:");
  if (error) { console.error(error); return; }
  data.forEach(b => console.log(`  [${b.id}] "${b.name}" img:${b.image_url ? "✅" : "❌"}`));

  // Contar productos por marca
  for (const b of data) {
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("brand_id", b.id);
    console.log(`    → ${count} productos`);
  }
}
check();
