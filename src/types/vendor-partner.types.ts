export type VendorPriceTier = "budget" | "standard" | "premium" | "luxury";
export type VendorPartnerStatus = "pending" | "approved" | "rejected" | "suspended";

export interface VendorPackageItem {
  id: string;
  partner_id: string;
  package_name: string;
  price: number;
  capacity_pax?: number | null;
  features_include?: string[];
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface VendorPartnerItem {
  id: string;
  user_id?: string | null;
  company_name: string;
  category: string;
  city: string;
  province: string;
  price_tier: VendorPriceTier;
  min_price: number;
  max_price: number;
  capacity_pax?: number | null;
  style_tags?: string[];
  pic_name: string;
  phone: string;
  sanitized_phone: string;
  email: string;
  website_url?: string | null;
  description?: string | null;
  logo_r2_key?: string | null;
  pricelist_r2_key?: string | null;
  status: VendorPartnerStatus;
  rejection_reason?: string | null;
  rating_avg: number;
  reviews_count: number;
  is_verified: boolean;
  packages?: VendorPackageItem[];
  created_at: string;
  updated_at: string;
}

export interface RegisterVendorPartnerInput {
  companyName: string;
  category: string;
  city: string;
  province: string;
  picName: string;
  phone: string;
  email: string;
  password?: string;
}

export interface CreateVendorPackageInput {
  packageName: string;
  price: number;
  capacityPax?: number;
  featuresInclude?: string[];
  description?: string;
}
