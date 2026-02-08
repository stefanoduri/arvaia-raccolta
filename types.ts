
export interface HarvestData {
  data: string;
  prodotto: string;
  pesoKg: number;
  settimana: number;
  tempMedia: number;
  tempMassima: number;
  tempMinima: number;
  precipitazioni: number;
}

export interface ProductStats {
  settimanaLabel: string;
  settimanaNum: number;
  pesoKg: number;
  tempMed: number;
  tempMax: number;
  tempMin: number;
  precip: number;
}

export interface WeeklyHarvestRow {
  prodotto: string;
  kgSettimana: number;
  kgTotaleAnnuo: number;
  percentuale: number;
}
