import {FormEvent, ReactNode, useEffect, useMemo, useState} from "react";
import type {Dispatch, SetStateAction} from "react";
import type {Session} from "@supabase/supabase-js";
import {
  Activity as ActivityIcon,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Compass,
  Eye,
  FileText,
  Flame,
  Gauge,
  HandCoins,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  Mail,
  Map,
  MessageSquareText,
  PhoneCall,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import {configured, supabase} from "./lib/supabase";
import {
  demoOpportunities,
  initialActivities,
  marketSignals,
  markets,
  pricing,
  stages,
} from "./data";
import type {
  Activity as ActivityRecord,
  Market,
  Opportunity,
  Placement,
  Stage,
} from "./data";

type View = "Command Center" | "Pipeline + Activity" | "Market Intelligence" | "Decision Room";
type Persona = "Charley" | "LaShea" | "Alan";
type ModalName = "call" | "pricing" | "copilot" | "activity" | "followup" | "advertiser" | null;

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 0}).format(value);

const placementPrice = (placement: Placement) => pricing.find((item) => item.name === placement)?.price ?? 0;

const personas: Array<{name: Persona; role: string; initials: string}> = [
  {name: "Charley", role: "Regional sales rep · pilot user", initials: "CH"},
  {name: "LaShea", role: "Platform admin + revenue advisor", initials: "LC"},
  {name: "Alan", role: "Executive viewer", initials: "AL"},
];

