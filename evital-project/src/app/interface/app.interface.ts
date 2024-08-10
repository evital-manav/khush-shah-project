/* ==================================================== ALL IMPORTANT NEEDED INTERFACES ARE PLACED HERE ==================================================== */

// USER
export interface User {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cart?: Medicine[]; // NEEDED FOR JSON SERVER
}

// MEDICINE
export interface Medicine {
  quantity:number,
  medicine_name: string,
  medicine_id :string,
  price:number,
  medicine_category: string,
  mrp:Number,
  content:string,
  manufacturer_name:string,
  packing_size:string,
  batch_number: string;
  expiry_date: string;
  discount?: number;
  id:string,
  in_stock?: string; // FOR CHECKING AVAILABILITY
}

// SEARCH MEDICINE API - PAYLOAD (REQ)
export interface SearchMedicinesPayload{
  apikey: string,
  searchstring :string,
}

// SEARCH MEDICINE API - RESPONSE (RES)
export interface SearchMedicinesResponse {
  datetime: string,
  status_code: string,
  status_message: string,
  data: {
    did_you_mean_result: any[];
    result: Medicine[];
  }
}

// CART
export interface Cart {
  id?: number;
  userId: number;
  items: Medicine[];
}

// PLACE ORDER
export interface Order {
  id?: number;
  medicine_name: string;
  medicine_id: string;
  batch_number: string;
  expiry_date: string;
  mrp: number;
  quantity: number;
  discount?: number;
  total_amount: number;
  customer_name: string;
  user_name: string;
  order_date: string;
}
