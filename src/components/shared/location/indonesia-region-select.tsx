"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchProvinces,
  fetchRegencies,
  formatRegionName,
  RegionItem,
} from "@/lib/location/indonesia-regions";
import { Search } from "lucide-react";

interface IndonesiaRegionSelectProps {
  provinceName: string;
  cityName: string;
  onProvinceChange: (name: string) => void;
  onCityChange: (name: string) => void;
  disabled?: boolean;
}

export function IndonesiaRegionSelect({
  provinceName,
  cityName,
  onProvinceChange,
  onCityChange,
  disabled = false,
}: IndonesiaRegionSelectProps) {
  const [provinces, setProvinces] = React.useState<RegionItem[]>([]);
  const [regencies, setRegencies] = React.useState<RegionItem[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = React.useState<string>("");
  const [loadingProvinces, setLoadingProvinces] = React.useState(false);
  const [loadingRegencies, setLoadingRegencies] = React.useState(false);

  // Search filter states inside dropdowns
  const [provSearch, setProvSearch] = React.useState("");
  const [citySearch, setCitySearch] = React.useState("");

  React.useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true);
      const data = await fetchProvinces();
      setProvinces(data);
      setLoadingProvinces(false);

      if (provinceName) {
        const found = data.find(
          (p) => formatRegionName(p.name).toLowerCase() === provinceName.toLowerCase()
        );
        if (found) {
          setSelectedProvinceId(found.id);
        }
      }
    }
    loadProvinces();
  }, [provinceName]);

  React.useEffect(() => {
    if (!selectedProvinceId) {
      setRegencies([]);
      return;
    }

    async function loadRegencies() {
      setLoadingRegencies(true);
      const data = await fetchRegencies(selectedProvinceId);
      setRegencies(data);
      setLoadingRegencies(false);
    }
    loadRegencies();
  }, [selectedProvinceId]);

  function handleProvinceSelect(provId: string) {
    setSelectedProvinceId(provId);
    const item = provinces.find((p) => p.id === provId);
    if (item) {
      const formattedProv = formatRegionName(item.name);
      onProvinceChange(formattedProv);
    }
    onCityChange("");
    setProvSearch("");
  }

  function handleCitySelect(cityNameVal: string) {
    onCityChange(cityNameVal);
    setCitySearch("");
  }

  const filteredProvinces = provinces.filter((p) =>
    formatRegionName(p.name).toLowerCase().includes(provSearch.toLowerCase())
  );

  const filteredRegencies = regencies.filter((r) =>
    formatRegionName(r.name).toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* PROVINSI SEARCHABLE SELECT */}
      <div className="space-y-1">
        <label className="text-xs font-medium">Provinsi *</label>
        <Select
          value={selectedProvinceId}
          onValueChange={handleProvinceSelect}
          disabled={disabled || loadingProvinces}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue
              placeholder={loadingProvinces ? "Memuat Provinsi..." : "Pilih Provinsi..."}
            />
          </SelectTrigger>
          <SelectContent className="max-h-64 p-1">
            <div className="p-1 pb-2 sticky top-0 bg-popover z-10 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari nama provinsi..."
                  value={provSearch}
                  onChange={(e) => setProvSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
            {filteredProvinces.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Provinsi tidak ditemukan
              </div>
            ) : (
              filteredProvinces.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">
                  {formatRegionName(p.name)}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* KOTA / KABUPATEN SEARCHABLE SELECT */}
      <div className="space-y-1">
        <label className="text-xs font-medium">Kota / Kabupaten *</label>
        <Select
          value={cityName}
          onValueChange={handleCitySelect}
          disabled={disabled || !selectedProvinceId || loadingRegencies}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue
              placeholder={
                !selectedProvinceId
                  ? "Pilih Provinsi Dulu"
                  : loadingRegencies
                  ? "Memuat Kota/Kab..."
                  : "Pilih Kota / Kab..."
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-64 p-1">
            <div className="p-1 pb-2 sticky top-0 bg-popover z-10 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari nama kota/kab..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
            {filteredRegencies.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Kota/Kabupaten tidak ditemukan
              </div>
            ) : (
              filteredRegencies.map((r) => {
                const formattedName = formatRegionName(r.name);
                return (
                  <SelectItem key={r.id} value={formattedName} className="text-xs">
                    {formattedName}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
