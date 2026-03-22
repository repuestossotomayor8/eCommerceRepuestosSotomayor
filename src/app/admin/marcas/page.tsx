"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import imageCompression from 'browser-image-compression';
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
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  image_url?: string;
}

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", image_url: "" });

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast.error("Error al cargar marcas", { description: error.message });
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("El nombre de la marca es obligatorio.");
      return;
    }

    try {
      if (formData.id) {
        const { error } = await supabase
          .from("brands")
          .update({ name: formData.name, image_url: formData.image_url || null })
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Marca modificada con éxito");
      } else {
        const { error } = await supabase
          .from("brands")
          .insert([{ name: formData.name, image_url: formData.image_url || null }]);
        if (error) throw error;
        toast.success("Marca creada con éxito");
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      toast.error("Error al guardar", { description: err.message });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la marca "${name}"? Esto podría fallar si hay productos usándola.`)) return;

    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar", { description: "Verifica que no existan productos enlazados a esta marca." });
    } else {
      toast.success("Marca eliminada");
      fetchBrands();
    }
  };

  const openCreateModal = () => {
    setFormData({ id: "", name: "", image_url: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setFormData({ id: brand.id, name: brand.name, image_url: brand.image_url || "" });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es muy pesada. Máximo 2MB.");
      return;
    }

    setUploadingImg(true);

    try {
      const options = {
        maxSizeMB: 0.1, // Compress strongly for brand logos
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };

      let fileToUpload = file;
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (compressionError) {
        console.warn("Fallo en compresión", compressionError);
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `brands/${fileName}`; // Subfolder within products

      const { error: uploadError } = await supabase.storage
        .from('products') // Recycled existing bucket
        .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("Logo subido con éxito.");
    } catch (error: any) {
      toast.error("Fallo al subir archivo", { description: error.message });
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Marcas</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" /> Agregar Nueva
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{formData.id ? "Editar Marca" : "Nueva Marca"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Marca</Label>
                    <Input
                      placeholder="Ej. Bosch, Toyota..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Logo / Imagen de la Marca (Opcional)</Label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {formData.image_url ? (
                        <div className="relative h-16 w-16 shrink-0 rounded-md border bg-muted p-1">
                          <img src={formData.image_url} alt="Logo" className="h-full w-full object-contain rounded-sm" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: "" })}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-transform hover:scale-110"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/50 text-muted-foreground">
                          {uploadingImg ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                        </div>
                      )}
                      
                      <div className="flex-1 w-full space-y-2">
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImg || (!!formData.image_url && !formData.image_url.startsWith("http"))}
                            className="file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-4 file:py-1 file:text-xs file:font-semibold hover:file:bg-primary/20 text-xs w-full bg-background"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-px bg-border flex-1"></div>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">O pega una URL</span>
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <Input 
                          type="url" 
                          placeholder="https://ejemplo.com/logo.png" 
                          value={formData.image_url.startsWith("http") ? formData.image_url : ""}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          className="text-xs h-8 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-2">Guardar Marca</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">Cargando marcas...</TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">No hay marcas registradas.</TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    {brand.image_url ? (
                      <div className="h-8 w-12 bg-white rounded flex items-center justify-center p-0.5 border">
                        <img src={brand.image_url} alt={brand.name} className="max-h-full max-w-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-8 w-12 bg-muted/50 rounded flex items-center justify-center border border-dashed text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold uppercase tracking-wide">{brand.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(brand)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(brand.id, brand.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
