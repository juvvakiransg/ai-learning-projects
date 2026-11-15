import { useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleHelp, Compass, GraduationCap, Lightbulb, LoaderCircle, LockKeyhole, Map, ShieldCheck, Sparkles, Target, WandSparkles } from 'lucide-react';

type Profile = { currentRole: string; experienceYears: number; skills: string[]; interests: string[]; careerGoal: string; learningHoursPerWeek: number };
type Recommendation = { title: string; score: number; matchedSkills: string[]; skillGaps: string[]; reason: string };
type Roadmap = { phase: string; weeks: string; focus: string[]; deliverable: string };
type Advice = { recommendations: Recommendation[]; roadmap: Roadmap[]; disclaimer: string; provider: string };
const initial: Profile = { currentRole: 'Senior iOS Developer', experienceYears: 14, skills: ['Swift', 'iOS', 'CI/CD', 'architecture', 'system design'], interests: ['cloud computing', 'architecture', 'AI'], careerGoal: 'Solution Architect', learningHoursPerWeek: 8 };
const split = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);
export default function App() {
  const [profile, setProfile] = useState<Profile>(initial);
  const [skills, setSkills] = useState(initial.skills.join(', '));
  const [interests, setInterests] = useState(initial.interests.join(', '));
  const [provider, setProvider] = useState<'offline' | 'openai'>('offline');
  const [result, setResult] = useState<Advice | null>(null);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'recommendations'|'roadmap'>('recommendations');
  const change = (field: keyof Profile, value: string | number) => setProfile(p => ({ ...p, [field]: value }));
  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError(''); setResult(null); setSelected(0);
    try {
      const response = await fetch('/api/advice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: { ...profile, skills: split(skills), interests: split(interests) }, provider }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to generate advice');
      setResult(data as Advice); setTab('recommendations');
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
    finally { setLoading(false); }
  }
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Compass size={22}/></div><div><strong>CareerPath<span>AI</span></strong><small>Your future, mapped out.</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <div className="side-link active"><Compass size={18}/> Career Advisor</div>
      <div className="side-link muted"><Map size={18}/> Learning Roadmap</div>
      <div className="side-link muted"><ShieldCheck size={18}/> Responsible AI</div>
      <div className="side-spacer"/>
      <div className="side-note"><div className="note-icon"><Lightbulb size={19}/></div><strong>Build your next chapter</strong><p>Discover career directions aligned with your strengths, interests, and goals.</p></div>
      <div className="side-footer"><span className="avatar">CA</span><div><strong>Career Explorer</strong><small>Learning workspace</small></div><ChevronRight size={16}/></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb">Workspace <ChevronRight size={14}/> <strong>Career Advisor</strong></div><div className="top-right"><span className="status-dot"/> Offline-first experience <CircleHelp size={18}/></div></header>
      <div className="content">
        <div className="eyebrow"><Sparkles size={15}/> YOUR PERSONAL AI CAREER COMPANION</div>
        <h1>Let's shape your <em>next move.</em></h1>
        <p className="intro">Tell us a little about yourself. We'll uncover career paths that fit your strengths and create a learning roadmap to help you get there.</p>
        <div className="workspace-grid">
          <section className="panel form-panel"><div className="panel-heading"><div className="heading-icon"><BriefcaseBusiness size={20}/></div><div><h2>Your professional profile</h2><p>A few details to personalize your recommendations</p></div><span className="step-tag">STEP 01</span></div>
            <form onSubmit={submit}>
              <div className="field-grid"><label>Current role<input required maxLength={150} value={profile.currentRole} onChange={e => change('currentRole',e.target.value)} placeholder="e.g. Software Developer"/></label><label>Years of experience<input required type="number" min="0" max="70" step="0.5" value={profile.experienceYears} onChange={e => change('experienceYears',Number(e.target.value))}/></label></div>
              <label>Technical skills <span className="hint">Separate with commas</span><textarea required rows={2} value={skills} onChange={e => setSkills(e.target.value)} placeholder="Swift, React, Cloud..."/></label>
              <label>Areas of interest <span className="hint">Separate with commas</span><textarea rows={2} value={interests} onChange={e => setInterests(e.target.value)} placeholder="AI, Architecture, Design..."/></label>
              <label>Career goal<input required maxLength={150} value={profile.careerGoal} onChange={e => change('careerGoal',e.target.value)} placeholder="e.g. Solution Architect"/></label>
              <label>Weekly learning commitment <span className="hours-value">{profile.learningHoursPerWeek} hours / week</span><input className="range" type="range" min="0" max="40" value={profile.learningHoursPerWeek} onChange={e => change('learningHoursPerWeek',Number(e.target.value))}/><div className="range-label"><span>0 hours</span><span>40 hours</span></div></label>
              <div className="provider"><div><strong>Recommendation engine</strong><small>Choose how to generate your advice</small></div><div className="switcher"><button type="button" className={provider==='offline'?'chosen':''} onClick={()=>setProvider('offline')}>Offline</button><button type="button" className={provider==='openai'?'chosen':''} onClick={()=>setProvider('openai')}>OpenAI</button></div></div>
              {provider==='openai' && <div className="notice">OpenAI mode requires a configured API key and available API credits on the backend.</div>}
              <button className="submit" type="submit" disabled={loading}>{loading?<><LoaderCircle size={18} className="spin"/> Generating your plan...</>:<><WandSparkles size={18}/> Generate my career plan <ArrowRight size={18}/></>}</button>
              {error && <div role="alert" className="error">{error}</div>}
              <div className="privacy"><LockKeyhole size={15}/> Offline mode processes your profile locally. No personal contact details needed.</div>
            </form>
          </section>
          <section className="results">
            {!result ? <div className="empty panel"><div className="empty-art"><div className="orbit one"/><div className="orbit two"/><div className="center-art"><Target size={40}/></div><span className="spark a">✦</span><span className="spark b">✧</span><span className="spark c">✦</span></div><span className="ready">YOUR POTENTIAL, UNLOCKED</span><h2>Your next chapter<br/>starts here.</h2><p>Complete your profile and generate your personalized career recommendations and learning roadmap.</p><div className="empty-features"><span><CheckCircle2 size={16}/> Role matches</span><span><CheckCircle2 size={16}/> Skill gap analysis</span><span><CheckCircle2 size={16}/> 12-week roadmap</span></div></div> : <div className="panel result-panel"><div className="result-header"><div><div className="eyebrow"><Sparkles size={14}/> YOUR CAREER OUTLOOK</div><h2>Your personalized plan</h2><p>Based on your skills, interests, and career goals</p></div><span className="mode-pill">{result.provider} mode</span></div><div className="tabs"><button className={tab==='recommendations'?'on':''} onClick={()=>setTab('recommendations')}><BriefcaseBusiness size={16}/> Career matches</button><button className={tab==='roadmap'?'on':''} onClick={()=>setTab('roadmap')}><GraduationCap size={16}/> Learning roadmap</button></div>
              {tab==='recommendations' ? <><div className="result-caption">TOP RECOMMENDED PATHS</div><div className="role-list">{result.recommendations.map((r,i)=><button key={r.title} onClick={()=>setSelected(i)} className={'role '+(selected===i?'selected':'')}><div className="role-main"><div className="role-num">0{i+1}</div><div><strong>{r.title}</strong><small>{r.matchedSkills.length} matching skills</small></div></div><div className="score"><strong>{r.score}<span>/100</span></strong><small>Fit score*</small></div></button>)}</div>{result.recommendations[selected] && <div className="role-detail"><h3>{result.recommendations[selected].title} <ArrowUpRight size={17}/></h3><p>{result.recommendations[selected].reason}</p><h4>YOUR MATCHING SKILLS</h4><div className="chips">{result.recommendations[selected].matchedSkills.length ? result.recommendations[selected].matchedSkills.map(s=><span className="chip good" key={s}><CheckCircle2 size={13}/>{s}</span>):<span className="muted-text">No direct catalog matches yet</span>}</div><h4>SKILLS TO DEVELOP</h4><div className="chips">{result.recommendations[selected].skillGaps.length ? result.recommendations[selected].skillGaps.map(s=><span className="chip" key={s}>{s}</span>):<span className="muted-text">All catalog skills matched</span>}</div></div>}</> : <><div className="result-caption">YOUR 12-WEEK ACTION PLAN</div><div className="timeline">{result.roadmap.map((r,i)=><div className="phase" key={r.phase}><div className="phase-marker">{i+1}</div><div><div className="weeks">WEEKS {r.weeks}</div><h3>{r.phase}</h3><div className="chips">{r.focus.map(f=><span className="chip" key={f}>{f}</span>)}</div><p>{r.deliverable}</p></div></div>)}</div></>}
              <div className="disclaimer"><ShieldCheck size={18}/><div><strong>Responsible AI reminder</strong><p>{result.disclaimer} *Fit scores are illustrative heuristics, not hiring probabilities.</p></div></div>
            </div>}
            <div className="principles"><div><ShieldCheck size={20}/><strong>Fair by design</strong><small>Skills-first guidance</small></div><div><LockKeyhole size={20}/><strong>Privacy-minded</strong><small>Minimal profile data</small></div><div><Target size={20}/><strong>Actionable</strong><small>Clear next steps</small></div></div>
          </section>
        </div>
        <footer>CareerPath AI · Educational project <span>Built with responsible AI principles <ShieldCheck size={14}/></span></footer>
      </div>
    </main>
  </div>;
}
