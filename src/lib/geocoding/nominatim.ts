export type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

export type AddressSuggestion = {
  label: string;
  lat: number;
  lng: number;
  address: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

export async function searchAddressNominatim(query: string, countryCodes = "br"): Promise<AddressSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("q", query);
  if (countryCodes) url.searchParams.set("countrycodes", countryCodes);

  const res = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "Accept-Language": "pt-BR",
      "User-Agent": "AgittoFrontend/1.0 (https://agitto.com)"
    },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return data.map((r) => toSuggestion(r));
}

export function toSuggestion(r: NominatimResult): AddressSuggestion {
  const addr = r.address || {} as any;

  const street = addr.road;
  const number = addr.house_number;
  const neighborhood = addr.neighbourhood || addr.suburb;
  const city = addr.city || addr.town || addr.village || addr.municipality;
  const state = addr.state;

  const parts: string[] = [];

  if (street) {
    parts.push(number ? `${street}, ${number}` : street);
  }

  if (neighborhood && neighborhood !== city) {
    parts.push(neighborhood);
  }

  if (city) {
    parts.push(city);
  }

  if (state && !parts.some(p => p?.includes(state))) {
    const stateAbbr = state.length > 2 ? state.substring(0, 2).toUpperCase() : state;
    parts.push(stateAbbr);
  }

  return {
    label: parts.join(" - "),
    lat: Number(r.lat),
    lng: Number(r.lon),
    address: {
      road: street,
      house_number: number,
      neighbourhood: neighborhood,
      city: city,
      state: state,
      postcode: addr.postcode,
      country: addr.country,
    },
  };
}

export async function geocodeAddressString(q: string): Promise<AddressSuggestion | null> {
  const list = await searchAddressNominatim(q, "br");
  return list[0] || null;
}

export async function searchViaCep(cep: string): Promise<AddressSuggestion | null> {
  const clean = cep.replace(/\D/g, "");
  if (!/^\d{8}$/.test(clean)) return null;
  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!res.ok) return null;
  const d = await res.json();
  if (d.erro) return null;
  const labelBase = [d.logradouro, d.bairro, d.localidade, d.uf, d.cep].filter(Boolean).join(" - ");
  const geo = await geocodeAddressString(`${d.logradouro}, ${d.localidade} - ${d.uf}, Brasil`);
  return {
    label: labelBase,
    lat: geo?.lat ?? 0,
    lng: geo?.lng ?? 0,
    address: {
      road: d.logradouro,
      house_number: "",
      neighbourhood: d.bairro,
      city: d.localidade,
      state: d.uf,
      postcode: d.cep,
      country: "Brasil",
    },
  };
}

