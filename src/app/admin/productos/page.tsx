"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Upload, Loader2, ChevronLeft, ChevronRight, FileText, Search, X as XIcon, Copy, ClipboardList, Download, ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import imageCompression from 'browser-image-compression';
import * as XLSX from 'xlsx';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface SpecItem {
  key: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  image_2?: string;
  description?: string;
  brand_id?: string;
  code_1?: string;
  code_2?: string;
  category_id: string;
  stock_status: boolean;
  specifications?: SpecItem[];
  categories?: { name: string };
  brands?: { name: string; image_url?: string };
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImg1, setUploadingImg1] = useState(false);
  const [uploadingImg2, setUploadingImg2] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' }>({ key: 'created_at', direction: 'desc' });
  const itemsPerPage = 8;
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    image_url: "",
    image_2: "",
    description: "",
    brand_id: "",
    code_1: "",
    code_2: "",
    category_id: "",
    stock_status: true,
    specifications: [] as SpecItem[],
  });

  const fetchData = async () => {
    setLoading(true);
    
    // Pagination offset
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase.from("products")
      .select("*, categories:category_id (name), brands:brand_id (name, image_url)", { count: "exact" })
      .order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code_1.ilike.%${searchTerm}%`);
    }

    const [prodsRes, catsRes, brandsRes] = await Promise.all([
      query.range(from, to),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("brands").select("id, name").order("name"),
    ]);

    if (prodsRes.error) {
      toast.error("Error al cargar productos", { description: prodsRes.error.message });
    } else {
      setProducts(prodsRes.data || []);
      if (prodsRes.count !== null) setTotalCount(prodsRes.count);
    }

    if (catsRes.data) {
      setCategories(catsRes.data);
    }
    if (brandsRes.data) {
      setBrands(brandsRes.data);
    }
    setLoading(false);
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(searchInput);
      if (searchInput !== searchTerm) setCurrentPage(1);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id || !formData.image_url) {
      toast.error("Todos los campos (excepto ID) son obligatorios.");
      return;
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      image_url: formData.image_url,
      image_2: formData.image_2 || null,
      description: formData.description || null,
      brand_id: formData.brand_id || null,
      code_1: formData.code_1 || null,
      code_2: formData.code_2 || null,
      stock_status: formData.stock_status,
      specifications: formData.specifications.filter(s => s.key.trim() && s.value.trim()),
    };

    try {
      if (formData.id) {
        // Update
        const { error } = await supabase.from("products").update(payload).eq("id", formData.id);
        if (error) throw error;
        toast.success("Producto modificado con éxito");
      } else {
        // Create
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        toast.success("Producto creado con éxito");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Error al guardar", { description: err.message });
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    const { error } = await supabase.from("products").delete().eq("id", productToDelete.id);
    if (error) {
      toast.error("Error al eliminar", { description: error.message });
    } else {
      toast.success("Producto eliminado");
      fetchData();
    }
    setProductToDelete(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isImage2: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es muy pesada. Máximo 5MB.");
      return;
    }

    const setUploading = isImage2 ? setUploadingImg2 : setUploadingImg1;
    setUploading(true);

    try {
      const options = {
        maxSizeMB: 0.3, // Compress to max 300KB
        maxWidthOrHeight: 1280, // Max dimension
        useWebWorker: true,
      };

      let fileToUpload = file;
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (compressionError) {
        console.warn("Fallo en compresión, usando original", compressionError);
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (isImage2) {
        setFormData(prev => ({ ...prev, image_2: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
      }
      
      toast.success("Recurso subido al servidor nube con éxito.");
    } catch (error: any) {
      toast.error("Fallo al subir archivo", { description: error.message || "Asegúrate de haber creado el bucket 'products' público en Supabase." });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addSpecRow = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const removeSpecRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const updateSpecRow = (index: number, field: "key" | "value", val: string) => {
    setFormData(prev => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, specifications: updated };
    });
  };

  const openCreateModal = () => {
    setFormData({ id: "", name: "", price: "", image_url: "", image_2: "", description: "", brand_id: "", code_1: "", code_2: "", category_id: "", stock_status: true, specifications: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setFormData({
      id: prod.id,
      name: prod.name,
      price: prod.price.toString(),
      image_url: prod.image_url,
      image_2: prod.image_2 || "",
      description: prod.description || "",
      brand_id: prod.brand_id || "",
      code_1: prod.code_1 || "",
      code_2: prod.code_2 || "",
      category_id: prod.category_id,
      stock_status: prod.stock_status,
      specifications: Array.isArray(prod.specifications) ? prod.specifications : [],
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* PREVIEW MODAL */}
      <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden rounded-xl border-border bg-card">
          {previewProduct && (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 h-full max-h-[90vh]">
              {/* Image Section */}
              <div className="bg-white p-6 md:p-10 flex items-center justify-center lg:col-span-2 border-r relative min-h-[300px]">
                {previewProduct.image_2 && (
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <img src={previewProduct.image_url} alt="Vista 1" className="h-12 w-12 rounded cursor-pointer border-2 bg-white object-contain hover:border-primary shadow-sm transition-all" />
                    <img src={previewProduct.image_2} alt="Vista 2" className="h-12 w-12 rounded cursor-pointer border border-border bg-white object-contain opacity-60 hover:opacity-100 transition-all" />
                  </div>
                )}
                {/* Brand Badge */}
                {previewProduct.brands?.image_url && (
                  <div className="absolute top-4 right-4 h-8 w-16 bg-white rounded flex items-center justify-center p-1 border shadow-sm z-10">
                    <img src={previewProduct.brands.image_url} alt={previewProduct.brands.name || "Marca"} className="max-h-full max-w-full object-contain" />
                  </div>
                )}
                <img src={previewProduct.image_url} alt={previewProduct.name} className="max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]" />
              </div>

              {/* Data Section */}
              <div className="p-6 md:p-8 lg:col-span-3 flex flex-col bg-card overflow-y-auto">
                <DialogHeader className="mb-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {previewProduct.categories?.name || "Categoría"}
                    </span>
                    {previewProduct.stock_status && (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                        Disponibilidad Inmediata
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                    {previewProduct.name}
                  </DialogTitle>
                </DialogHeader>

                {/* Codes */}
                <div className="flex flex-wrap items-center gap-4 mb-6 bg-muted/50 p-3 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Código Original (OEM)</span>
                    <span className="font-mono text-sm font-semibold">{previewProduct.code_1 || "N/A"}</span>
                  </div>
                  {(previewProduct.code_2 || previewProduct.brands?.name) && (
                    <div className="w-px h-8 bg-border" />
                  )}
                  {previewProduct.code_2 && (
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Código Alternativo</span>
                      <span className="font-mono text-sm font-semibold text-muted-foreground">{previewProduct.code_2}</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-black text-foreground tracking-tight">${previewProduct.price.toFixed(2)}</span>
                </div>

                {/* Specs Table */}
                {previewProduct.specifications && Array.isArray(previewProduct.specifications) && previewProduct.specifications.length > 0 && (
                  <div className="mb-6 border rounded-lg overflow-hidden bg-background">
                    <div className="bg-muted/50 px-3 py-2 border-b">
                      <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Especificaciones Técnicas</h4>
                    </div>
                    <div className="divide-y divide-border">
                      {previewProduct.specifications.map((spec: any, idx: number) => (
                        <div key={idx} className="flex px-3 py-2 text-sm hover:bg-muted/30 transition-colors">
                          <span className="font-semibold text-muted-foreground w-1/3 shrink-0">{spec.key}</span>
                          <span className="font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewProduct.description && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      Descripción
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap pl-6">
                      {previewProduct.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente &quot;<strong className="text-foreground">{productToDelete?.name}</strong>&quot; y todo su contenido asociado de los servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-64 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar repuesto o código..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 bg-background"
            />
          </div>
          <Link href="/admin/productos/importar">
            <Button variant="outline" className="hidden sm:flex bg-background">
              <FileText className="mr-2 h-4 w-4" /> Importar CSV
            </Button>
          </Link>
          <Button
            variant="outline"
            className="hidden sm:flex bg-background"
            onClick={async () => {
              try {
                toast.loading("Generando Excel profesional...", { id: "export" });
                const { data, error } = await supabase
                  .from("products")
                  .select("name, price, description, code_1, code_2, stock_status, image_url, image_2, categories:category_id(name), brands:brand_id(name)")
                  .order("name");
                if (error) throw error;
                if (!data || data.length === 0) { toast.dismiss("export"); toast.error("No hay productos para exportar"); return; }

                const ExcelJS = (await import("exceljs")).default;
                const workbook = new ExcelJS.Workbook();
                workbook.creator = "Repuestos Sotomayor C.A.";
                workbook.created = new Date();

                const sheet = workbook.addWorksheet("Productos", {
                  views: [{ state: "frozen" as const, ySplit: 2 }],
                });

                const PRIMARY = "C0392B";
                const DARK = "2C3E50";
                const LIGHT = "F8F9FA";
                const WHITE = "FFFFFF";

                const COLUMNS = [
                  { header: "Nombre", key: "name", width: 38 },
                  { header: "Precio USD", key: "price", width: 14 },
                  { header: "Categoría", key: "category", width: 22 },
                  { header: "Marca", key: "brand", width: 18 },
                  { header: "Estado", key: "status", width: 12 },
                  { header: "Descripción", key: "description", width: 50 },
                  { header: "Código OEM", key: "code_1", width: 16 },
                  { header: "Cod. Alterno", key: "code_2", width: 16 },
                  { header: "URL Imagen", key: "image_url", width: 32 },
                  { header: "URL Img Extra", key: "image_2", width: 32 },
                ];
                sheet.columns = COLUMNS;

                // Fila 1: Título corporativo
                sheet.mergeCells(1, 1, 1, COLUMNS.length);
                const titleCell = sheet.getCell("A1");
                titleCell.value = `CATÁLOGO DE PRODUCTOS — REPUESTOS SOTOMAYOR C.A. — ${new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" })}`;
                titleCell.font = { name: "Calibri", size: 13, bold: true, color: { argb: WHITE } };
                titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } };
                titleCell.alignment = { horizontal: "center", vertical: "middle" };
                sheet.getRow(1).height = 32;

                // Fila 2: Cabeceras rojas
                const headerRow = sheet.getRow(2);
                headerRow.values = COLUMNS.map(c => c.header);
                headerRow.height = 24;
                headerRow.eachCell((cell) => {
                  cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: WHITE } };
                  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY } };
                  cell.alignment = { horizontal: "center", vertical: "middle" };
                  cell.border = {
                    top: { style: "thin", color: { argb: DARK } },
                    bottom: { style: "thin", color: { argb: DARK } },
                    left: { style: "thin", color: { argb: DARK } },
                    right: { style: "thin", color: { argb: DARK } },
                  };
                });

                // Datos
                data.forEach((item: any, idx: number) => {
                  const row = sheet.addRow({
                    name: item.name,
                    price: item.price,
                    category: item.categories?.name || "",
                    brand: item.brands?.name || "",
                    status: item.stock_status ? "Activo" : "Inactivo",
                    description: item.description || "",
                    code_1: item.code_1 || "",
                    code_2: item.code_2 || "",
                    image_url: item.image_url || "",
                    image_2: item.image_2 || "",
                  });
                  const isEven = idx % 2 === 0;
                  row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.font = { name: "Calibri", size: 10 };
                    cell.border = {
                      bottom: { style: "hair", color: { argb: "D5D8DC" } },
                      left: { style: "hair", color: { argb: "D5D8DC" } },
                      right: { style: "hair", color: { argb: "D5D8DC" } },
                    };
                    if (isEven) {
                      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } };
                    }
                  });
                  row.getCell("price").numFmt = '"$"#,##0.00';
                  row.getCell("price").alignment = { horizontal: "right" };
                  const statusCell = row.getCell("status");
                  statusCell.alignment = { horizontal: "center" };
                  statusCell.font = item.stock_status
                    ? { name: "Calibri", size: 10, color: { argb: "27AE60" } }
                    : { name: "Calibri", size: 10, bold: true, color: { argb: "E74C3C" } };
                });

                sheet.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2 + data.length, column: COLUMNS.length } };
                const sRow = data.length + 3;
                sheet.mergeCells(sRow, 1, sRow, 3);
                const sCell = sheet.getCell(sRow, 1);
                sCell.value = `Total de productos: ${data.length}`;
                sCell.font = { name: "Calibri", size: 11, bold: true, italic: true, color: { argb: DARK } };

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `productos_sotomayor_${new Date().toISOString().slice(0, 10)}.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
                toast.dismiss("export");
                toast.success(`${data.length} productos exportados con éxito`);
              } catch (err: any) {
                toast.dismiss("export");
                toast.error(`Error al exportar: ${err.message}`);
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden rounded-xl border-border">
              <DialogHeader className="px-6 py-5 border-b bg-muted/30">
                <DialogTitle className="text-2xl font-display tracking-tight text-foreground">
                  {formData.id ? "Editar Ficha de Repuesto" : "Registrar Nuevo Repuesto"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSave} className="flex flex-col max-h-[85vh]">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Basic Info & Media */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                        <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2">Información Principal</h4>
                        <div className="space-y-2">
                          <Label>Nombre del Repuesto</Label>
                          <Input
                            placeholder="Ej. Kit de Embrague Premium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descripción Extendida (Opcional)</Label>
                          <textarea
                            placeholder="Menciona aplicaciones, años compatibles o detalles técnicos..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                        <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2">Galería Multimedia</h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Fotografía Principal (URL)</Label>
                            <label className="cursor-pointer text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-md">
                              {uploadingImg1 ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              {uploadingImg1 ? "Subiendo..." : "Subir Archivo"}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, false)} 
                                disabled={uploadingImg1}
                              />
                            </label>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Input
                              placeholder="Pega un enlace o sube un archivo ⏫"
                              value={formData.image_url}
                              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                              className="bg-background flex-1"
                            />
                            {formData.image_url ? (
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border shadow-sm bg-white">
                                <img src={formData.image_url} alt="Main Preview" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 flex-shrink-0 rounded-md border border-dashed bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-bold">IMG</div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <Label>Fotografía Secundaria (Optativa)</Label>
                            <label className="cursor-pointer text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-md">
                              {uploadingImg2 ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              {uploadingImg2 ? "Subiendo..." : "Subir Archivo"}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, true)} 
                                disabled={uploadingImg2}
                              />
                            </label>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Input
                              placeholder="Pega un enlace o sube un archivo ⏫"
                              value={formData.image_2}
                              onChange={(e) => setFormData({ ...formData, image_2: e.target.value })}
                              className="bg-background flex-1"
                            />
                            {formData.image_2 ? (
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border shadow-sm bg-white">
                                <img src={formData.image_2} alt="Sec Preview" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 flex-shrink-0 rounded-md border border-dashed bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-bold">IMG 2</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Classification & Sales */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="space-y-4 rounded-lg border bg-surface-dark/5 p-4 shadow-sm">
                        <h4 className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2">Clasificación Orgánica</h4>
                        
                        <div className="space-y-2">
                          <Label>Categoría Raíz</Label>
                          <Select
                            value={formData.category_id}
                            onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Asignar Familia..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Marca del Fabricante</Label>
                          <Select
                            value={formData.brand_id}
                            onValueChange={(val) => setFormData({ ...formData, brand_id: val })}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Ninguna / Genérico" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="space-y-2">
                            <Label className="text-xs">Código OEM</Label>
                            <Input
                              placeholder="Ej. AB-123"
                              value={formData.code_1}
                              onChange={(e) => setFormData({ ...formData, code_1: e.target.value })}
                              className="bg-background text-sm font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Cod. Alternativo</Label>
                            <Input
                              placeholder="Ej. XY-999"
                              value={formData.code_2}
                              onChange={(e) => setFormData({ ...formData, code_2: e.target.value })}
                              className="bg-background text-sm font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm border-primary/20">
                        <h4 className="text-xs uppercase text-primary font-bold tracking-wider mb-2">Control de Ventas</h4>
                        
                        <div className="space-y-2">
                          <Label>Precio de Venta ($USD)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              className="pl-7 bg-background text-lg font-bold"
                            />
                          </div>
                          <div className="text-[11px] text-muted-foreground leading-tight mt-2 font-medium bg-muted p-2.5 rounded-md border border-border/50 flex flex-col gap-2">
                            <p>
                              <span className="text-primary font-bold mr-1">💡 Importante:</span> 
                              Ingresa el precio siempre en Dólares ($USD) equivalente a <strong>Efectivo</strong>.
                            </p>
                            <div className="text-foreground bg-background p-2 rounded border text-xs flex flex-col gap-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Previsualización en Tienda:</span>
                              <div className="flex justify-between">
                                <span>Efectivo:</span>
                                <span className="text-green-600 font-bold">${parseFloat(formData.price || "0").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tasa BCV (x1.6):</span>
                                <span className="text-primary font-bold">${(parseFloat(formData.price || "0") * 1.6).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border bg-background p-3 shadow-sm mt-4">
                          <div className="space-y-0.5">
                            <Label>Disponible en Stock</Label>
                            <p className="text-[10px] text-muted-foreground">Si apagas el botón, no se venderá.</p>
                          </div>
                          <Switch
                            checked={formData.stock_status}
                            onCheckedChange={(val) => setFormData({ ...formData, stock_status: val })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t bg-muted/20 px-6 py-4 flex items-center justify-end gap-3 shadow-sm">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="min-w-[150px] font-bold shadow-md">
                    Guardar Producto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Img</TableHead>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted">
                Nombre <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Códigos</TableHead>
              <TableHead onClick={() => handleSort('price')} className="cursor-pointer hover:bg-muted">
                Precio <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('stock_status')} className="cursor-pointer hover:bg-muted">
                Stock <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Cargando productos...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">No hay productos registrados.</TableCell>
              </TableRow>
            ) : (
              products.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell>
                    <img src={prod.image_url} alt={prod.name} className="h-8 w-8 rounded-md object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const hasImage = !!prod.image_url && !prod.image_url.includes("placehold");
                        const hasDesc = !!prod.description && prod.description.length > 10;
                        const hasSpecs = prod.specifications && Array.isArray(prod.specifications) && prod.specifications.length > 0;
                        const hasPrice = prod.price > 0;
                        const score = [hasImage, hasDesc, hasSpecs, hasPrice].filter(Boolean).length;
                        const color = score === 4 ? "bg-green-500" : score >= 2 ? "bg-amber-400" : "bg-red-500";
                        const labels = [];
                        if (!hasImage) labels.push("imagen");
                        if (!hasDesc) labels.push("descripción");
                        if (!hasSpecs) labels.push("specs");
                        if (!hasPrice) labels.push("precio");
                        return (
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${color}`}
                            title={score === 4 ? "Producto completo" : `Falta: ${labels.join(", ")}`}
                          />
                        );
                      })()}
                      <span className="truncate max-w-[200px]">{prod.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{prod.categories?.name}</TableCell>
                  <TableCell>
                    {prod.brands?.image_url ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-10 bg-white rounded flex items-center justify-center p-0.5 border">
                          <img src={prod.brands.image_url} alt={prod.brands.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider hidden xl:inline-block">
                          {prod.brands.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground uppercase text-xs font-bold tracking-wider">
                        {prod.brands?.name || <span className="text-[10px] font-normal opacity-50">Genérico</span>}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs">
                      {prod.code_1 && <span className="font-mono text-primary font-medium">{prod.code_1}</span>}
                      {prod.code_2 && <span className="font-mono text-muted-foreground">{prod.code_2}</span>}
                      {!prod.code_1 && !prod.code_2 && <span className="text-muted-foreground/50 text-[10px] italic">Sin códigos</span>}
                    </div>
                  </TableCell>
                  <TableCell>${prod.price}</TableCell>
                  <TableCell>
                    {prod.stock_status ? (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500 ring-1 ring-inset ring-green-500/20">Sí</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewProduct(prod)} title="Vista Previa">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(prod)} title="Editar">
                      <Pencil className="h-4 w-4 text-primary/80" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Duplicar"
                      onClick={async () => {
                        const { error } = await supabase.from("products").insert([{
                          name: prod.name + " (Copia)",
                          price: prod.price,
                          image_url: prod.image_url,
                          image_2: prod.image_2 || null,
                          description: prod.description || null,
                          brand_id: prod.brand_id || null,
                          code_1: prod.code_1 ? prod.code_1 + "-COPIA" : null,
                          code_2: prod.code_2 || null,
                          category_id: prod.category_id,
                          stock_status: prod.stock_status,
                          specifications: prod.specifications || [],
                        }]);
                        if (error) {
                          toast.error("Error al duplicar", { description: error.message });
                        } else {
                          toast.success(`"${prod.name}" duplicado con éxito`);
                          fetchData();
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setProductToDelete({id: prod.id, name: prod.name})}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between border-t p-4 bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Mostrando página {currentPage} ({(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)}) de {totalCount} productos totales
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage * itemsPerPage >= totalCount || loading}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
