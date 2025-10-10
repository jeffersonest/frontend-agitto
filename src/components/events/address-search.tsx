"use client";
import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { searchAddressNominatim, searchViaCep, type AddressSuggestion } from "@/lib/geocoding/nominatim";
import { Input } from "@/components/ui/input";

type Props = {
  onSelect: (s: AddressSuggestion) => void;
  placeholder?: string;
};

export default function AddressSearch({ onSelect, placeholder }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(q, 400);

  async function doSearch(value: string) {
    if (!value || value.length < 3) { setResults([]); return; }
    try {
      setLoading(true);
      let r: AddressSuggestion[] = [];
      const cepMatch = value.replace(/\s/g, "").match(/^\d{5}-?\d{3}$/);
      if (cepMatch) {
        const s = await searchViaCep(value);
        if (s) r = [s];
      } else {
        r = await searchAddressNominatim(`${value}, Brasil`);
      }
      setResults(r);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (debounced && debounced.length >= 3) doSearch(debounced);
    else setResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative">
      <Input
        value={q}
        onChange={(e) => { setQ(e.target.value); }}
        placeholder={placeholder || "Buscar endereço"}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border bg-background shadow-lg max-h-60 overflow-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              className="block w-full text-left px-3 py-2 text-sm hover:bg-secondary"
              onClick={() => { onSelect(r); setOpen(false); setQ(r.label); }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
