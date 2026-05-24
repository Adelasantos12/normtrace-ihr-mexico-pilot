import { useState, useMemo } from 'react';
import { useCsvData } from '../hooks/useData';
import { Scale, AlertTriangle, Info, ChevronDown, ChevronRight, Users, Shield, Zap, Network } from 'lucide-react';
import { cn } from '../lib/utils';

// Static political analysis layer — derived from legal corpus + institutional analysis
// Requires political science validation

const INSTITUTIONAL_ACTORS = [
  {
    id: 'CSG',
    name: 'Consejo de Salubridad General',
    formalAuthority: 'VERY_HIGH',
    operationalInfluence: 'MEDIUM',
    constitutionalBasis: 'Art. 73(XVI) CPEUM — General Health Council',
    mandateType: 'Constitutional sanitary authority',
    ihrRole: 'Emergency health measures, sanitary regulations, strategic oversight',
    decouplingRisk: 'MEDIUM',
    decouplingNote: 'Constitutional mandate is broad but operational activity is episodic. CSG decrees are infrequent; most operational IHR functions de facto rest with SSA.',
    reformFeasibility: 'LOW',
    vetoCapacity: 'HIGH',
    reformNotes: 'Any IHR reform plan that bypasses CSG faces constitutionality risk. However, CSG activation requires political will at the highest executive level.',
    bottleneck: false
  },
  {
    id: 'SSA',
    name: 'Secretaría de Salud',
    formalAuthority: 'HIGH',
    operationalInfluence: 'VERY_HIGH',
    constitutionalBasis: 'LGS Art. 7 + LOAPF Art. 39',
    mandateType: 'Primary health executive authority',
    ihrRole: 'NFP functions, surveillance coordination, international liaison (via DGE and DGRI), points-of-entry health authority',
    decouplingRisk: 'LOW',
    decouplingNote: 'SSA is the primary IHR actor both formally and operationally. Decoupling risk is low at the central level but increases in federated implementation.',
    reformFeasibility: 'HIGH',
    vetoCapacity: 'MEDIUM',
    reformNotes: 'Primary reform entry point. LGS and RLGS-SI amendments require SS initiative. Political feasibility depends on inter-secretarial alignment with SRE and SEGOB.',
    bottleneck: true
  },
  {
    id: 'DGE',
    name: 'Dirección General de Epidemiología',
    formalAuthority: 'MEDIUM',
    operationalInfluence: 'HIGH',
    constitutionalBasis: 'RI-SS 2025 (Reglamento Interior)',
    mandateType: 'National IHR Focal Point (de facto)',
    ihrRole: 'NFP 24/7 functions, surveillance networks (SINAVE), notification to WHO, epidemiological intelligence',
    decouplingRisk: 'HIGH',
    decouplingNote: 'DGE exercises NFP functions by administrative practice and internal regulation — not by statutory designation. The NFP mandate rests on RI-SS 2025, which is below the normative level IHR Art. 4 requires.',
    reformFeasibility: 'HIGH',
    vetoCapacity: 'LOW',
    reformNotes: 'DGE is the most critical IHR operational actor without adequate statutory designation. Statutory reform of LGS to designate NFP with defined functions is the highest-priority legal reform.',
    bottleneck: true
  },
  {
    id: 'COFEPRIS',
    name: 'Comisión Federal para la Protección contra Riesgos Sanitarios',
    formalAuthority: 'HIGH',
    operationalInfluence: 'HIGH',
    constitutionalBasis: 'LGS Art. 17 bis + Reglamento Interior COFEPRIS',
    mandateType: 'Sanitary risk regulatory authority',
    ihrRole: 'Biological substances (Art. 46), chemicals, radiological materials; points-of-entry sanitary control for goods',
    decouplingRisk: 'MEDIUM',
    decouplingNote: 'COFEPRIS has strong formal and operational authority for goods and substances but IHR Art. 46 obligations (biological substances) are poorly anchored in specific statutory provisions.',
    reformFeasibility: 'MEDIUM',
    vetoCapacity: 'MEDIUM',
    reformNotes: 'Regulatory reform within COFEPRIS mandate for biological substances is feasible without LGS amendment. Full statutory anchoring of Art. 46 obligations requires LGS reform.',
    bottleneck: false
  },
  {
    id: 'SRE',
    name: 'Secretaría de Relaciones Exteriores',
    formalAuthority: 'MEDIUM',
    operationalInfluence: 'MEDIUM',
    constitutionalBasis: 'LOAPF Art. 28',
    mandateType: 'International treaty liaison',
    ihrRole: 'Treaty reporting, international coordination channel, IHR Article 4 coordination with WHO at diplomatic level',
    decouplingRisk: 'HIGH',
    decouplingNote: 'SRE holds international treaty liaison functions but IHR implementation is operationally centred in SSA/DGE. The coordination interface between SRE and health authorities lacks formal legal specification — a structural coordination gap.',
    reformFeasibility: 'MEDIUM',
    vetoCapacity: 'LOW',
    reformNotes: 'Inter-secretarial MOU or formal coordination protocol between SRE and SSA for IHR reporting and emergency response is a feasible administrative reform.',
    bottleneck: false
  },
  {
    id: 'SEGOB_INM',
    name: 'SEGOB / Instituto Nacional de Migración',
    formalAuthority: 'MEDIUM',
    operationalInfluence: 'HIGH',
    constitutionalBasis: 'Ley de Migración + Reglamento Interior INM',
    mandateType: 'Migration control and border management',
    ihrRole: 'Points-of-entry health measures for travellers — application of health measures to persons at borders',
    decouplingRisk: 'VERY_HIGH',
    decouplingNote: 'INM operates at POE with significant interface with IHR health measures (Arts. 23–32) but operates under a migration mandate without explicit IHR coordination protocols. SSA-INM coordination for health measures at borders lacks statutory specification.',
    reformFeasibility: 'LOW',
    vetoCapacity: 'HIGH',
    reformNotes: 'SSA-INM coordination is the most under-specified inter-institutional relationship in the IHR corpus. Formal protocol or joint regulation is needed but requires inter-secretarial political will.',
    bottleneck: true
  },
  {
    id: 'ESTADOS',
    name: 'Entidades Federativas (32 States)',
    formalAuthority: 'MEDIUM',
    operationalInfluence: 'HIGH',
    constitutionalBasis: 'Art. 4 + 73(XVI) CPEUM — concurrent health competence',
    mandateType: 'State health authorities',
    ihrRole: 'Implementation of IHR core capacities at the state level — surveillance, points of entry, response capacity',
    decouplingRisk: 'VERY_HIGH',
    decouplingNote: 'Federal pilot covers federal law only. State-level IHR implementation is highly variable. The federal-state mandate chain is the largest single gap in IHR implementation architecture — not covered in v0.1.',
    reformFeasibility: 'LOW',
    vetoCapacity: 'HIGH',
    reformNotes: 'State IHR implementation requires federal-to-state coordination agreements (convenios) specifying obligations, resources, and accountability. This is the most politically complex reform pathway.',
    bottleneck: true
  }
];

