export interface Address {
  id?: string;
  warehouse_name?: string;
  phone: string;
  email?: string;
  pickup_address: string;
  pickup_city: string;
  pickup_pincode: string;
  pickup_state: string;
  pickup_country: string;
  return_address?: string;
  return_city?: string;
  return_state?: string;
  return_pincode?: string;
  return_country?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isBillingSameAsShipping: boolean;
  billingAddress?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface ItemDetails {
  id?: string;
  name: string;
  sku?: string;
  category: string;
  price: number | null;      // ← allow empty
  taxType?: string;
  discount?: number | null;
  discountType?: 'percent' | 'amount';
  imageUrl?: string;
  quantity?: number | null;
  weight?: number | null;
  length?: number | null;
  breadth?: number | null;
  height?: number | null;
}


export interface PincodeServiceability {
  pincode: string;
  city: string;
  district: string;
  state_code: string;
  country_code: string;
  is_serviceable: boolean;
  services: {
    cash_on_delivery: boolean;
    prepaid: boolean;
    pickup_available: boolean;
    cash_collection: boolean;
    replacement: boolean;
  };
  delivery_info: {
    is_out_of_delivery: boolean;
    max_weight: number;
    max_amount: number;
    sort_code: string;
    sunday_delivery: boolean;
  };
  additional_info: {
    covid_zone: string;
    remarks: string;
    protect_blacklist: string;
    inc: string;
  };
}