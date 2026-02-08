
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  Thermometer, 
  CloudRain, 
  Calendar,
  TrendingUp,
  Scale
} from 'lucide-react';
import { HarvestData, WeeklyHarvestRow } from './types';
import { parseHarvestTSV, getMonday, formatWeek } from './utils/dataParser';
import { RAW_HARVEST_TSV } from './constants/rawData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, Legend, ReferenceArea
} from 'recharts';

const App: React.FC = () => {
  const [data, setData] = useState<HarvestData[]>([]);
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [searchWeek, setSearchWeek] = useState<string>('');

  useEffect(() => {
    setData(parseHarvestTSV(RAW_HARVEST_TSV));
  }, []);

  const uniqueProducts = useMemo(() => 
    Array.from(new Set(data.map(d => d.prodotto))).sort()
  , [data]);

  const uniqueWeeks = useMemo(() => {
    const weeks = Array.from(new Set(data.map(d => d.settimana))).sort((a,b) => a-b);
    return weeks.map(w => ({
      val: w.toString(),
      label: `${formatWeek(w)} (Lun ${getMonday(w)})`
    }));
  }, [data]);

  // Highlight logic: week + 2 previous
  const highlightedWeeks = useMemo(() => {
    const set = new Set<number>();
    if (searchWeek) {
      const w = parseInt(searchWeek);
      set.add(w); set.add(w-1); set.add(w-2);
    } else if (searchProduct) {
      data.filter(d => d.prodotto === searchProduct).forEach(d => {
        set.add(d.settimana); set.add(d.settimana-1); set.add(d.settimana-2);
      });
    }
    return set;
  }, [searchProduct, searchWeek, data]);

  const annualStats = useMemo(() => {
    const weeksMap = new Map<number, any>();
    for (let i = 1; i <= 53; i++) {
      weeksMap.set(i, { 
        name: formatWeek(i), 
        num: i, 
        peso: 0, 
        tMed: 0, tMax: 0, tMin: 0, precip: 0, count: 0 
      });
    }

    data.forEach(d => {
      const w = weeksMap.get(d.settimana);
      if (w) {
        if (searchProduct === '' || d.prodotto === searchProduct) {
          w.peso += d.pesoKg;
        }
        w.tMed += d.tempMedia;
        w.tMax += d.tempMassima;
        w.tMin += d.tempMinima;
        w.precip += d.precipitazioni;
        w.count += 1;
      }
    });

    return Array.from(weeksMap.values()).map(w => ({
      ...w,
      tMed: w.count > 0 ? Number((w.tMed / w.count).toFixed(1)) : null,
      tMax: w.count > 0 ? Number((w.tMax / w.count).toFixed(1)) : null,
      tMin: w.count > 0 ? Number((w.tMin / w.count).toFixed(1)) : null,
      precip: w.count > 0 ? Number((w.precip / w.count).toFixed(1)) : null,
    }));
  }, [data, searchProduct]);

  const weeklyTableData = useMemo((): WeeklyHarvestRow[] => {
    if (!searchWeek) return [];
    const wNum = parseInt(searchWeek);
    const weeklyMap = new Map<string, number>();
    const annualMap = new Map<string, number>();

    data.forEach(d => {
      annualMap.set(d.prodotto, (annualMap.get(d.prodotto) || 0) + d.pesoKg);
      if (d.settimana === wNum) {
        weeklyMap.set(d.prodotto, (weeklyMap.get(d.prodotto) || 0) + d.pesoKg);
      }
    });

    return Array.from(weeklyMap.entries()).map(([prod, kg]) => {
      const totAnnuo = annualMap.get(prod) || 0;
      return {
        prodotto: prod,
        kgSettimana: kg,
        kgTotaleAnnuo: totAnnuo,
        percentuale: Number(((kg / totAnnuo) * 100).toFixed(1))
      };
    }).sort((a,b) => b.kgSettimana - a.kgSettimana);
  }, [data, searchWeek]);

  const totalAnnualWeight = useMemo(() => 
    annualStats.reduce((acc, curr) => acc + curr.peso, 0)
  , [annualStats]);

  // Componente per evidenziare le aree del grafico a linee
  const renderHighlightAreas = () => {
    const areas: React.ReactNode[] = [];
    const sortedWeeks = Array.from(highlightedWeeks).sort((a, b) => a - b);
    
    if (sortedWeeks.length === 0) return null;

    // Raggruppa settimane consecutive per creare aree di sfondo coerenti
    let start = sortedWeeks[0];
    for (let i = 0; i < sortedWeeks.length; i++) {
      if (i === sortedWeeks.length - 1 || sortedWeeks[i + 1] !== sortedWeeks[i] + 1) {
        areas.push(
          <ReferenceArea 
            key={`area-${start}-${sortedWeeks[i]}`}
            x1={formatWeek(start)} 
            x2={formatWeek(sortedWeeks[i])} 
            fill="#fef3c7" 
            fillOpacity={0.5} 
          />
        );
        if (i < sortedWeeks.length - 1) start = sortedWeeks[i + 1];
      }
    }
    return areas;
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, num } = props;
    const isHighlighted = highlightedWeeks.has(num);
    return (
      <rect 
        x={x} y={y} width={width} height={height} 
        fill={isHighlighted ? props.fill : '#e2e8f0'} 
        rx={2}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 p-2 rounded-xl">
              <Sprout className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Arvaia <span className="text-amber-600">Distribuzione 2025</span></h1>
          </div>
          <div className="text-slate-400 text-xs font-medium uppercase tracking-widest hidden md:block">
            Monitoraggio Raccolto e Clima
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-3">
                  <TrendingUp className="w-3.5 h-3.5" /> Analisi Prodotto
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer transition-all"
                  value={searchProduct}
                  onChange={(e) => {
                    setSearchProduct(e.target.value);
                    setSearchWeek('');
                  }}
                >
                  <option value="">Scegli un prodotto...</option>
                  {uniqueProducts.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-300 font-bold">oppure</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-3">
                  <Calendar className="w-3.5 h-3.5" /> Analisi Settimana
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer transition-all"
                  value={searchWeek}
                  onChange={(e) => {
                    setSearchWeek(e.target.value);
                    setSearchProduct('');
                  }}
                >
                  <option value="">Scegli una settimana...</option>
                  {uniqueWeeks.map(w => <option key={w.val} value={w.val}>{w.label}</option>)}
                </select>
              </div>

              {(searchProduct || searchWeek) && (
                <button 
                  onClick={() => { setSearchProduct(''); setSearchWeek(''); }}
                  className="w-full py-3 text-xs font-bold text-amber-700 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors"
                >
                  RESET FILTRI
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Focus Clima</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200"></div>
                  <span className="text-xs font-medium text-slate-600">Periodo di Raccolta (+2 sett)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-xs font-medium text-slate-600">Temp Massima</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-xs font-medium text-slate-600">Temp Media</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-xs font-medium text-slate-600">Temp Minima</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3 space-y-8">
            
            {searchProduct && (
              <div className="bg-amber-600 p-8 rounded-3xl text-white shadow-lg shadow-amber-200 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <h2 className="text-4xl font-black uppercase mb-1">{searchProduct}</h2>
                  <p className="text-amber-100 text-sm font-medium">Analisi resa annuale e trend meteo</p>
                </div>
                <div className="bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md text-center min-w-[160px]">
                  <p className="text-xs font-bold uppercase text-amber-200 mb-1">Peso Totale Annuo</p>
                  <p className="text-3xl font-black">{totalAnnualWeight.toLocaleString('it-IT')} <span className="text-lg font-normal opacity-80">kg</span></p>
                </div>
              </div>
            )}

            {searchWeek && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-amber-100 p-3 rounded-2xl">
                    <Scale className="text-amber-600 w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Dettaglio Raccolto {uniqueWeeks.find(u => u.val === searchWeek)?.label}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="text-left py-4 font-bold uppercase tracking-wider">Prodotto</th>
                        <th className="text-right py-4 font-bold uppercase tracking-wider">Kg in Settimana</th>
                        <th className="text-right py-4 font-bold uppercase tracking-wider">Totale 2025</th>
                        <th className="text-right py-4 font-bold uppercase tracking-wider">% Incidenza</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {weeklyTableData.map((row) => (
                        <tr key={row.prodotto} className="group hover:bg-amber-50/30 transition-colors">
                          <td className="py-4 font-bold text-slate-700 capitalize">{row.prodotto}</td>
                          <td className="py-4 text-right font-black text-amber-600">{row.kgSettimana.toLocaleString('it-IT')} kg</td>
                          <td className="py-4 text-right font-medium text-slate-500">{row.kgTotaleAnnuo.toLocaleString('it-IT')} kg</td>
                          <td className="py-4 text-right">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                              {row.percentuale}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {searchProduct && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-[450px]">
                <h3 className="text-sm font-bold uppercase text-slate-400 mb-8 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" /> Resa Settimanale (kg)
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={annualStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:10}} interval={2} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:10}} tickFormatter={(v)=>`${v}kg`} />
                    <Tooltip 
                      cursor={{fill:'#fffbeb'}}
                      contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="peso" fill="#d97706" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              {/* TEMPERATURE A LINEE */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-[450px]">
                <h3 className="text-sm font-bold uppercase text-slate-400 mb-8 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" /> Andamento Temperature (°C)
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={annualStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:10}} interval={2} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:10}} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                    {renderHighlightAreas()}
                    <Line type="monotone" dataKey="tMax" name="Max" stroke="#f87171" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="tMed" name="Media" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="tMin" name="Min" stroke="#60a5fa" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* PRECIPITAZIONI A BARRE */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-[400px]">
                <h3 className="text-sm font-bold uppercase text-slate-400 mb-8 flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-cyan-600" /> Precipitazioni Settimanali (mm)
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={annualStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:10}} interval={2} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:10}} />
                    <Tooltip 
                      cursor={{fill:'#f0f9ff'}}
                      contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                    />
                    <Bar dataKey="precip" name="Pioggia" fill="#0891b2" radius={[4, 4, 0, 0]} barSize={20} shape={<CustomBar fill="#0891b2" />} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {!searchProduct && !searchWeek && (
              <div className="h-[500px] bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 transition-all hover:border-amber-200 hover:bg-amber-50/10">
                <div className="bg-slate-50 p-6 rounded-full mb-6 ring-8 ring-white shadow-sm">
                  <Sprout className="w-16 h-16 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-700 mb-3">Arvaia Distribuzione Insights</h2>
                <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                  Utilizza la sidebar per esplorare i dati della raccolta 2025. 
                  Il sistema evidenzierà automaticamente i periodi di raccolta nei grafici climatici per aiutarti a individuare correlazioni.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest shadow-sm">Resa Annuale</div>
                  <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest shadow-sm">Temperature Lineari</div>
                  <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest shadow-sm">Piovosità</div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