const navItems: Array<{name: View; icon: ReactNode; note: string}> = [
  {name: "Command Center", icon: <LayoutDashboard size={18}/>, note: "Start here"},
  {name: "Pipeline + Activity", icon: <BriefcaseBusiness size={18}/>, note: "Deals and follow-up"},
  {name: "Market Intelligence", icon: <Map size={18}/>, note: "Four-market signals"},
  {name: "Decision Room", icon: <Gauge size={18}/>, note: "Pilot economics"},
];

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("Working…");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({email, password})
      : await supabase.auth.signUp({email, password});
    setMessage(result.error?.message || (mode === "signup" ? "Check your email to confirm your account." : "Welcome back."));
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <div className="brandMark">FM</div>
        <p className="eyebrow">PHASE 1 · REGIONAL SALES VALIDATION</p>
        <h1>Regional revenue,<br/>made visible.</h1>
        <p>One focused command center for four Fun Maps markets.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label>
          <label>Password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required/></label>
          <button className="button primaryButton">{mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <button className="textButton" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        {message && <p className="formMessage">{message}</p>}
      </section>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("Command Center");
  const [persona, setPersona] = useState<Persona>("Charley");
  const [market, setMarket] = useState<"All Markets" | Market>("All Markets");
  const [intelMarket, setIntelMarket] = useState<Market>("San Diego");
  const [searchTerm, setSearchTerm] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>(demoOpportunities);
  const [activities, setActivities] = useState<ActivityRecord[]>(initialActivities);
  const [selectedId, setSelectedId] = useState(demoOpportunities[0].id);
  const [modal, setModal] = useState<ModalName>(null);
  const [dailyCalls, setDailyCalls] = useState(1);
  const [sprintSeconds, setSprintSeconds] = useState(15 * 60);
  const [sprintRunning, setSprintRunning] = useState(false);
  const [retainerEvidence, setRetainerEvidence] = useState(76);
  const [shareEvidence, setShareEvidence] = useState(61);
  const [readiness, setReadiness] = useState(83);

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      setSession(data.session);
      setLoading(false);
    });
    const {data} = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sprintRunning || sprintSeconds <= 0) return;
    const timer = window.setInterval(() => setSprintSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [sprintRunning, sprintSeconds]);

  useEffect(() => {
    if (sprintSeconds === 0) setSprintRunning(false);
  }, [sprintSeconds]);

  const visibleOpportunities = useMemo(
    () => opportunities.filter((opportunity) => {
      const inMarket = market === "All Markets" || opportunity.market === market;
      const matchesSearch = `${opportunity.company} ${opportunity.contact} ${opportunity.market}`.toLowerCase().includes(searchTerm.toLowerCase());
      return inMarket && matchesSearch;
    }),
    [market, opportunities, searchTerm],
  );
  useEffect(() => {
    if (visibleOpportunities.length && !visibleOpportunities.some((item) => item.id === selectedId)) {
      setSelectedId(visibleOpportunities[0].id);
    }
  }, [selectedId, visibleOpportunities]);
  const openOpportunities = visibleOpportunities.filter((item) => !item.stage.startsWith("Closed"));
  const openPipeline = openOpportunities.reduce((sum, item) => sum + item.annualPrice, 0);
  const weightedPipeline = openOpportunities.reduce((sum, item) => sum + item.annualPrice * item.probability / 100, 0);
  const likelyRevenue = openOpportunities.filter((item) => item.probability >= 60).reduce((sum, item) => sum + item.annualPrice, 0);
  const committedRevenue = openOpportunities.filter((item) => item.probability >= 80).reduce((sum, item) => sum + item.annualPrice, 0);
  const closedRevenue = visibleOpportunities.filter((item) => item.stage === "Closed Won").reduce((sum, item) => sum + item.annualPrice, 0);
  const closedCount = opportunities.filter((item) => item.stage === "Closed Won").length;
  const inventoryRemaining = 64 - closedCount;
  const closingPriorities = visibleOpportunities
    .filter((item) => item.stage === "Closing" || item.stage === "Proposal")
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 2);
  const selectedOpportunity = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];
  const activePersona = personas.find((item) => item.name === persona) ?? personas[0];
  const readOnly = persona === "Alan";
  const targetConversationRate = Math.round(dailyCalls / 2 * 100);

  function chooseOpportunity(opportunity: Opportunity, nextModal?: ModalName) {
    setSelectedId(opportunity.id);
    if (nextModal) setModal(nextModal);
  }

  function finishCall() {
    setDailyCalls((value) => Math.min(2, value + 1));
    setActivities((items) => [{
      id: `act-${Date.now()}`,
      account: selectedOpportunity.company,
      type: "Call",
      detail: `Completed a qualified closing conversation. Next: ${selectedOpportunity.nextAction}`,
      time: "Just now",
      owner: "Charley",
    }, ...items]);
    setModal(null);
  }

  function logActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setActivities((items) => [{
      id: `act-${Date.now()}`,
      account: String(form.get("account")),
      type: String(form.get("type")) as ActivityRecord["type"],
      detail: String(form.get("detail")),
      time: "Just now",
      owner: "Charley",
    }, ...items]);
    setModal(null);
  }

  function scheduleFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date"));
    const note = String(form.get("detail"));
    setActivities((items) => [{
      id: `act-${Date.now()}`,
      account: selectedOpportunity.company,
      type: "Follow-up",
      detail: `${date}: ${note}`,
      time: "Scheduled just now",
      owner: "Charley",
    }, ...items]);
    setOpportunities((items) => items.map((item) => item.id === selectedOpportunity.id ? {...item, nextAction: note} : item));
    setModal(null);
  }

  function addAdvertiser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const placement = String(form.get("placement")) as Placement;
    const newOpportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      company: String(form.get("company")),
      contact: String(form.get("contact")),
      role: String(form.get("role")),
      market: String(form.get("market")) as Market,
      placement,
      annualPrice: placementPrice(placement),
      stage: "Prospecting",
      probability: 20,
      expectedClose: String(form.get("closeDate")),
      lastInteraction: "Added just now",
      barrier: "Decision criteria not yet confirmed.",
      nextAction: "Complete first-touch outreach and qualify the decision-maker.",
      owner: "Charley",
    };
    setOpportunities((items) => [newOpportunity, ...items]);
    setSelectedId(newOpportunity.id);
    setModal(null);
  }

  if (loading) return <div className="loadingScreen"><Sparkles/> Loading the pilot…</div>;
  if (configured && !session) return <Auth/>;

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="sideBrand">
          <div className="brandMark">FM</div>
          <div><strong>Fun Maps</strong><span>Revenue Command Center</span></div>
        </div>
        <div className="pilotTag"><Zap size={14}/> Phase 1 · 30-day pilot</div>
        <nav>
          {navItems.map((item) => (
            <button key={item.name} className={view === item.name ? "navButton active" : "navButton"} onClick={() => setView(item.name)}>
              {item.icon}<span><b>{item.name}</b><small>{item.note}</small></span>
            </button>
          ))}
        </nav>
        <div className="sideFocus">
          <p><TimerReset size={15}/> Today’s operating target</p>
          <strong>{dailyCalls} of 2</strong>
          <span>qualified closing conversations</span>
          <div className="miniProgress"><i style={{width: `${Math.min(targetConversationRate, 100)}%`}}/></div>
        </div>
        <div className="sideFooter">
          <span>CAI pilot build</span>
          <b>phase 1 · 2026.09.15</b>
          {session && <button className="textButton inverse" onClick={() => supabase.auth.signOut()}>Sign out</button>}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">FUN MAPS REGIONAL REVENUE COMMAND CENTER</p>
            <h1>{view === "Command Center" ? `Good morning, ${persona}.` : view}</h1>
            <p className="headerSubline">
              {view === "Command Center" && persona === "Charley" ? "Two qualified closing conversations today. One clear action at a time." : activePersona.role}
            </p>
          </div>
          <div className="topbarControls">
            <label className="marketSelect"><Compass size={16}/><span>Market</span>
              <select value={market} onChange={(event) => {
                const nextMarket = event.target.value as "All Markets" | Market;
                setMarket(nextMarket);
                if (nextMarket !== "All Markets") setIntelMarket(nextMarket);
              }}>
                <option>All Markets</option>
                {markets.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <div className="personaSwitch" aria-label="View as">
              {personas.map((item) => (
                <button key={item.name} title={`${item.name} · ${item.role}`} className={persona === item.name ? "active" : ""} onClick={() => setPersona(item.name)}>{item.initials}</button>
              ))}
            </div>
            <button className="button primaryButton" disabled={readOnly} onClick={() => setModal("activity")}><Plus size={17}/> Log activity</button>
          </div>
        </header>

        {!configured && <div className="demoNotice"><Eye size={16}/><span>Interactive proposal prototype · Sample pipeline data · No live CRM sync</span></div>}
        {readOnly && <div className="viewerNotice"><LockKeyhole size={16}/> Alan is in executive read-only view. Sales actions are disabled.</div>}

        {view === "Command Center" && (
          <div className="pageStack">
            <section className="startHero">
              <div>
                <span className="sectionKicker"><Rocket size={15}/> START HERE</span>
                <h2>The next best close is already visible.</h2>
                <p>Use the two priority conversations below, log the result, and let the pipeline update the pilot evidence.</p>
              </div>
              <div className="heroGoal">
                <span>Today</span><strong>{dailyCalls}/2</strong><small>closing conversations</small>
                <button className="button lightButton" disabled={readOnly || closingPriorities.length === 0} onClick={() => chooseOpportunity(closingPriorities[0], "call")}><PhoneCall size={16}/> Start next call</button>
              </div>
            </section>

            <section className="metricGrid">
              <MetricCard label="Open pipeline" value={money(openPipeline)} note={`${openOpportunities.length} active advertisers`} icon={<BriefcaseBusiness/>} tone="violet"/>
              <MetricCard label="Weighted pipeline" value={money(Math.round(weightedPipeline))} note="Price × close probability" icon={<BarChart3/>} tone="blue"/>
              <MetricCard label="Likely revenue" value={money(likelyRevenue)} note="60% probability or higher" icon={<TrendingUp/>} tone="green"/>
              <MetricCard label="Committed revenue" value={money(committedRevenue)} note="80% probability or higher" icon={<HandCoins/>} tone="gold"/>
              <MetricCard label="Closed revenue" value={money(closedRevenue)} note={`${visibleOpportunities.filter((item) => item.stage === "Closed Won").length} placements won`} icon={<CircleDollarSign/>} tone="pink"/>
              <MetricCard label="Week 1 sales target" value="2 of 2–3" note="On target · Fun Maps goal" icon={<Target/>} tone="green"/>
              <MetricCard label="Annual inventory remaining" value={`${inventoryRemaining} / 64`} note="Pilot assumption · confirm layout" icon={<Building2/>} tone="orange"/>
            </section>

            <div className="sectionHeading">
              <div><span className="sectionKicker"><Flame size={15}/> TODAY’S CLOSES</span><h2>Two priority conversations</h2></div>
              <p>Ranked by stage, probability, and time to close.</p>
            </div>
            <section className="priorityGrid">
              {closingPriorities.map((opportunity, index) => (
                <article className="priorityCard" key={opportunity.id}>
                  <div className="priorityRank">0{index + 1}</div>
                  <div className="priorityMain">
                    <div className="cardTopline"><span className="marketPill">{opportunity.market}</span><b>{opportunity.probability}% likely</b></div>
                    <h3>{opportunity.company}</h3>
                    <p>{opportunity.contact} · {opportunity.role}</p>
                    <div className="priceLine"><strong>{money(opportunity.annualPrice)}</strong><span>{opportunity.placement}</span></div>
                    <div className="nextMove"><Lightbulb size={17}/><span><b>Recommended next action</b>{opportunity.nextAction}</span></div>
                    <div className="buttonRow">
                      <button className="button primaryButton" disabled={readOnly} onClick={() => chooseOpportunity(opportunity, "call")}><PhoneCall size={16}/> Start closing call</button>
                      <button className="button secondaryButton" onClick={() => {chooseOpportunity(opportunity); setView("Pipeline + Activity");}}>Open advertiser <ChevronRight size={16}/></button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="commandGrid">
              <article className="panel revenueSignal">
                <div className="panelHeader">
                  <div><span className="sectionKicker"><Sparkles size={15}/> REVENUE SIGNAL</span><h2>{selectedOpportunity.company}</h2></div>
                  <span className="signalBadge">Closing window open</span>
                </div>
                <div className="signalStats">
                  <div><span>Annual value</span><strong>{money(selectedOpportunity.annualPrice)}</strong></div>
                  <div><span>Probability</span><strong>{selectedOpportunity.probability}%</strong></div>
                  <div><span>Expected close</span><strong>{selectedOpportunity.expectedClose}</strong></div>
                </div>
                <div className="signalNarrative">
                  <div><span>Current barrier</span><p>{selectedOpportunity.barrier}</p></div>
                  <ArrowRight size={18}/>
                  <div><span>Best next move</span><p>{selectedOpportunity.nextAction}</p></div>
                </div>
                <div className="actionRail">
                  <button disabled={readOnly} onClick={() => setModal("call")}><PhoneCall/>Start closing call</button>
                  <button onClick={() => setModal("pricing")}><CircleDollarSign/>Review pricing options</button>
                  <button onClick={() => setModal("copilot")}><Sparkles/>Ask Copilot</button>
                  <button disabled={readOnly} onClick={() => setModal("activity")}><FileText/>Log activity</button>
                  <button disabled={readOnly} onClick={() => setModal("followup")}><CalendarClock/>Schedule follow-up</button>
                </div>
              </article>

              <article className="panel sprintPanel">
                <div className="panelHeader"><div><span className="sectionKicker"><Clock3 size={15}/> 15-MINUTE SPRINT</span><h2>Protect the next action</h2></div><span className="timerValue">{String(Math.floor(sprintSeconds / 60)).padStart(2, "0")}:{String(sprintSeconds % 60).padStart(2, "0")}</span></div>
                <p>One prospect. One next move. No inbox wandering.</p>
                <label className="sprintTask"><input type="checkbox"/> Open the advertiser detail</label>
                <label className="sprintTask"><input type="checkbox"/> Make the closing call</label>
                <label className="sprintTask"><input type="checkbox"/> Log the outcome and follow-up</label>
                <div className="buttonRow">
                  <button className="button primaryButton" onClick={() => setSprintRunning((value) => !value)}>{sprintRunning ? "Pause sprint" : "Start sprint"}</button>
                  <button className="iconButton" aria-label="Reset sprint" onClick={() => {setSprintSeconds(15 * 60); setSprintRunning(false);}}><RefreshCw size={17}/></button>
                </div>
              </article>
            </section>

            <section className="panel targetPanel">
              <div className="panelHeader"><div><span className="sectionKicker"><Target size={15}/> PILOT TARGET TRACKER</span><h2>Actual versus target</h2></div><span className="guardrailPill"><ShieldCheck size={14}/> Fun Maps operating targets · not CAI guarantees</span></div>
              <div className="targetLayout">
                <div className="weeklyTargets">
                  <TargetRow week="Week 1" target="2–3 sales" actual="2 sales" progress={80} status="On target"/>
                  <TargetRow week="Week 2" target="4–6 sales" actual="1 sale" progress={22} status="In progress"/>
                  <TargetRow week="Week 3" target="Confirm with Charley" actual="—" progress={0} status="Pending"/>
                  <TargetRow week="Week 4" target="Confirm with Charley" actual="—" progress={0} status="Pending"/>
                </div>
                <div className="conversionCard">
                  <span>Conversion lens</span>
                  <strong>40% achieved</strong>
                  <div className="conversionBar"><i style={{width: "40%"}}/><b style={{left: "50%"}}>50%</b><b style={{left: "68%"}}>68%</b></div>
                  <p>At 40 qualified closing conversations per month, 20 wins require 50%; 27 wins require 68%.</p>
                  <small>Use this to test the math—not to promise the outcome.</small>
                </div>
              </div>
            </section>

            <section className="twoColumn">
              <article className="panel">
                <div className="panelHeader"><div><span className="sectionKicker"><CalendarClock size={15}/> WEEKLY MILESTONES</span><h2>30-day validation path</h2></div></div>
                <div className="milestoneList">
                  <Milestone week="Week 1" title="Build the rhythm" detail="2–3 closes · two qualified closing conversations per day" state="active"/>
                  <Milestone week="Week 2" title="Increase the evidence" detail="4–6 closes · refine price and barrier handling" state="next"/>
                  <Milestone week="Week 3" title="Confirm the repeatable motion" detail="Target set after Week 2 evidence" state="pending"/>
                  <Milestone week="Week 4" title="Make the continuation decision" detail="Review revenue, adoption, attribution, and readiness" state="pending"/>
                </div>
              </article>
              <article className="panel">
                <div className="panelHeader"><div><span className="sectionKicker"><ActivityIcon size={15}/> FIVE-TOUCH CADENCE</span><h2>Keep every account moving</h2></div></div>
                <div className="cadence">
                  {["Day 1 · Personalized introduction", "Day 3 · Visitor/audience proof", "Day 6 · Pricing fit and objection", "Day 10 · Decision-maker close", "Day 14 · Respectful final follow-up"].map((item, index) => <div key={item}><b>{index + 1}</b><span>{item}</span><CheckCircle2 size={17}/></div>)}
                </div>
              </article>
            </section>
          </div>
        )}

        {view === "Pipeline + Activity" && (
          <div className="pageStack">
            <section className="pipelineToolbar panel">
              <div><span className="sectionKicker"><BriefcaseBusiness size={15}/> REGIONAL FOUR-MARKET PIPELINE</span><h2>{visibleOpportunities.length} advertiser opportunities</h2></div>
              <div className="toolbarActions"><div className="searchBox"><Search size={16}/><input aria-label="Search advertisers" placeholder="Search advertisers" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}/></div><button className="button secondaryButton" onClick={() => setModal("pricing")}><CircleDollarSign size={16}/> Pricing</button><button className="button primaryButton" disabled={readOnly} onClick={() => setModal("advertiser")}><Plus size={16}/> Add advertiser</button></div>
            </section>
            <section className="pipelineLayout">
              <div className="panel tablePanel">
                <div className="stageSummary">
                  {stages.map((stage) => <div key={stage}><span>{stage}</span><strong>{visibleOpportunities.filter((item) => item.stage === stage).length}</strong></div>)}
                </div>
                <div className="tableScroll">
                  <table>
                    <thead><tr><th>Advertiser</th><th>Market</th><th>Placement</th><th>Stage</th><th>Probability</th><th>Annual price</th><th>Close</th></tr></thead>
                    <tbody>{visibleOpportunities.map((opportunity) => (
                      <tr key={opportunity.id} className={selectedOpportunity.id === opportunity.id ? "selected" : ""} onClick={() => setSelectedId(opportunity.id)}>
                        <td><b>{opportunity.company}</b><span>{opportunity.contact}</span></td><td>{opportunity.market}</td><td>{opportunity.placement}</td><td><span className={`stagePill ${opportunity.stage.toLowerCase().replace(" ", "")}`}>{opportunity.stage}</span></td><td><div className="probability"><i style={{width: `${opportunity.probability}%`}}/><b>{opportunity.probability}%</b></div></td><td><strong>{money(opportunity.annualPrice)}</strong></td><td>{opportunity.expectedClose}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
              <OpportunityDetail opportunity={selectedOpportunity} readOnly={readOnly} setModal={setModal} setOpportunities={setOpportunities}/>
            </section>
            <section className="twoColumn activitySection">
              <article className="panel">
                <div className="panelHeader"><div><span className="sectionKicker"><ActivityIcon size={15}/> ACTIVITY LOG</span><h2>Recent movement</h2></div><button className="button secondaryButton" disabled={readOnly} onClick={() => setModal("activity")}><Plus size={15}/> Add</button></div>
                <div className="activityList">{activities.map((item) => <div className="activityItem" key={item.id}><div className="activityIcon">{item.type === "Call" ? <PhoneCall/> : item.type === "Email" ? <Mail/> : <FileText/>}</div><div><b>{item.account}</b><p>{item.detail}</p><span>{item.type} · {item.owner} · {item.time}</span></div></div>)}</div>
              </article>
              <article className="panel">
                <div className="panelHeader"><div><span className="sectionKicker"><BarChart3 size={15}/> PIPELINE MOVEMENT</span><h2>Value by stage</h2></div></div>
                <div className="stageBars">{stages.map((stage) => {
                  const value = visibleOpportunities.filter((item) => item.stage === stage).reduce((sum, item) => sum + item.annualPrice, 0);
                  return <div key={stage}><span>{stage}</span><i><b style={{width: `${Math.min(100, Math.max(4, value / 150))}%`}}/></i><strong>{money(value)}</strong></div>;
                })}</div>
                <div className="cadenceMini"><span>Cadence health</span><strong>6 of 8 accounts</strong><p>have a next action scheduled within 48 hours.</p></div>
              </article>
            </section>
          </div>
        )}

        {view === "Market Intelligence" && (
          <div className="pageStack">
            <section className="marketIntro panel">
              <div><span className="sectionKicker"><Compass size={15}/> FOUR-MARKET VIEW</span><h2>Use market context to sharpen the conversation.</h2><p>Pipeline and sales activity stay primary. Hotspot intelligence supports account selection and audience-fit stories.</p></div>
              <span className="guardrailPill"><Eye size={14}/> Pilot signals · validate before external use</span>
            </section>
            <section className="marketCards">
              {markets.map((item) => {
                const marketOpps = opportunities.filter((opportunity) => opportunity.market === item);
                const value = marketOpps.filter((opportunity) => !opportunity.stage.startsWith("Closed")).reduce((sum, opportunity) => sum + opportunity.annualPrice, 0);
                const average = Math.round(marketOpps.reduce((sum, opportunity) => sum + opportunity.probability, 0) / Math.max(marketOpps.length, 1));
                return <button key={item} className={intelMarket === item ? "marketCard active" : "marketCard"} onClick={() => setIntelMarket(item)}><div><Map size={19}/><span>{item}</span></div><strong>{money(value)}</strong><small>{marketOpps.length} accounts · {average}% avg. probability</small><em>Open intelligence <ChevronRight size={15}/></em></button>;
              })}
            </section>
            <section className="intelligenceLayout">
              <article className="panel hotspotPanel">
                <div className="panelHeader"><div><span className="sectionKicker"><Map size={15}/> {intelMarket.toUpperCase()} INTELLIGENCE</span><h2>{intelMarket === "San Diego" ? "First hotspot proof view" : "Market signal overview"}</h2></div><span className="marketPill">{intelMarket}</span></div>
                {intelMarket === "San Diego" ? (
                  <div className="sanDiegoMap" aria-label="Illustrative San Diego opportunity hotspot map">
                    <svg viewBox="0 0 560 360" role="img" aria-label="Illustrative map contours and opportunity hotspots">
                      <path d="M82 25 C165 45 221 18 290 55 C354 91 337 139 410 167 C467 188 492 236 451 287 C413 334 323 318 273 337 C203 363 109 318 111 251 C113 199 48 159 62 103 C69 73 77 45 82 25Z"/>
                      <path className="route" d="M104 57 C159 111 157 181 216 219 C278 259 349 247 429 302"/>
                      <path className="route secondary" d="M84 161 C169 149 235 111 325 121 C382 127 414 158 456 195"/>
                    </svg>
                    <div className="mapDot pink" style={{left: "34%", top: "38%"}}><b>92</b><span>Hillcrest</span></div>
                    <div className="mapDot violet" style={{left: "53%", top: "25%"}}><b>86</b><span>North Park</span></div>
                    <div className="mapDot gold" style={{left: "65%", top: "62%"}}><b>78</b><span>Liberty Station</span></div>
                    <div className="mapLegend"><i/><span>Opportunity score</span><small>Illustrative pilot view</small></div>
                  </div>
                ) : <div className="comingMap"><Compass size={42}/><h3>Signal view ready for pilot use</h3><p>A custom geographic hotspot layer is intentionally deferred until the San Diego proof view is validated.</p></div>}
              </article>
              <article className="panel signalListPanel">
                <div className="panelHeader"><div><span className="sectionKicker"><Flame size={15}/> PRIORITY AREAS</span><h2>Opportunity signals</h2></div></div>
                <div className="areaList">{marketSignals[intelMarket].map((signal, index) => <div key={signal.name}><b>0{index + 1}</b><span><strong>{signal.name}</strong><small>{signal.signal}</small></span><em>{signal.score}</em></div>)}</div>
                <div className="signalUse"><Lightbulb size={18}/><p><b>Use in the sales conversation</b>Connect the advertiser’s audience to the destination story. Do not present pilot signal scores as audited visitor counts.</p></div>
              </article>
            </section>
          </div>
        )}

        {view === "Decision Room" && (
          <div className="pageStack">
            <section className="decisionHero">
              <div><span className="sectionKicker"><Gauge size={15}/> END-OF-PILOT DECISION</span><h2>Did Phase 1 create repeatable revenue value?</h2><p>Use real pipeline movement, rep adoption, attribution, and operating readiness to choose the next commercial model.</p></div>
              <div className="decisionDate"><span>Decision review</span><strong>Day 30</strong><small>Charley · LaShea · Alan</small></div>
            </section>
            <section className="decisionScores">
              <EvidenceCard label="Paid retainer evidence" value={retainerEvidence} setValue={setRetainerEvidence} tone="violet"/>
              <EvidenceCard label="Revenue-share evidence" value={shareEvidence} setValue={setShareEvidence} tone="pink"/>
              <EvidenceCard label="Operating readiness" value={readiness} setValue={setReadiness} tone="green"/>
            </section>
            <section className="decisionChoices">
              <article className="recommended"><span>RECOMMENDED WHEN VALUE REPEATS</span><h3>Paid platform + advisory</h3><p>Use when the workflow supports four-market selling and needs ongoing configuration, coaching, and intelligence.</p><b>Working floor: $3,500/month</b></article>
              <article><span>WHEN ATTRIBUTION IS CLEAN</span><h3>Base fee + revenue share</h3><p>Use when originated revenue can be tracked reliably and payment timing, exclusions, and term are written down.</p><b>Working share: 15% attributed revenue</b></article>
              <article><span>WHEN VALUE IS NOT PROVEN</span><h3>Close the pilot cleanly</h3><p>Export agreed client data, document lessons, retain CAI build IP, and end the engagement without an implied obligation.</p><b>No forced continuation</b></article>
            </section>
            <section className="decisionGrid">
              <article className="panel economicsPanel">
                <div className="panelHeader"><div><span className="sectionKicker"><CircleDollarSign size={15}/> PHASE 1 ECONOMICS</span><h2>Draft pilot investment</h2></div><span className="signalBadge">Founding pilot</span></div>
                <div className="priceProposal"><div><span>Standard value</span><strong>$7,500</strong><small>30-day build + validation</small></div><ArrowRight/><div className="featured"><span>Founding pilot</span><strong>$5,000</strong><small>$2,500 on authorization · $2,500 on Day 15</small></div></div>
                <p className="finePrint">This is the draft commercial structure for the command-center infrastructure, configuration, and pilot support—not a fee for guaranteed sales results.</p>
              </article>
              <article className="panel guardrailsPanel">
                <div className="panelHeader"><div><span className="sectionKicker"><ShieldCheck size={15}/> CONTINUATION GUARDRAILS</span><h2>Protect the value</h2></div></div>
                {["90-day continuation review", "15% only on clearly attributed revenue", "CAI retains platform, workflow, and build IP", "Fun Maps retains its client and advertiser data", "No guaranteed close count or revenue outcome"].map((item) => <div key={item}><Check size={16}/><span>{item}</span></div>)}
              </article>
            </section>
            <section className="panel rolesPanel">
              <div className="panelHeader"><div><span className="sectionKicker"><UsersRound size={15}/> ROLES + ACCESS</span><h2>One pilot rep, clear ownership</h2></div></div>
              <div className="roleGrid"><div><span className="avatar violet">CH</span><h3>Charley</h3><b>Regional sales rep · pilot user</b><p>Full four-market pipeline, priority conversations, activity logging, and follow-up.</p></div><div><span className="avatar pink">LC</span><h3>LaShea</h3><b>Platform admin + revenue advisor</b><p>Configuration, revenue analysis, coaching, pilot evidence, and CAI IP stewardship.</p></div><div><span className="avatar gold">AL</span><h3>Alan</h3><b>Executive viewer</b><p>Read-only pipeline rollup, pilot economics, and continuation decision evidence.</p></div></div>
            </section>
          </div>
        )}
      </main>

      {modal && (
        <Modal title={modalTitle(modal)} onClose={() => setModal(null)}>
          {modal === "call" && <CallPrep opportunity={selectedOpportunity} onComplete={finishCall}/>}
          {modal === "pricing" && <PricingPlaybook/>}
          {modal === "copilot" && <Copilot opportunity={selectedOpportunity}/>}
          {modal === "activity" && <ActivityForm opportunities={opportunities} selected={selectedOpportunity.company} onSubmit={logActivity}/>}
          {modal === "followup" && <FollowUpForm opportunity={selectedOpportunity} onSubmit={scheduleFollowUp}/>}
          {modal === "advertiser" && <AdvertiserForm onSubmit={addAdvertiser}/>}
        </Modal>
      )}
    </div>
  );
}

function MetricCard({label, value, note, icon, tone}: {label: string; value: string; note: string; icon: ReactNode; tone: string}) {
  return <article className={`metricCard ${tone}`}><div className="metricIcon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function TargetRow({week, target, actual, progress, status}: {week: string; target: string; actual: string; progress: number; status: string}) {
  return <div className="targetRow"><b>{week}</b><span><small>Target</small>{target}</span><span><small>Actual</small>{actual}</span><i><b style={{width: `${progress}%`}}/></i><em>{status}</em></div>;
}

function Milestone({week, title, detail, state}: {week: string; title: string; detail: string; state: string}) {
  return <div className={`milestone ${state}`}><span>{state === "active" ? <Check/> : <i/>}</span><div><b>{week} · {title}</b><p>{detail}</p></div></div>;
}

function OpportunityDetail({opportunity, readOnly, setModal, setOpportunities}: {
  opportunity: Opportunity;
  readOnly: boolean;
  setModal: (value: ModalName) => void;
  setOpportunities: Dispatch<SetStateAction<Opportunity[]>>;
}) {
  function updateStage(stage: Stage) {
    setOpportunities((items) => items.map((item) => item.id === opportunity.id ? {...item, stage, probability: stage === "Closed Won" ? 100 : item.probability} : item));
  }
  return <aside className="detailPanel panel">
    <div className="detailHero"><div className="companyIcon"><Building2/></div><span className="marketPill">{opportunity.market}</span><h2>{opportunity.company}</h2><p>{opportunity.contact} · {opportunity.role}</p><strong>{money(opportunity.annualPrice)} annual</strong></div>
    <div className="detailFields"><label>Placement<span>{opportunity.placement}</span></label><label>Stage<select disabled={readOnly} value={opportunity.stage} onChange={(event) => updateStage(event.target.value as Stage)}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label>Probability<span>{opportunity.probability}%</span></label><label>Expected close<span>{opportunity.expectedClose}</span></label><label>Last interaction<span>{opportunity.lastInteraction}</span></label></div>
    <div className="barrierBox"><span>Current barrier</span><p>{opportunity.barrier}</p></div>
    <div className="recommendationBox"><Sparkles/><div><span>Recommended next action</span><p>{opportunity.nextAction}</p></div></div>
    <div className="detailActions"><button className="button primaryButton" disabled={readOnly} onClick={() => setModal("call")}><PhoneCall size={16}/> Start call</button><button className="button secondaryButton" onClick={() => setModal("copilot")}><MessageSquareText size={16}/> Ask Copilot</button><button className="button secondaryButton" disabled={readOnly} onClick={() => setModal("followup")}><CalendarClock size={16}/> Follow-up</button></div>
  </aside>;
}

function EvidenceCard({label, value, setValue, tone}: {label: string; value: number; setValue: (value: number) => void; tone: string}) {
  return <article className={`evidenceCard ${tone}`}><span>{label}</span><strong>{value}<small>/100</small></strong><input aria-label={label} type="range" min="0" max="100" value={value} onChange={(event) => setValue(Number(event.target.value))}/><p>{value >= 75 ? "Strong enough to carry into the Day 30 decision." : value >= 55 ? "Promising; strengthen the evidence before committing." : "Insufficient evidence for continuation yet."}</p></article>;
}

function Modal({title, onClose, children}: {title: string; onClose: () => void; children: ReactNode}) {
  return <div className="modalBackdrop" role="presentation" onMouseDown={onClose}><section className="modalCard" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><header><div><span className="sectionKicker">PHASE 1 PILOT</span><h2>{title}</h2></div><button className="iconButton" aria-label="Close" onClick={onClose}><X/></button></header>{children}</section></div>;
}

function CallPrep({opportunity, onComplete}: {opportunity: Opportunity; onComplete: () => void}) {
  return <div className="modalBody"><div className="callAccount"><div><span>{opportunity.market}</span><h3>{opportunity.company}</h3><p>{opportunity.contact} · {opportunity.role}</p></div><strong>{money(opportunity.annualPrice)}</strong></div><div className="talkTrack"><span>Suggested close</span><p>“Based on what you shared, the <b>{opportunity.placement.toLowerCase()}</b> is the strongest fit. If we resolve <b>{opportunity.barrier.toLowerCase()}</b>, are you comfortable authorizing the annual placement today?”</p></div><div className="callChecklist"><label><input type="checkbox"/> Confirm the decision-maker</label><label><input type="checkbox"/> Restate the annual value</label><label><input type="checkbox"/> Ask directly for authorization</label><label><input type="checkbox"/> Agree on the next date</label></div><button className="button primaryButton fullButton" onClick={onComplete}><CheckCircle2/> Mark qualified call complete</button></div>;
}

function PricingPlaybook() {
  return <div className="modalBody"><p className="modalIntro">Annual advertising inventory. Confirm final production language and placement availability before an external quote.</p><div className="pricingTable">{pricing.map((item) => <div key={item.name}><span><b>{item.name}</b><small>{item.guidance}</small></span><em>{item.comparison}</em><strong>{money(item.price)}</strong></div>)}</div><div className="pricingCoach"><Lightbulb/><p><b>Price conversation</b>Start with the $7,500 complete annual package. Move to the $5,000 bleed or $4,500 non-bleed page based on fit—not as an automatic discount.</p></div></div>;
}

function Copilot({opportunity}: {opportunity: Opportunity}) {
  const alternatives = pricing.filter((item) => item.price <= opportunity.annualPrice).slice(0, 3);
  return <div className="modalBody"><div className="copilotLead"><Sparkles/><div><span>Revenue signal for {opportunity.company}</span><h3>Resolve the barrier, then ask for the close.</h3></div></div><div className="copilotAnswer"><p><b>What matters now:</b> {opportunity.barrier}</p><p><b>Recommended move:</b> {opportunity.nextAction}</p><p><b>Close question:</b> “If we settle that point today, is there anything else preventing the annual placement from moving forward?”</p></div><div><span className="fieldLabel">Relevant pricing paths</span><div className="optionChips">{alternatives.map((item) => <span key={item.name}>{item.name} · {money(item.price)}</span>)}</div></div><p className="finePrint">Copilot guidance uses pilot rules and sample data; Charley remains responsible for the conversation and final quote.</p></div>;
}

function ActivityForm({opportunities, selected, onSubmit}: {opportunities: Opportunity[]; selected: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void}) {
  return <form className="modalBody formStack" onSubmit={onSubmit}><label>Advertiser<select name="account" defaultValue={selected}>{opportunities.map((item) => <option key={item.id}>{item.company}</option>)}</select></label><label>Activity type<select name="type"><option>Call</option><option>Email</option><option>Meeting</option><option>Note</option></select></label><label>Outcome or note<textarea name="detail" required placeholder="What moved, what blocked, and what happens next?"/></label><button className="button primaryButton fullButton"><FileText/> Save activity</button></form>;
}

function FollowUpForm({opportunity, onSubmit}: {opportunity: Opportunity; onSubmit: (event: FormEvent<HTMLFormElement>) => void}) {
  return <form className="modalBody formStack" onSubmit={onSubmit}><div className="callAccount"><div><span>{opportunity.market}</span><h3>{opportunity.company}</h3><p>{opportunity.contact}</p></div><CalendarClock/></div><label>Follow-up date<input name="date" type="date" required/></label><label>Next action<textarea name="detail" required defaultValue={opportunity.nextAction}/></label><button className="button primaryButton fullButton"><CalendarClock/> Schedule follow-up</button></form>;
}

function AdvertiserForm({onSubmit}: {onSubmit: (event: FormEvent<HTMLFormElement>) => void}) {
  return <form className="modalBody formStack" onSubmit={onSubmit}><div className="formGrid"><label>Business<input name="company" required/></label><label>Decision-maker<input name="contact" required/></label><label>Contact role<input name="role" required/></label><label>Market<select name="market">{markets.map((item) => <option key={item}>{item}</option>)}</select></label><label className="wide">Annual placement<select name="placement">{pricing.map((item) => <option key={item.name}>{item.name} · {money(item.price)}</option>)}</select></label><label className="wide">Expected close<input name="closeDate" placeholder="Oct 4" required/></label></div><button className="button primaryButton fullButton"><Plus/> Add to the regional pipeline</button></form>;
}

function modalTitle(modal: Exclude<ModalName, null>) {
  return {call: "Closing call prep", pricing: "Annual pricing playbook", copilot: "Ask Revenue Copilot", activity: "Log sales activity", followup: "Schedule follow-up", advertiser: "Add advertiser"}[modal];
}