const FEASIBILITY_MATRIX = [
  {
    reform: 'Statutory designation of DGE/NFP in LGS',
    feasibility: 'HIGH',
    urgency: 'CRITICAL',
    politicalCost: 'LOW',
    technicalComplexity: 'MEDIUM',
    actors: ['SSA', 'Congress', 'DGE'],
    note: 'LGS amendment to explicitly designate the NFP, its functions, authority, and 24/7 operational capacity. Builds on existing institutional practice. Low political cost as it formalises de facto arrangement.'
  },
  {
    reform: 'RLGS-SI update to align with IHR 2005 / 2024',
    feasibility: 'HIGH',
    urgency: 'HIGH',
    politicalCost: 'LOW',
    technicalComplexity: 'HIGH',
    actors: ['SSA', 'Presidencia', 'DGE'],
    note: 'Presidential regulation within SS competence. Does not require congressional action. Technical complexity is high — must address points of entry, traveller rights, notification procedures, surveillance requirements.'
  },
  {
    reform: 'SSA-INM coordination protocol for POE health measures',
    feasibility: 'MEDIUM',
    urgency: 'HIGH',
    politicalCost: 'MEDIUM',
    technicalComplexity: 'MEDIUM',
    actors: ['SSA', 'SEGOB', 'INM'],
    note: 'Inter-secretarial agreement or joint regulation on application of health measures at points of entry. Requires alignment between SSA and SEGOB/INM mandates. Political cost is medium — migration policy is sensitive.'
  },
  {
    reform: 'CC1 statutory reform — general IHR implementation law',
    feasibility: 'LOW',
    urgency: 'MEDIUM',
    politicalCost: 'HIGH',
    technicalComplexity: 'HIGH',
    actors: ['Congress', 'SSA', 'SRE', 'Presidencia'],
    note: 'Comprehensive statutory reform to create obligation-specific anchoring for IHR requirements. Requires congressional action, broad coalition, and sustained political will. Highest impact but lowest short-term feasibility.'
  },
  {
    reform: 'Federal-state coordination convenios for IHR',
    feasibility: 'MEDIUM',
    urgency: 'MEDIUM',
    politicalCost: 'HIGH',
    technicalComplexity: 'HIGH',
    actors: ['SSA', 'CNSS', 'Entidades Federativas'],
    note: 'Framework agreements under the National Health System specifying IHR obligations for state health authorities, resource commitments, and accountability mechanisms. Politically sensitive due to federalism dynamics.'
  },
  {
    reform: 'COFEPRIS regulatory update for biological substances (Art. 46)',
    feasibility: 'HIGH',
    urgency: 'MEDIUM',
    politicalCost: 'LOW',
    technicalComplexity: 'MEDIUM',
    actors: ['COFEPRIS', 'SSA'],
    note: 'COFEPRIS internal regulation update to address IHR Art. 46 requirements for biological substance controls. Within existing competence, no congressional action required.'
  }
];

