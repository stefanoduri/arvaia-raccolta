
import { HarvestData } from '../types';

const parseIT = (val: string): number => {
  if (!val) return 0;
  const cleaned = val.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const parseHarvestTSV = (tsv: string): HarvestData[] => {
  const lines = tsv.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
  
  const getIdx = (key: string) => headers.findIndex(h => h.includes(key));

  const idxData = getIdx('data');
  const idxProd = getIdx('prodotto');
  const idxPeso = getIdx('peso_kg');
  const idxSett = getIdx('settimana');
  const idxTMed = getIdx('temperatura media');
  const idxTMax = getIdx('temperatura massima');
  const idxTMin = getIdx('temperatura minima');
  const idxPrec = getIdx('precipitazioni');

  return lines.slice(1).map(line => {
    const cols = line.split('\t');
    return {
      data: cols[idxData] || '',
      prodotto: (cols[idxProd] || '').trim().toLowerCase(),
      pesoKg: parseIT(cols[idxPeso]),
      settimana: parseInt(cols[idxSett]) || 0,
      tempMedia: parseIT(cols[idxTMed]),
      tempMassima: parseIT(cols[idxTMax]),
      tempMinima: parseIT(cols[idxTMin]),
      precipitazioni: parseIT(cols[idxPrec])
    };
  });
};

export const getMonday = (week: number): string => {
  // Per il 2025, la settimana 1 inizia lunedì 30 Dicembre 2024
  const start = new Date(2024, 11, 30);
  const target = new Date(start);
  target.setDate(start.getDate() + (week - 1) * 7);
  return target.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
};

export const formatWeek = (w: number) => `S${w.toString().padStart(2, '0')}`;
