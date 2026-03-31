// Script para fusionar marcas duplicadas en Supabase
// Uso: npx tsx scripts/merge-brands.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function mergeDuplicateBrands() {
  console.log("🔍 Buscando marcas duplicadas...\n");

  // 1. Obtener todas las marcas
  const { data: brands, error } = await supabase
    .from("brands")
    .select("id, name, image_url")
    .order("name");

  if (error || !brands) {
    console.error("❌ Error obteniendo marcas:", error);
    return;
  }

  console.log("📋 Marcas encontradas:");
  brands.forEach((b) => console.log(`   - [${b.id}] "${b.name}" (img: ${b.image_url || "sin imagen"})`));
  console.log();

  // 2. Agrupar por nombre normalizado (uppercase)
  const grouped: Record<string, typeof brands> = {};
  for (const brand of brands) {
    const key = brand.name.trim().toUpperCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(brand);
  }

  // 3. Encontrar duplicados
  const duplicates = Object.entries(grouped).filter(([, arr]) => arr.length > 1);

  if (duplicates.length === 0) {
    console.log("✅ No se encontraron marcas duplicadas.");
    return;
  }

  for (const [normalizedName, entries] of duplicates) {
    console.log(`⚠️  Duplicado encontrado: "${normalizedName}" (${entries.length} registros)`);
    entries.forEach((e) => console.log(`     [${e.id}] "${e.name}"`));

    // Elegir el ganador: el que tenga imagen, o el que tenga nombre en MAYÚSCULAS
    const winner = entries.find((e) => e.image_url) || entries.find((e) => e.name === e.name.toUpperCase()) || entries[0];
    const losers = entries.filter((e) => e.id !== winner.id);

    console.log(`   ✅ Ganador: [${winner.id}] "${winner.name}"`);

    for (const loser of losers) {
      console.log(`   🔄 Reasignando productos de [${loser.id}] "${loser.name}" → [${winner.id}] "${winner.name}"...`);

      // Reasignar productos del perdedor al ganador
      const { data: updated, error: updateErr } = await supabase
        .from("products")
        .update({ brand_id: winner.id })
        .eq("brand_id", loser.id)
        .select("id");

      if (updateErr) {
        console.error(`   ❌ Error reasignando productos:`, updateErr);
        continue;
      }

      console.log(`   📦 ${updated?.length || 0} producto(s) reasignado(s).`);

      // Eliminar la marca duplicada
      const { error: deleteErr } = await supabase
        .from("brands")
        .delete()
        .eq("id", loser.id);

      if (deleteErr) {
        console.error(`   ❌ Error eliminando marca duplicada:`, deleteErr);
      } else {
        console.log(`   🗑️  Marca [${loser.id}] "${loser.name}" eliminada.`);
      }
    }

    // Asegurar que el ganador tenga el nombre en MAYÚSCULAS
    if (winner.name !== normalizedName) {
      await supabase
        .from("brands")
        .update({ name: normalizedName })
        .eq("id", winner.id);
      console.log(`   ✏️  Nombre actualizado a "${normalizedName}".`);
    }
  }

  console.log("\n🎉 ¡Fusión completada!");
}

mergeDuplicateBrands();
