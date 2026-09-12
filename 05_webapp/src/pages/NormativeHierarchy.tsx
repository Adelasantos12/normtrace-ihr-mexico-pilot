import { useMemo, useState } from 'react';
import { useCsvData } from '../hooks/useData';
import { Scale, Globe, ChevronDown, ChevronRight, Info, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

// Tier configuration
const TIERS = [
  {
    id: 'constitutional',
    level: 1,
    label: 'Constitutional',
    sublabel: 'Constitución Política de los Estados Unidos Mexicanos (CPEUM)',
    color: 'bg-blue-900 text-white',
    border: 'border-blue-900',
    light: 'bg-blue-50 border-blue-200',
    text: 'text-blue-900',
    width: 'w-1/3',
    description: 'Supreme law of Mexico. All other norms must conform to constitutional provisions and the constitutional bloc. Cannot be amended by ordinary legislative procedure.',
    ihrRelevance: 'Arts. 1 (pro-persona), 4 (right to health), 40 (federal presidential republic), 73(XVI) (congressional health competence), 133 (treaty supremacy) establish the constitutional foundation for IHR implementation.',
    keywords: ['cpeum', 'constitución', 'constitution']
  },
  {
    id: 'statutory',
    level: 2,
    label: 'Statutory',
    sublabel: 'Leyes Generales y Federales',
    color: 'bg-blue-700 text-white',
    border: 'border-blue-700',
    light: 'bg-blue-50 border-blue-100',
    text: 'text-blue-700',
    width: 'w-1/2',
    description: 'Federal and general laws enacted by Congress under constitutional delegation. Bind all levels of government for general laws; federal sphere for federal laws. Primary level for IHR-specific statutory anchoring.',
    ihrRelevance: 'Ley General de Salud (LGS) is the primary IHR statutory framework. LOAPF defines SSA competences. Biosafety and data protection laws address specific IHR obligation clusters.',
    keywords: ['ley', 'lgs', 'loapf', 'lgpdp', 'lfpdp', 'bioseguridad', 'institutos nacionales', 'salud animal']
  },
  {
    id: 'regulatory',
    level: 3,
    label: 'Regulatory',
    sublabel: 'Reglamentos',
    color: 'bg-indigo-600 text-white',
    border: 'border-indigo-600',
    light: 'bg-indigo-50 border-indigo-100',
    text: 'text-indigo-700',
    width: 'w-2/3',
    description: 'Presidential or ministerial regulations implementing statutory provisions. Must remain within statutory limits (ultra vires prohibition). Cannot create new obligations not rooted in statute.',
    ihrRelevance: 'RLGS-SI (1985) is the primary IHR regulatory instrument: governing sanitary measures at points of entry, traveller health documentation, and international health coordination. Published 20 years before IHR 2005.',
    keywords: ['reglamento', 'rlgs', 'ri-ss', 'reglamento interior']
  },
  {
    id: 'sub-regulatory',
    level: 4,
    label: 'Sub-regulatory',
    sublabel: 'NOMs, Acuerdos, Reglamentos Interiores',
    color: 'bg-teal-600 text-white',
    border: 'border-teal-600',
    light: 'bg-teal-50 border-teal-100',
    text: 'text-teal-700',
    width: 'w-5/6',
    description: 'Technical norms (NOMs), administrative agreements, and internal regulations. Lowest rung of the normative hierarchy. Highly flexible but legally weak: cannot substitute for statutory or regulatory anchoring of core obligations.',
    ihrRelevance: 'NOM-017 (epidemiological surveillance) and NOM-032 (vector control) provide technical specifications for specific IHR capacity areas. Administrative agreements supplement inter-institutional coordination.',
    keywords: ['nom', 'norma', 'acuerdo', 'decreto', 'circular', 'imss', 'issste']
  }
];

function inferTier(normTitle: string): string {
  const n = (normTitle || '').toLowerCase();
  for (const tier of TIERS) {
    if (tier.keywords.some(k => n.includes(k))) return tier.id;
  }
  return 'unknown';
}

function getTierByNormTitle(title: string) {
  return TIERS.find(t => t.id === inferTier(title));
}

export default function NormativeHierarchy() {
  const { data: corpus } = useCsvData<any>('mexico_normative_corpus_index_clean.csv');
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [showBloque, setShowBloque] = useState(false);

  const tierStats = useMemo(() => {
    const stats: Record<string, { instruments: any[]; obligationsAnchored: Set<string>; totalAnchoring: number; rowCount: number }> = {};
    TIERS.forEach(t => { stats[t.id] = { instruments: [], obligationsAnchored: new Set(), totalAnchoring: 0, rowCount: 0 }; });

    corpus.forEach((c: any) => {
      const tier = inferTier(c.norm_title || c.norm_id || '');
      if (stats[tier]) stats[tier].instruments.push(c);
    });

    mapping.forEach((m: any) => {
      const tier = inferTier(m.domestic_norm || '');
      if (stats[tier]) {
        stats[tier].obligationsAnchored.add(m.obligation_id);
        stats[tier].totalAnchoring += parseInt(m.anchoring_level) || 0;
        stats[tier].rowCount++;
      }
    });

    return stats;
  }, [corpus, mapping]);

  return (
    <div className="space-y-10 pb-24">
      <header className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-700">
          Mexico's Legal Hierarchy
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Normative Hierarchy</h1>
        <p className="text-lg text-slate-500 max-w-4xl">
          Mexico's legal architecture for IHR implementation: from constitutional foundations to sub-regulatory instruments, with IHR anchoring analysis at each tier.
        </p>
      </header>

      {/* Mexico Constitutional System */}
      <div className="grid md:grid-cols-2 gap-6 border-t-2 border-slate-900 pt-10">
        <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Scale size={22} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Mexico's Constitutional System</h2>
          </div>
          <div className="space-y-4 text-sm">
            {[
              {
                label: 'System of Government',
                value: 'Federal Presidential Republic',
                note: 'Art. 40 CPEUM: representative, democratic, laic, federal'
              },
              {
                label: 'Legal Tradition',
                value: 'Romano-Germanic Civil Law',
                note: 'Written constitution; codified law; judicial precedent (jurisprudencia) has limited binding force'
              },
              {
                label: 'Federal Structure',
                value: '3-tier: Federation + 32 States + Municipalities',
                note: 'Health competences: shared between federation and states (Art. 4 + 73(XVI) CPEUM)'
              },
              {
                label: 'Health Governance',
                value: 'Congressional delegation model',
                note: 'Art. 73(XVI): Congress enacts health laws; Secretaría de Salud as primary executive authority'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{item.label}</div>
                <div className="font-bold text-white">{item.value}</div>
                <div className="text-[10px] text-slate-400">{item.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* International Law Incorporation */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-blue-700" />
              <h3 className="text-lg font-semibold text-blue-900">International Law Incorporation</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white rounded-xl border border-blue-100">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Art. 133 CPEUM: Treaty Supremacy</div>
                <p className="text-xs text-slate-600 leading-relaxed">International treaties signed by the President and ratified by the Senate form part of the supreme law of the Union. IHR (2005) is a binding international instrument under this provision.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-blue-100">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Art. 1 CPEUM: Pro-Persona Principle (2011 Reform)</div>
                <p className="text-xs text-slate-600 leading-relaxed">All persons enjoy the human rights recognised in this Constitution <em>and</em> in international human rights treaties to which Mexico is a party. Norms shall be interpreted to afford the broadest protection to persons. Creates a <strong>constitutional bloc</strong>.</p>
              </div>
            </div>
            <button
              onClick={() => setShowBloque(!showBloque)}
              className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:underline"
            >
              {showBloque ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              What is the Constitutional Bloc?
            </button>
            {showBloque && (
              <div className="p-4 bg-white rounded-xl border border-blue-200 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>The <strong>bloque de constitucionalidad</strong> (constitutional bloc) is the set of norms that, together with the Constitution itself, form the supreme constitutional reference for legal interpretation and validity review. In Mexico after the 2011 reform, it comprises: (1) the CPEUM; (2) international human rights treaties ratified by Mexico. IHR (2005) provisions that embody human rights obligations: including individual rights under Arts. 23-32 (health measures applied to travellers) and Art. 44-45 (confidentiality and data protection): may thus be positioned within the constitutional bloc.</p>
                <p>Practical effect: a domestic norm that restricts rights protected by the IHR must satisfy the pro-persona test: it cannot be interpreted restrictively when a broader interpretation is available.</p>
              </div>
            )}
          </div>

          {/* Key diagnostic finding */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Critical Finding: Tier Mismatch</div>
              <p className="text-xs text-amber-800 leading-relaxed">
                The primary IHR implementation instrument (RLGS-SI, 1985) sits at the <strong>regulatory tier (Level 3)</strong>. IHR 2005 obligations requiring specific procedural design, enforceable actor competences, and rights-safeguard provisions need <strong>statutory anchoring (Level 4-5)</strong>. This tier mismatch is the single most important structural finding from the Mexico pilot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Normative Pyramid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">Normative Hierarchy Pyramid</h2>
        <p className="text-sm text-slate-500">Each tier shows: instruments in corpus · IHR obligations anchored · mean anchoring score</p>

        {/* Visual pyramid */}
        <div className="flex flex-col items-center gap-2 py-4">
          {TIERS.map((tier, i) => {
            const stats = tierStats[tier.id];
            const meanAnchoring = stats.rowCount > 0
              ? (stats.totalAnchoring / stats.rowCount).toFixed(1)
              : '—';
            const isExp = expandedTier === tier.id;

            return (
              <div key={tier.id} className="w-full flex flex-col items-center gap-0">
                <button
                  onClick={() => setExpandedTier(isExp ? null : tier.id)}
                  className="group transition-all"
                  style={{ width: `${(i + 1) * 20 + 20}%` }}
                >
                  <div className={cn(
                    'w-full py-4 px-6 rounded-2xl flex items-center justify-between transition-all',
                    tier.color,
                    isExp ? 'ring-4 ring-blue-300' : 'hover:opacity-90'
                  )}>
                    <div className="text-left">
                      <div className="font-semibold text-base">{tier.label}</div>
                      <div className="text-[10px] opacity-75 font-medium mt-0.5">{tier.sublabel}</div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <div className="text-xl font-semibold">{stats.instruments.length}</div>
                        <div className="text-[9px] opacity-75 uppercase tracking-wider">instruments</div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-xl font-semibold">{stats.obligationsAnchored.size}</div>
                        <div className="text-[9px] opacity-75 uppercase tracking-wider">obligations</div>
                      </div>
                      <div>
                        <div className="text-xl font-semibold">{meanAnchoring}</div>
                        <div className="text-[9px] opacity-75 uppercase tracking-wider">mean L</div>
                      </div>
                      <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {isExp ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded tier detail */}
                {isExp && (
                  <div className={cn('w-full mt-1 mb-3 rounded-2xl border p-6 space-y-5', tier.light)}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Legal Function</div>
                        <p className="text-sm text-slate-700 leading-relaxed">{tier.description}</p>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-3">IHR Relevance</div>
                        <p className="text-sm text-slate-600 leading-relaxed">{tier.ihrRelevance}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Instruments in Corpus ({stats.instruments.length})</div>
                        <div className="space-y-2">
                          {stats.instruments.length > 0 ? stats.instruments.map((inst: any, j: number) => (
                            <div key={j} className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                              <div className="font-bold text-slate-900 text-xs leading-tight">{inst.norm_title || inst.norm_id}</div>
                              {inst.effective_date && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {inst.effective_date}
                                  {isOutdated(inst.norm_title || '') && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">PREDATES IHR 2005</span>
                                  )}
                                </div>
                              )}
                              {inst.relevance_for_ihr && (
                                <div className="text-[10px] text-slate-500 leading-relaxed">{inst.relevance_for_ihr}</div>
                              )}
                            </div>
                          )) : (
                            <div className="p-3 bg-white/60 rounded-xl text-xs text-slate-400 italic">No instruments at this tier in current corpus</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hierarchy note */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Click any tier to expand instruments and IHR relevance detail. Pyramid width is schematic: wider = lower in hierarchy. Mean anchoring score (L0-L5) reflects the quality of IHR linkage for provisions at that tier, averaged across all mapping rows in the corpus.
          </p>
        </div>
      </div>

      {/* IHR Anchoring by Tier: summary table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">IHR Anchoring by Normative Tier</h2>
          <p className="text-sm text-slate-500 mt-1">Distribution of IHR 2005 mapping rows and mean anchoring score across Mexico's normative tiers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-5 font-bold text-slate-500">Tier</th>
                <th className="p-5 font-bold text-slate-500">Instruments</th>
                <th className="p-5 font-bold text-slate-500">IHR Obligations Anchored</th>
                <th className="p-5 font-bold text-slate-500">Mapping Rows</th>
                <th className="p-5 font-bold text-slate-500">Mean Anchoring Level</th>
                <th className="p-5 font-bold text-slate-500">Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TIERS.map(tier => {
                const stats = tierStats[tier.id];
                const mean = stats.rowCount > 0 ? stats.totalAnchoring / stats.rowCount : 0;
                return (
                  <tr key={tier.id} className="hover:bg-slate-50">
                    <td className="p-5">
                      <span className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold', tier.color)}>{tier.label}</span>
                    </td>
                    <td className="p-5 font-bold text-slate-900">{stats.instruments.length}</td>
                    <td className="p-5 font-bold text-slate-900">{stats.obligationsAnchored.size}</td>
                    <td className="p-5 text-slate-600">{stats.rowCount}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', mean >= 3 ? 'bg-emerald-500' : mean >= 2 ? 'bg-amber-400' : 'bg-red-400')}
                            style={{ width: `${(mean / 5) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-900">{stats.rowCount > 0 ? mean.toFixed(1) : '—'}</span>
                      </div>
                    </td>
                    <td className="p-5 text-xs text-slate-500 max-w-[200px]">
                      {tier.id === 'constitutional' && 'Foundation layer: provides basis for treaty incorporation but rarely creates specific IHR anchors'}
                      {tier.id === 'statutory' && 'Primary implementation tier: LGS provides general health governance framework, but obligation-specific provisions are scarce'}
                      {tier.id === 'regulatory' && 'RLGS-SI (1985) is the dominant IHR anchor, but predates IHR 2005 by 20 years: update-review needed'}
                      {tier.id === 'sub-regulatory' && 'Technical specifications for specific capacity areas; too low in hierarchy for core IHR obligation anchoring'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Systemic implication */}
      <div className="border-t border-slate-200 pt-8">
        <div className="bg-slate-900 text-white rounded-2xl p-10 space-y-5">
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-blue-400 shrink-0" />
            <h3 className="text-2xl font-semibold">Structural Implication for IHR Internalisation</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
            <div className="space-y-3">
              <p>
                Mexico's IHR implementation rests primarily on general statutory mandate language (LGS) and a single regulatory instrument (RLGS-SI, 1985). This creates a structural vulnerability: the <strong>primary normative anchor is at the regulatory tier</strong>, which cannot be the foundation for obligations requiring specific actor competences, enforceable procedures, or individual rights safeguards.
              </p>
              <p>
                Under Mexico's constitutional system, a <em>reglamento</em> implements a law: it cannot create obligations beyond what the statute authorises. Where the LGS uses general mandate language, the RLGS-SI can only operationalise it equally broadly. This explains why 63.8% of mapping rows show anchoring at Level 2 (indirect) and why procedural gaps account for 33.8% of all gap classifications.
              </p>
            </div>
            <div className="space-y-3">
              <p>
                The pro-persona principle (Art. 1 CPEUM, 2011) does not resolve this structural problem. It ensures <em>interpretive</em> alignment with IHR human rights provisions, but does not substitute for the <em>operative</em> legal architecture: the designated authority, the defined procedure, the enforceable competence: that IHR implementation requires.
              </p>
              <p>
                The most significant reform pathway identified by NormTrace is therefore not treaty ratification or administrative practice, but <strong>statutory reform</strong>: the LGS and specific sectoral laws need obligation-specific provisions at L4-L5 anchoring to close the gap between constitutional intent and operational capacity.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-3">
            <CheckCircle size={16} className="text-blue-400" />
            <p className="text-xs text-slate-400 italic">
              Analysis derived from NormTrace-IHR Mexico Pilot v0.1. All outputs preliminary; expert legal validation required.
              See methodology for anchoring scale definitions (L0-L5).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function isOutdated(normTitle: string): boolean {
  return normTitle.includes('1985') || normTitle.includes('1984') || normTitle.includes('1986') || normTitle.includes('1990') || normTitle.includes('RLGS-SI');
}
