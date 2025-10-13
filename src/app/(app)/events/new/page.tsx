"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FloatingTextField from "@/components/ui/floating-text-field";
import MarkdownEditor from "@/components/ui/markdown-editor";
import { MapPin, Building2, Calendar, Clock, Tag, Users, Waypoints } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { GradientHeader } from "@/components/ui/gradient-header";
import { useCreateEvent } from "@/lib/queries/events";
import { uploadEventCover } from "@/lib/api/events";
import { toast } from "sonner";
import AddressSearch from "@/components/events/address-search";
import TagInput from "@/components/ui/tag-input";
import { SPORTS_SUGGESTIONS } from "@/lib/constants/sports";

const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(10000).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  locationLat: z.coerce.number().optional(),
  locationLng: z.coerce.number().optional(),
  locationStreet: z.string().optional(),
  locationNumber: z.string().optional(),
  locationNeighborhood: z.string().optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  locationZipCode: z.string().optional(),
  locationCountry: z.string().optional(),
  capacity: z.coerce.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

export default function NewEventPage() {
  const router = useRouter();
  const createMutation = useCreateEvent();
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const form = useForm<z.infer<typeof schema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { visibility: "PUBLIC", tags: [] },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const payload = { ...values, tags };
      const res = await createMutation.mutateAsync(payload);
      toast.success("Evento criado");
      if (file) {
        try { await uploadEventCover(res.event.id, file); } catch {}
      }
      router.replace(`/events/${res.event.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Falha ao criar evento";
      if (msg.includes("VERIFICATION_REQUIRED")) {
        toast.error("Verifique seu email ou telefone para continuar");
        router.push("/verify-email");
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <GradientHeader height="sm" />
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <PageHeader title="Criar evento" />
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Local do evento</h3>
            <AddressSearch
              onSelect={(s) => {
                form.setValue("locationAddress", s.label);
                form.setValue("locationLat", s.lat);
                form.setValue("locationLng", s.lng);
                form.setValue("locationName", s.address.road || s.address.neighbourhood || s.address.city || "");
                form.setValue("locationStreet", s.address.road);
                form.setValue("locationNeighborhood", s.address.neighbourhood);
                form.setValue("locationCity", s.address.city || "");
                form.setValue("locationState", s.address.state || "");
                form.setValue("locationZipCode", s.address.postcode || "");
                form.setValue("locationCountry", "Brasil");
              }}
              placeholder="Buscar endereço do evento"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FloatingTextField label="Nome do local" leftIcon={<Building2 size={18} />} {...form.register("locationName")} />
              <FloatingTextField label="Endereço" leftIcon={<MapPin size={18} />} {...form.register("locationAddress")} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FloatingTextField label="Logradouro" leftIcon={<Waypoints size={18} />} {...form.register("locationStreet")} />
              <FloatingTextField label="Número" {...form.register("locationNumber")} />
              <FloatingTextField label="Bairro" {...form.register("locationNeighborhood")} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FloatingTextField label="Cidade" {...form.register("locationCity")} />
              <FloatingTextField label="Estado (UF)" {...form.register("locationState")} />
              <FloatingTextField label="CEP" {...form.register("locationZipCode")} />
            </div>
            <input type="hidden" {...form.register("locationLat", { valueAsNumber: true })} />
            <input type="hidden" {...form.register("locationLng", { valueAsNumber: true })} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FloatingTextField type="number" label="Capacidade" leftIcon={<Users size={18} />} {...form.register("capacity")} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Informações do evento</h3>
            <FloatingTextField label="Nome do evento" leftIcon={<Tag size={18} />} {...form.register("title")} />
            <div className="space-y-1">
              <label className="text-sm flex items-center gap-2">
                <Tag size={16} />
                Modalidades esportivas
              </label>
              <TagInput
                value={tags}
                onChange={setTags}
                suggestions={SPORTS_SUGGESTIONS}
                placeholder="Digite e pressione Enter ou selecione..."
                maxTags={5}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Descrição</label>
              <MarkdownEditor
                value={form.watch("description") || ""}
                onChange={(v) => form.setValue("description", v)}
                placeholder="Descreva seu evento em Markdown..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm">Data (início)</label>
                <FloatingTextField type="date" label="Data" leftIcon={<Calendar size={18} />} {...form.register("startDate")} />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Hora (início)</label>
                <FloatingTextField type="time" label="Hora" leftIcon={<Clock size={18} />} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm">Data (término opcional)</label>
                <FloatingTextField type="date" label="Data" leftIcon={<Calendar size={18} />} {...form.register("endDate")} />
              </div>
              <div className="space-y-1">
                <label className="text-sm">Hora (término opcional)</label>
                <FloatingTextField type="time" label="Hora" leftIcon={<Clock size={18} />} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm">Visibilidade</label>
              <select className="border rounded-lg px-3 py-2 bg-secondary" {...form.register("visibility")}>
                <option value="PUBLIC">Pública</option>
                <option value="PRIVATE">Privada</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="text-sm">Imagem de capa (opcional)</div>
              <div className="border border-dashed rounded-lg p-6 text-center space-y-3">
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {file && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={URL.createObjectURL(file)} alt="preview" className="mx-auto max-h-48 rounded-lg" />
                )}
              </div>
            </div>
          </section>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => router.push("/events")}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>Salvar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
