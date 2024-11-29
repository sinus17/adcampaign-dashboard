export interface Customer {
  id: string;
  kontakt: string;
  telefon: string;
  whatsappGroupLink?: string;
  reportsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  kontakt: string;
  telefon: string;
  whatsappGroupLink?: string;
}