// Script para fusionar marcas duplicadas en Supabase
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Leer .env.local manualmente
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function mergeDuplicateBrands() {
  console.log("🔍 Buscando marcas duplicadas...\n");

  const { data: brands, error } = await supabase
    .from("brands")
    .select("id, name, image_url")
    .order("name");

  if (error || !brands) {
    console.error("❌ Error:", error);
    return;
  }

  console.log("📋 Marcas encontradas:");
  brands.forEach((b) => console.log(`   [${b.id}] "${b.name}" (img: ${b.image_url ? "✅" : "❌"})`));
  console.log();

  // Agrupar por nombre uppercase
  const grouped = {};
  for (const brand of brands) {
    const key = brand.name.trim().toUpperCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(brand);
  }

  const duplicates = Object.entries(grouped).filter(([, arr]) => arr.length > 1);

  if (duplicates.length === 0) {
    console.log("✅ No hay duplicados.");
    return;
  }

  for (const [normalizedName, entries] of duplicates) {
    console.log(`⚠️  Duplicado: "${normalizedName}" (${entries.length} registros)`);

    // Ganador: el que tenga imagen, o el primero
    const winner = entries.find((e) => e.image_url) || entries[0];
    const losers = entries.filter((e) => e.id !== winner.id);

    console.log(`   ✅ Ganador: [${winner.id}] "${winner.name}"`);

    for (const loser of losers) {
      console.log(`   🔄 Moviendo productos de [${loser.id}] → [${winner.id}]...`);

      const { data: updated, error: updateErr } = await supabase
        .from("products")
        .update({ brand_id: winner.id })
        .eq("brand_id", loser.id)
        .select("id");

      if (updateErr) {
        console.error(`   ❌ Error:`, updateErr);
        continue;
      }
      console.log(`   📦 ${updated?.length || 0} producto(s) reasignados.`);

      const { error: deleteErr } = await supabase
        .from("brands")
        .delete()
        .eq("id", loser.id);

      if (deleteErr) {
        console.error(`   ❌ Error eliminando:`, deleteErr);
      } else {
        console.log(`   🗑️  [${loser.id}] eliminado.`);
      }
    }
  }

  console.log("\n🎉 ¡Fusión completada!");
}

mergeDuplicateBrands();
