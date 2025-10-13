"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useEvent } from "@/lib/queries/events";
import { updateEvent, uploadEventCover } from "@/lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientHeader } from "@/components/ui/gradient-header";
import FloatingTextField from "@/components/ui/floating-text-field";
import MarkdownEditor from "@/components/ui/markdown-editor";
import AddressSearch from "@/components/events/address-search";
import { MapPin, Building2, Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { composeISO } from "@/lib/events/format";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data, isLoading } = useEvent(id);
  const router = useRouter();
  const ev = data?.event;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [capacity, setCapacity] = useState<number | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!ev) return;
    setTitle(ev.title || "");
    setDescription(ev.description || "");
    const sd = new Date(ev.startDate);
    if (!isNaN(sd.getTime())) { setStartDate(sd.toISOString().slice(0,10)); setStartTime(sd.toTimeString().slice(0,5)); }
    if (ev.endDate) {
      const ed = new Date(ev.endDate);
      if (!isNaN(ed.getTime())) { setEndDate(ed.toISOString().slice(0,10)); setEndTime(ed.toTimeString().slice(0,5)); }
    }
    setLocationName(ev.locationName || "");
    setLocationAddress(ev.locationAddress || "");
    setLat(ev.locationLat ?? undefined);
    setLng(ev.locationLng ?? undefined);
    setCapacity(ev.capacity ?? undefined);
  }, [ev]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      type UpdatePayload = {
        title: string;
        description: string;
        startDate?: string;
        endDate?: string;
        locationName: string;
        locationAddress: string;
        locationLat?: number;
        locationLng?: number;
        capacity?: number;
      };
      const payload: UpdatePayload = {
        title,
        description,
        startDate: composeISO(startDate, startTime),
        endDate: composeISO(endDate, endTime),
        locationName,
        locationAddress,
        locationLat: lat,
        locationLng: lng,
        capacity,
      };
      await updateEvent(id, payload);
      if (file) await uploadEventCover(id, file);
      toast.success("Evento atualizado");
      router.replace(`/events/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao atualizar evento";
      toast.error(msg);
    }
  }

  if (isLoading || !ev) return <div className="p-6">Carregando…</div>;

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
      <GradientHeader height="sm" />
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Editar evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Local do evento</h3>
              <AddressSearch
                onSelect={(s) => {
                  setLocationAddress(s.label);
                  setLat(s.lat);
                  setLng(s.lng);
                  setLocationName(s.address.road || s.address.neighbourhood || s.address.city || "");
                }}
                placeholder="Buscar endereço do evento"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FloatingTextField label="Nome do local" leftIcon={<Building2 size={18} />} value={locationName} onChange={(e) => setLocationName(e.target.value)} />
                <FloatingTextField label="Endereço" leftIcon={<MapPin size={18} />} value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
              </div>
              <input type="hidden" value={lat ?? ""} readOnly />
              <input type="hidden" value={lng ?? ""} readOnly />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FloatingTextField type="number" label="Capacidade" value={capacity ?? ""} onChange={(e) => setCapacity(Number(e.target.value))} leftIcon={<Users size={18} />} />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Informações do evento</h3>
              <FloatingTextField label="Nome do evento" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="space-y-1">
                <label className="text-sm">Descrição</label>
                <MarkdownEditor
                  value={description || ""}
                  onChange={(v) => setDescription(v)}
                  placeholder="Descreva seu evento em Markdown..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm">Data (início)</label>
                  <FloatingTextField type="date" label="Data" value={startDate} onChange={(e) => setStartDate(e.target.value)} leftIcon={<Calendar size={18} />} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm">Hora (início)</label>
                  <FloatingTextField type="time" label="Hora" value={startTime} onChange={(e) => setStartTime(e.target.value)} leftIcon={<Clock size={18} />} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm">Data (término opcional)</label>
                  <FloatingTextField type="date" label="Data" value={endDate} onChange={(e) => setEndDate(e.target.value)} leftIcon={<Calendar size={18} />} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm">Hora (término opcional)</label>
                  <FloatingTextField type="time" label="Hora" value={endTime} onChange={(e) => setEndTime(e.target.value)} leftIcon={<Clock size={18} />} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">Imagem de capa</div>
                <div className="border border-dashed rounded-lg p-6 text-center space-y-3">
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {(file || ev.coverImageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file ? URL.createObjectURL(file) : (ev.coverImageUrl as string)} alt="preview" className="mx-auto max-h-48 rounded-lg" />
                  )}
                </div>
              </div>
            </section>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => router.push(`/events/${id}`)}>Cancelar</Button>
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
