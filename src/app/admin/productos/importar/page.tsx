"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Upload, FileText, CheckCircle2, XCircle, Loader2,
  AlertTriangle, DownloadCloud, Trash2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import * as XLSX from "xlsx";

interface Category { id: string; name: string; }
interface Brand    { id: string; name: string; }

interface CsvRow {
  name: string;
  price: string;
  description?: string;
  code_1?: string;
  code_2?: string;
  category: string;   // name — resolved to ID
  brand?: string;     // name — resolved to ID
  image_url?: string;
  image_2?: string;
}

interface PreviewRow extends CsvRow {
  _status: "pending" | "ok" | "error" | "duplicate";
  _error?: string;
  _category_id?: string;
  _brand_id?: string;
  _is_new_category?: boolean;
  _is_new_brand?: boolean;
  _is_update?: boolean;
  _product_id?: string;
}

const BATCH_SIZE = 50;

// Utilidad para comparar strings ignorando mayúsculas, acentos y espacios
const normalizeStr = (str: any) => {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

// Extrae el número sin importar si tiene símbolo de dólar, comas o espacios
const parsePrice = (priceStr: any) => {
  if (!priceStr) return 0;
  const numStr = String(priceStr).replace(/[^\d,\.-]/g, '').replace(',', '.');
  const parsed = parseFloat(numStr);
  return isNaN(parsed) ? 0 : parsed;
};

export default function ImportarProductosPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands]         = useState<Brand[]>([]);
  const [existingProds, setExistingProds] = useState<{id: string, name: string, code_1?: string}[]>([]);
  const [rows, setRows]             = useState<PreviewRow[]>([]);
  const [importing, setImporting]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [done, setDone]             = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const [catsRes, brandsRes, prodsRes] = await Promise.all([
        supabase.from("categories").select("id, name"),
        supabase.from("brands").select("id, name"),
        supabase.from("products").select("id, name, code_1"),
      ]);
      setCategories(catsRes.data ?? []);
      setBrands(brandsRes.data ?? []);
      setExistingProds(prodsRes.data ?? []);
    })();
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array of arrays first to clean headers
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawJson.length < 2) throw new Error("Archivo vacío o sin datos");

        const headers = rawJson[0].map((h: any) => 
          String(h).replace(/✱/g, '').replace(/\$/g, '').trim().toLowerCase()
        );

        const headerMap: Record<string, keyof CsvRow> = {
          "nombre": "name",
          "precio usd": "price",
          "precio": "price",
          "categoría": "category",
          "categoria": "category",
          "marca": "brand",
          "descripción": "description",
          "descripcion": "description",
          "código oem": "code_1",
          "codigo oem": "code_1",
          "cod. alterno": "code_2",
          "url imagen": "image_url",
          "url img extra": "image_2"
        };

        const parsed: CsvRow[] = [];
        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          // Skip completely empty rows
          if (!row || row.length === 0 || row.every((c: any) => !c)) continue;
          
          const obj: any = {};
          headers.forEach((h: string, idx: number) => { 
            const mappedKey = headerMap[h] || h; 
            obj[mappedKey] = row[idx] ? String(row[idx]).trim() : ""; 
          });
          parsed.push(obj as CsvRow);
        }

        const previewed: PreviewRow[] = parsed.map((row) => {
          const catNameNorm = normalizeStr(row.category);
          const brandNameNorm = normalizeStr(row.brand);
          
          const cat = categories.find(c => normalizeStr(c.name) === catNameNorm);
          const brand = brandNameNorm ? brands.find(b => normalizeStr(b.name) === brandNameNorm) : undefined;
          
          let existingMatch;
          if (row.code_1) {
            existingMatch = existingProds.find(p => p.code_1 === row.code_1);
          }
          if (!existingMatch && row.name) {
            const nm = normalizeStr(row.name);
            existingMatch = existingProds.find(p => normalizeStr(p.name) === nm);
          }

          let status: PreviewRow["_status"] = "pending";
          let error: string | undefined;

          const cleanPrice = parsePrice(row.price);
          const isNewCat = !cat && !!catNameNorm;
          const isNewBrand = !brand && !!brandNameNorm;

          if (!row.name || row.name.trim() === "") { 
            status = "error"; error = "Nombre requerido"; 
          }
          else if (cleanPrice <= 0) { 
            status = "error"; error = `Precio inválido (${row.price})`; 
          }
          else if (!catNameNorm) { 
            status = "error"; error = "Categoría requerida"; 
          }

          return { 
            ...row, 
            price: cleanPrice > 0 ? cleanPrice.toString() : row.price,
            _status: status, 
            _error: error, 
            _category_id: cat?.id, 
            _brand_id: brand?.id,
            _is_new_category: isNewCat,
            _is_new_brand: isNewBrand,
            _is_update: !!existingMatch,
            _product_id: existingMatch?.id
          };
        });
        
        setRows(previewed);
        setDone(false);
        setProgress(0);
      } catch (err: any) {
        toast.error("Error al leer archivo", { description: err.message || "Asegúrate de que sea un archivo Excel (.xlsx) o CSV válido" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validRows = rows.filter(r => r._status === "pending" || r._status === "ok");
  const errorRows = rows.filter(r => r._status === "error");

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setProgress(0);

    let activeCategories = [...categories];
    let activeBrands = [...brands];

    // 1. Detectar e insertar categorías y marcas faltantes
    const pendingCategories = new Set<string>();
    const pendingBrands = new Set<string>();

    validRows.forEach(row => {
      if (row._is_new_category) pendingCategories.add(row.category.trim());
      if (row._is_new_brand && row.brand) pendingBrands.add(row.brand.trim());
    });

    if (pendingCategories.size > 0) {
      toast.info(`Creando ${pendingCategories.size} categorías nuevas...`);
      const catsToInsert = Array.from(pendingCategories).map(name => ({ name, icon: "Package" }));
      const { data: newCats, error: catErr } = await supabase.from("categories").insert(catsToInsert).select();
      if (!catErr && newCats) {
        activeCategories = [...activeCategories, ...newCats];
        setCategories(activeCategories);
      }
    }

    if (pendingBrands.size > 0) {
      toast.info(`Creando ${pendingBrands.size} marcas nuevas...`);
      const brandsToInsert = Array.from(pendingBrands).map(name => ({ name }));
      const { data: newBrands, error: brandErr } = await supabase.from("brands").insert(brandsToInsert).select();
      if (!brandErr && newBrands) {
        activeBrands = [...activeBrands, ...newBrands];
        setBrands(activeBrands);
      }
    }

    // 2. Insertar o actualizar productos (separados para que Supabase no dé error de estructura de JSON)
    const payloads = validRows.map(row => {
      const catNorm = normalizeStr(row.category);
      const brandNorm = normalizeStr(row.brand);
      const catId = activeCategories.find(c => normalizeStr(c.name) === catNorm)?.id || row._category_id;
      const brandId = activeBrands.find(b => normalizeStr(b.name) === brandNorm)?.id || row._brand_id;

      return {
        _is_update:  row._is_update,
        _product_id: row._product_id,
        name:        row.name.trim(),
        price:       Number(row.price),
        description: row.description || null,
        code_1:      row.code_1 || null,
        code_2:      row.code_2 || null,
        category_id: catId!,
        brand_id:    brandId || null,
        image_url:   row.image_url || "https://placehold.co/400x400?text=Repuesto",
        image_2:     row.image_2 || null,
        stock_status: true,
      };
    });

    const toInsert = payloads.filter(p => !p._is_update).map(({ _is_update, _product_id, ...rest }) => rest);
    const toUpdate = payloads.filter(p => !!p._is_update).map(({ _is_update, _product_id, ...rest }) => ({ ...rest, id: _product_id }));

    let imported = 0;
    let hasErrors = false;

    // Procesar inserciones
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("products").insert(batch);
      if (error) {
        toast.error(`Error insertando productos: ${error.message}`);
        hasErrors = true;
      } else {
        imported += batch.length;
      }
      setProgress(50);
    }

    // Procesar actualizaciones
    for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
      const batch = toUpdate.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("products").upsert(batch);
      if (error) {
        toast.error(`Error actualizando productos: ${error.message}`);
        hasErrors = true;
      } else {
        imported += batch.length;
      }
    }
    setProgress(100);

    setImporting(false);
    setDone(true);
    
    if (imported > 0) {
      toast.success(`✅ ${imported} productos procesados correctamente`);
      setRows(prev => prev.map(r => r._status === "pending" ? { ...r, _status: "ok" } : r));
    } else if (!hasErrors) {
      toast.error(`⚠️ No se importó ningún producto`);
    }
  };

  const downloadTemplate = () => {
    const a = document.createElement("a");
    a.href = "/plantilla_productos_sotomayor.xlsx";
    a.download = "plantilla_productos_sotomayor.xlsx";
    a.click();
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/productos" className="hover:text-primary transition-colors">Productos</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-foreground">Importar CSV</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight">Importación Masiva</h1>
          <p className="text-sm text-muted-foreground mt-1">Carga cientos de productos usando un archivo de Excel o CSV.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2 shrink-0">
          <DownloadCloud className="w-4 h-4" />
          Descargar Plantilla Excel
        </Button>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border bg-muted/40 p-4 text-sm space-y-1">
        <p className="font-bold text-foreground">📋 Columnas requeridas en el archivo:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2 font-mono text-xs">
          {["Nombre ✱", "Precio USD ✱", "Categoría ✱", "Marca", "Descripción", "Código OEM", "Cod. Alterno", "URL Imagen", "URL Img Extra"].map(col => (
            <span key={col} className={`bg-background border rounded px-2 py-1 ${col.includes("✱") ? "border-primary/40 text-primary" : "text-muted-foreground"}`}>
              {col}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-xs mt-2">
          ✱ Requerido. Las columnas <strong>Categoría</strong> y <strong>Marca</strong> se conectarán automáticamente o se crearán nuevas si no las tienes registradas.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/20 p-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
        onClick={() => fileRef.current?.click()}
      >
        <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-bold text-foreground">Haz clic o arrastra tu archivo Excel / CSV aquí</p>
        <p className="text-sm text-muted-foreground mt-1">Soporta .xlsx, .xls y .csv</p>
        <input ref={fileRef} type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleFile} />
      </div>

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm font-semibold">
              <FileText className="w-4 h-4" /> {rows.length} filas totales
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm font-semibold text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" /> {validRows.length} válidas
            </div>
            {errorRows.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm font-semibold text-destructive">
                <XCircle className="w-4 h-4" /> {errorRows.length} con errores
              </div>
            )}
          </div>

          {/* Table preview */}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-xs uppercase tracking-wider">#</th>
                  <th className="px-3 py-2 text-left font-bold text-xs uppercase tracking-wider">Nombre</th>
                  <th className="px-3 py-2 text-left font-bold text-xs uppercase tracking-wider">Precio</th>
                  <th className="px-3 py-2 text-left font-bold text-xs uppercase tracking-wider">Categoría</th>
                  <th className="px-3 py-2 text-left font-bold text-xs uppercase tracking-wider">Marca</th>
                  <th className="px-3 py-2 text-left font-bold text-xs uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className={row._status === "error" ? "bg-destructive/5" : row._status === "ok" ? "bg-green-500/5" : ""}>
                    <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2 font-medium max-w-[180px] truncate">
                      {row.name || <span className="text-destructive italic">vacío</span>}
                      {row._is_update && <span className="ml-2 text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded-full font-bold">ACTUALIZAR</span>}
                    </td>
                    <td className="px-3 py-2">${row.price}</td>
                    <td className="px-3 py-2">
                      {row.category}
                      {row._is_new_category && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">NUEVA</span>}
                    </td>
                    <td className="px-3 py-2">
                      {row.brand || <span className="text-muted-foreground/50">—</span>}
                      {row._is_new_brand && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">NUEVA</span>}
                    </td>
                    <td className="px-3 py-2">
                      {row._status === "error" ? (
                        <span className="flex items-center gap-1 text-destructive text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5 shrink-0" /> {row._error}
                        </span>
                      ) : row._status === "ok" ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Importado
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Listo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && (
              <p className="text-center text-xs text-muted-foreground py-3">
                Mostrando las primeras 100 filas de {rows.length}. Todas serán importadas.
              </p>
            )}
          </div>

          {/* Progress bar */}
          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Importando...</span><span>{Math.min(progress, 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!done ? (
              <Button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="gap-2"
                size="lg"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importing ? "Importando..." : `Importar ${validRows.length} productos`}
              </Button>
            ) : (
              <Link href="/admin/productos">
                <Button className="gap-2" size="lg">
                  <CheckCircle2 className="w-4 h-4" /> Ver productos importados
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => { setRows([]); setDone(false); setProgress(0); if (fileRef.current) fileRef.current.value = ""; }}
              className="gap-2 text-muted-foreground"
            >
              <Trash2 className="w-4 h-4" /> Limpiar
            </Button>
          </div>

          {errorRows.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Las <strong>{errorRows.length} filas con errores</strong> serán ignoradas. Corrige el archivo y vuelve a subirlo para importarlas.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