const AUTHORITY_LEVELS: Record<string, { label: string; color: string; bg: string }> = {
  VERY_HIGH: { label: 'Very High', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  HIGH: { label: 'High', color: 'text-blue-700', bg: 'bg-blue-100' },
  MEDIUM: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100' },
  LOW: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' }
};

const FEASIBILITY_LEVELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  HIGH: { label: 'High', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  MEDIUM: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  LOW: { label: 'Low', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
};

const URGENCY_LEVELS: Record<string, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100' },
  HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100' },
  MEDIUM: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-100' }
};

const DECOUPLING_LEVELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  VERY_HIGH: { label: 'Very High', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  HIGH: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  MEDIUM: { label: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  LOW: { label: 'Low', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
};

export default function PoliticalBrain() {
  const [tab, setTab] = useState<'topology' | 'decoupling' | 'feasibility' | 'theory'>('topology');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: mapping } = useCsvData<any>('mexico_ihr2005_mapping_clean.csv');

  const bottlenecks = INSTITUTIONAL_ACTORS.filter(a => a.bottleneck);

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-900 text-white rounded-xl"><Scale size={20} /></div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Political Brain</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-4xl">
          Institutional authority topology for IHR implementation in Mexico — mapping the distance between formal legal mandates and operational realities, identifying decoupled actors, structural bottlenecks, and reform feasibility pathways.
        </p>
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl w-fit">
          <AlertTriangle size={14} className="text-amber-600" />
          <p className="text-xs text-amber-800 font-medium">
            Preliminary analytical layer — derived from legal corpus analysis. Requires political science validation.
          </p>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'topology', label: 'Authority Topology', icon: Network },
          { id: 'decoupling', label: 'Institutional Decoupling', icon: Zap },
          { id: 'feasibility', label: 'Reform Feasibility', icon: Scale },
          { id: 'theory', label: 'Analytical Framework', icon: Shield }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2',
              tab === t.id ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* AUTHORITY TOPOLOGY */}
      {tab === 'topology' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Institutional Authority Map — IHR Mexico</h2>
            <p className="text-sm text-slate-500 max-w-3xl">
              Formal authority (legal mandate strength) versus operational influence (effective role in IHR implementation). Distance between the two signals decoupling risk.
            </p>
            <div className="space-y-4">
              {INSTITUTIONAL_ACTORS.map(actor => {
                const formal = AUTHORITY_LEVELS[actor.formalAuthority];
                const operational = AUTHORITY_LEVELS[actor.operationalInfluence];
                const decouple = DECOUPLING_LEVELS[actor.decouplingRisk];
                const isExp = expanded === actor.id;
                return (
                  <div key={actor.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(isExp ? null : actor.id)}
                      className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900">{actor.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 font-medium">{actor.mandateType}</div>
                      </div>
                      <div className="hidden md:flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Formal</div>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-black', formal.bg, formal.color)}>{formal.label}</span>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Operational</div>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-black', operational.bg, operational.color)}>{operational.label}</span>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Decoupling</div>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-black border', decouple.bg, decouple.border, decouple.color)}>{decouple.label}</span>
                        </div>
                        {actor.bottleneck && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-black">BOTTLENECK</span>
                        )}
                      </div>
                      {isExp ? <ChevronDown size={18} className="text-slate-400 shrink-0" /> : <ChevronRight size={18} className="text-slate-400 shrink-0" />}
                    </button>
                    {isExp && (
                      <div className="border-t border-slate-100 p-6 grid md:grid-cols-2 gap-5 bg-slate-50/30">
                        <div className="space-y-3">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Basis</div>
                          <p className="text-xs font-medium text-slate-700">{actor.constitutionalBasis}</p>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">IHR Role</div>
                          <p className="text-xs text-slate-600 leading-relaxed">{actor.ihrRole}</p>
                        </div>
                        <div className="space-y-3">
                          <div className={cn('p-4 rounded-xl border', decouple.bg, decouple.border)}>
                            <div className={cn('text-[10px] font-black uppercase tracking-wider mb-2', decouple.color)}>
                              Decoupling Analysis — {decouple.label} Risk
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">{actor.decouplingNote}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-white border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reform Pathway</div>
                            <p className="text-xs text-slate-600 leading-relaxed">{actor.reformNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INSTITUTIONAL DECOUPLING */}
      {tab === 'decoupling' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[2rem] p-10 space-y-5">
            <h2 className="text-2xl font-black">Institutional Decoupling in IHR Implementation</h2>
            <p className="text-slate-300 leading-relaxed max-w-4xl text-sm">
              Institutional decoupling (Meyer &amp; Rowan, 1977; Weick, 1976) describes the gap between formal organisational structure and operational practice. In IHR implementation, decoupling occurs when: (1) an actor holds a formal legal mandate but does not operationally perform the IHR function; (2) a legal procedure exists on paper but has no operational correlate; (3) a coordination mechanism is legally established but not activated; or (4) a law is enacted without the cascading legislative changes needed to operationalise it at lower normative tiers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* High-decoupling actors */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">High-Decoupling Actors</h3>
              {INSTITUTIONAL_ACTORS.filter(a => a.decouplingRisk === 'HIGH' || a.decouplingRisk === 'VERY_HIGH').map(actor => {
                const decouple = DECOUPLING_LEVELS[actor.decouplingRisk];
                return (
                  <div key={actor.id} className={cn('p-5 rounded-2xl border space-y-2', decouple.bg, decouple.border)}>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">{actor.name}</span>
                      <span className={cn('px-2 py-0.5 rounded text-[9px] font-black border', decouple.bg, decouple.border, decouple.color)}>{decouple.label}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{actor.decouplingNote}</p>
                  </div>
                );
              })}
            </div>

            {/* Structural bottlenecks */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Structural Bottlenecks</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Actors that anchor multiple IHR obligations but whose institutional position creates implementation blockages — either due to decoupling, coordination failures, or normative insufficiency.</p>
              {bottlenecks.map(actor => (
                <div key={actor.id} className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-black">BOTTLENECK</span>
                    <span className="font-black text-slate-900 text-sm">{actor.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{actor.reformNotes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decoupling typology */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900">Decoupling Typology — Mexico IHR Findings</h3>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  type: 'Mandate–Performance Decoupling',
                  example: 'DGE exercises NFP functions under internal regulation (RI-SS 2025), not statutory designation',
                  color: 'bg-red-50 border-red-200',
                  impact: 'NFP function depends on administrative arrangement, not law — vulnerable to reorganisation'
                },
                {
                  type: 'Cascade Decoupling',
                  example: 'IHR 2005 adopted 2007; RLGS-SI (1985) never updated; downstream regulations not cascaded',
                  color: 'bg-orange-50 border-orange-200',
                  impact: 'International obligation enters the legal system but the normative chain is not updated below the constitutional level'
                },
                {
                  type: 'Coordination Decoupling',
                  example: 'SSA-INM coordination at POE: both have relevant mandates, no joint protocol exists',
                  color: 'bg-amber-50 border-amber-200',
                  impact: 'Traveller health measures at borders depend on ad hoc practice, not specified legal coordination'
                },
                {
                  type: 'Federal Decoupling',
                  example: 'Federal IHR obligations do not cascade through convenios to state health authorities',
                  color: 'bg-indigo-50 border-indigo-200',
                  impact: 'IHR core capacities depend on federal-state coordination that lacks legal specification at state level'
                }
              ].map((d, i) => (
                <div key={i} className={cn('p-5 rounded-2xl border space-y-2', d.color)}>
                  <div className="font-black text-slate-900 text-sm">{d.type}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Example</div>
                  <p className="text-xs text-slate-600 italic">{d.example}</p>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Implementation impact</div>
                  <p className="text-xs text-slate-700 leading-relaxed">{d.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REFORM FEASIBILITY */}
      {tab === 'feasibility' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Reform Feasibility Matrix</h2>
            <p className="text-sm text-slate-500 max-w-3xl">Six priority reform pathways ranked by feasibility, urgency, and political cost. Derived from NormTrace gap analysis and institutional authority mapping.</p>
            <div className="space-y-4">
              {FEASIBILITY_MATRIX.map((r, i) => {
                const feasibility = FEASIBILITY_LEVELS[r.feasibility];
                const urgency = URGENCY_LEVELS[r.urgency];
                const isExp = expanded === `reform-${i}`;
                return (
                  <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(isExp ? null : `reform-${i}`)}
                      className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <span className="text-[10px] font-black text-slate-300 w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900 text-sm">{r.reform}</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {r.actors.map((a, j) => (
                            <span key={j} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Feasibility</div>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-black border', feasibility.bg, feasibility.border, feasibility.color)}>{feasibility.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Urgency</div>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-black', urgency.bg, urgency.color)}>{urgency.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Pol. Cost</div>
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-black',
                            r.politicalCost === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
                            r.politicalCost === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          )}>{r.politicalCost.charAt(0) + r.politicalCost.slice(1).toLowerCase()}</span>
                        </div>
                      </div>
                      {isExp ? <ChevronDown size={18} className="text-slate-400 shrink-0" /> : <ChevronRight size={18} className="text-slate-400 shrink-0" />}
                    </button>
                    {isExp && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50/30">
                        <p className="text-sm text-slate-600 leading-relaxed">{r.note}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICAL FRAMEWORK */}
      {tab === 'theory' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[2rem] p-10 space-y-8">
            <h2 className="text-2xl font-black">Analytical Framework — Cerebro Jurídico × Cerebro Político</h2>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-300 leading-relaxed">
              <div className="space-y-4">
                <h3 className="text-white font-black text-lg">The Juridical Brain (Cerebro Jurídico)</h3>
                <p>The juridical brain encodes the country's normative architecture: constitutional structure, legal hierarchy, treaty incorporation mechanisms, legislative drafting conventions, jurisdictional distribution, and the logical chain through which an international obligation can be traced to a domestic operative provision.</p>
                <p>For Mexico, this brain is encoded in: CPEUM (especially Arts. 1, 4, 40, 73(XVI), 133), LGS, LOAPF, and the Romano-Germanic civil law tradition that governs how statutory language creates operative rights and duties.</p>
                <p>NormTrace's corpus analysis — the anchoring scale, fit dimensions, and gap typology — operates through the juridical brain. It answers: <em>is there a legally competent actor with a legally defined procedure rooted in a legally appropriate instrument?</em></p>
              </div>
              <div className="space-y-4">
                <h3 className="text-white font-black text-lg">The Political Brain (Cerebro Político)</h3>
                <p>The political brain encodes the operational power structure: who actually controls agenda-setting and resource allocation, where political will concentrates, which actors function as veto players, what institutional incentives shape compliance behaviour, and where formal-informal gaps create decoupling.</p>
                <p>For Mexico's IHR governance, the political brain highlights: the SSA-DGE functional dominance without adequate statutory basis; the CSG's constitutional authority versus its operational episodic character; the SSA-INM coordination deficit; and the federal-state power distribution that leaves state-level implementation legally unspecified.</p>
                <p>This Political Brain layer is preliminary. Full development requires political science analysis of each actor's incentive structure, accountability mechanisms, and historical patterns of IHR-related decision-making.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Complex Adaptive Systems Framework</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                NormTrace applies a complex adaptive systems (CAS) lens to legal-institutional analysis. A domestic legal architecture for IHR implementation is not a simple hierarchical chain — it is a multi-agent system with emergent properties, feedback loops, and non-linear responses to change.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Agents', value: 'Legal instruments, institutional actors, procedural mechanisms — each with partial autonomy and specific competences' },
                  { label: 'Emergence', value: 'IHR compliance (or non-compliance) is an emergent property of the system — not reducible to any single norm or actor' },
                  { label: 'Feedback', value: 'SPAR/JEE capacity scores feed back into reform processes; legal reform at one level should cascade to others but often does not' },
                  { label: 'Bottlenecks', value: 'High-centrality nodes (SSA, LGS) whose failure blocks implementation across multiple IHR capacities simultaneously' },
                  { label: 'Decoupling', value: 'Formally coupled system components (law + regulation + actor + procedure) that operate as loosely coupled in practice' }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{item.label}: </span>
                    <span className="text-xs text-slate-700 leading-relaxed">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-black text-slate-900">Key References</h3>
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="font-bold text-blue-900">Habibi R, et al. (2020)</p>
                  <p>"Do not violate the International Health Regulations during the COVID-19 outbreak." <em>The Lancet</em>, 395(10225), 664–666. doi:10.1016/S0140-6736(20)30373-1</p>
                  <p className="mt-1 text-[10px] text-slate-500">IHR compliance analysis — States Parties' obligations under international health law; informs the diagnostic framing for procedural and rights-safeguard gaps.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900">Meyer JW, Rowan B. (1977)</p>
                  <p>"Institutionalized organizations: formal structure as myth and ceremony." <em>Am J Sociol</em>, 83(2), 340–363.</p>
                  <p className="mt-1 text-[10px] text-slate-500">Foundational decoupling theory — formal legal structure as institutional myth divorced from operational practice.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900">Paina L, Peters DH. (2012)</p>
                  <p>"Understanding pathways for scaling up health interventions." <em>Implementation Science</em>, 7:101.</p>
                  <p className="mt-1 text-[10px] text-slate-500">CAS framework applied to health systems — agents, emergence, non-linearity, and context-dependency in health governance.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900">Gostin LO, Katz R. (2016)</p>
                  <p>"The International Health Regulations: the governing framework for global health security." <em>Milbank Q</em>, 94(2), 264–313.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
