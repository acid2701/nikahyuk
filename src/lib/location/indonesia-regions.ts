export interface RegionItem {
  id: string;
  name: string;
}

const FALLBACK_PROVINCES: RegionItem[] = [
  { id: "31", name: "DKI JAKARTA" },
  { id: "32", name: "JAWA BARAT" },
  { id: "33", name: "JAWA TENGAH" },
  { id: "34", name: "DI YOGYAKARTA" },
  { id: "35", name: "JAWA TIMUR" },
  { id: "36", name: "BANTEN" },
  { id: "51", name: "BALI" },
  { id: "12", name: "SUMATERA UTARA" },
  { id: "13", name: "SUMATERA BARAT" },
  { id: "73", name: "SULAWESI SELATAN" },
];

export async function fetchProvinces(): Promise<RegionItem[]> {
  try {
    const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
    if (!res.ok) throw new Error("Failed fetching provinces");
    const data: RegionItem[] = await res.json();
    return data;
  } catch (err) {
    console.warn("Indonesia Region API fallback used:", err);
    return FALLBACK_PROVINCES;
  }
}

export async function fetchRegencies(provinceId: string): Promise<RegionItem[]> {
  if (!provinceId) return [];
  try {
    const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
    if (!res.ok) throw new Error("Failed fetching regencies");
    const data: RegionItem[] = await res.json();
    return data;
  } catch (err) {
    console.warn("Indonesia Regencies API fallback used:", err);
    return [];
  }
}

export function formatRegionName(rawName: string): string {
  if (!rawName) return "";
  return rawName
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
    .replace(/KOTA /i, "Kota ")
    .replace(/KABUPATEN /i, "Kab. ");
}
