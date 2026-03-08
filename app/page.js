"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const TASKS_KEY = "pcs_tasks_v1";
const RENTALS_KEY = "pcs_rentals_v1";
const BUDGET_KEY = "pcs_budget_v1";
const CONTACTS_KEY = "pcs_contacts_v1";
const SALE_KEY = "pcs_house_sale_v1";

const tabs = ["Dashboard", "Master Plan", "House Sale", "Rental Search", "Budget", "Contacts", "Onboarding"];

const seedTasks = [
  { id: 1, phase: "Orders", category: "Admin", task: "Submit final checklist for official PCS orders", owner: "Philip", status: "In Progress", priority: "Critical", dueDate: "2026-03-13", dependency: "Commander sign-off", notes: "Orders unlock DPS and reimbursement items." },
  { id: 2, phase: "House Sale", category: "Housing", task: "Deep clean, paint touch-ups, curb appeal prep", owner: "Philip", status: "Not Started", priority: "High", dueDate: "2026-03-27", dependency: "Declutter complete", notes: "Prep for listing photos and open house." },
  { id: 3, phase: "Move", category: "Logistics", task: "Schedule HHG move in DPS", owner: "Philip", status: "Blocked", priority: "Critical", dueDate: "2026-05-08", dependency: "Orders issued", notes: "Cannot proceed until orders are posted." },
  { id: 4, phase: "Family", category: "School", task: "Collect school records for 7-year-old", owner: "Claire", status: "Not Started", priority: "High", dueDate: "2026-05-22", dependency: "School office availability", notes: "Need records before transfer enrollment." },
  { id: 5, phase: "Travel", category: "Transport", task: "Plan MD to FWB route with kid-friendly overnight", owner: "Family", status: "Not Started", priority: "Medium", dueDate: "2026-07-10", dependency: "Packout date locked", notes: "Prefer one stop and predictable routine." },
];

const seedMilestones = [
  { id: 1, title: "Listing live", owner: "Realtor", targetDate: "2026-04-03", actualDate: "", status: "Not Started", notes: "Photos + listing copy complete." },
  { id: 2, title: "Under contract", owner: "Philip", targetDate: "2026-05-01", actualDate: "", status: "Not Started", notes: "Aim for offer acceptance by early May." },
  { id: 3, title: "Closing complete", owner: "Title Co", targetDate: "2026-06-26", actualDate: "", status: "Not Started", notes: "Coordinate utility cutoff and forwarding." },
];

const seedRentals = [
  { id: 1, property: "Harbor Oaks 3BR", link: "", area: "Fort Walton Beach", beds: 3, rent: 2400, commuteMin: 14, leaseStart: "2026-07-15", status: "Researching", notes: "Close to parks and schools.", favorite: true },
  { id: 2, property: "Mary Esther Townhome", link: "", area: "Mary Esther", beds: 3, rent: 2150, commuteMin: 10, leaseStart: "2026-07-20", status: "Tour Scheduled", notes: "Great commute, tighter storage.", favorite: false },
  { id: 3, property: "Wright Family Rental", link: "", area: "Wright", beds: 3, rent: 2050, commuteMin: 16, leaseStart: "2026-07-12", status: "Researching", notes: "Budget-friendly backup option.", favorite: false },
];

const seedBudget = [
  { id: 1, category: "Fuel", estimate: 350, actual: 0, reimbursable: "Yes", notes: "Two vehicles" },
  { id: 2, category: "Hotels", estimate: 450, actual: 0, reimbursable: "Yes", notes: "1-night stop" },
  { id: 3, category: "Packing Supplies", estimate: 120, actual: 0, reimbursable: "Partial", notes: "For partial PPM items" },
  { id: 4, category: "Cleaning & Touchups", estimate: 300, actual: 0, reimbursable: "No", notes: "Pre-listing prep" },
];

const seedContacts = [
  { id: 1, role: "Realtor", name: "Jen Cooper", phone: "(410) 555-0121", email: "jen@example.com", location: "Arnold, MD", status: "Active", notes: "Primary listing contact." },
  { id: 2, role: "Sponsor", name: "MSgt Allen", phone: "(850) 555-0190", email: "allen@example.com", location: "Hurlburt Field", status: "Pending Intro", notes: "Need inbound checklist." },
  { id: 3, role: "School Registrar", name: "Pine Elementary", phone: "(443) 555-0177", email: "registrar@example.edu", location: "Arnold, MD", status: "Active", notes: "Records request in progress." },
];

const safeDateDiff = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
};

const priorityClass = (priority) => `badge ${priority.toLowerCase()}`;
const statusBadgeClass = (status, overdue) => {
  if (overdue) return "badge status-overdue";
  if (status === "Complete") return "badge status-complete";
  if (status === "In Progress") return "badge status-progress";
  return "badge status-default";
};

function readLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function PCSPlannerPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [tasks, setTasks] = useState(seedTasks);
  const [milestones, setMilestones] = useState(seedMilestones);
  const [rentals, setRentals] = useState(seedRentals);
  const [budget, setBudget] = useState(seedBudget);
  const [contacts, setContacts] = useState(seedContacts);
  const [toast, setToast] = useState("");
  const [warning, setWarning] = useState("");

  const [taskForm, setTaskForm] = useState({ phase: "Admin", category: "Admin", task: "", owner: "Philip", status: "Not Started", priority: "Medium", dueDate: "", dependency: "", notes: "" });
  const [taskFilters, setTaskFilters] = useState({ search: "", status: "All", owner: "All", category: "All", priority: "All", phase: "All", sort: "dueDate" });

  useEffect(() => {
    setTasks(readLocal(TASKS_KEY, seedTasks));
    setRentals(readLocal(RENTALS_KEY, seedRentals));
    setBudget(readLocal(BUDGET_KEY, seedBudget));
    setContacts(readLocal(CONTACTS_KEY, seedContacts));
    setMilestones(readLocal(SALE_KEY, seedMilestones));
  }, []);

  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals)); }, [rentals]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(BUDGET_KEY, JSON.stringify(budget)); }, [budget]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(SALE_KEY, JSON.stringify(milestones)); }, [milestones]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const loadSupabaseTasks = async () => {
      if (!supabase) return;
      const { data, error } = await supabase.from("tasks").select("*").order("id", { ascending: true });
      if (error) {
        setWarning(`Supabase sync warning: ${error.message}`);
        return;
      }
      if (Array.isArray(data) && data.length) {
        setTasks((prev) => {
          const merged = data.map((row) => ({
            id: row.id,
            phase: row.phase || "Admin",
            category: row.category || "Admin",
            task: row.task,
            owner: row.owner || "Family",
            status: row.status || "Not Started",
            priority: row.priority || "Medium",
            dueDate: row.dueDate || row.target || "",
            dependency: row.dependency || "",
            notes: row.notes || "",
          }));
          return merged.length ? merged : prev;
        });
      }
    };
    loadSupabaseTasks();
  }, []);

  const enrichedTasks = useMemo(() => tasks.map((task) => {
    const daysToDue = safeDateDiff(task.dueDate);
    const overdue = daysToDue !== null && daysToDue < 0 && task.status !== "Complete";
    const dueSoon = daysToDue !== null && daysToDue >= 0 && daysToDue <= 14 && task.status !== "Complete";
    return { ...task, daysToDue, overdue, dueSoon };
  }), [tasks]);

  const metrics = useMemo(() => {
    const total = enrichedTasks.length;
    const completed = enrichedTasks.filter((t) => t.status === "Complete").length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    const openCritical = enrichedTasks.filter((t) => t.priority === "Critical" && t.status !== "Complete").length;
    const due14 = enrichedTasks.filter((t) => t.dueSoon).length;
    const overdue = enrichedTasks.filter((t) => t.overdue).length;
    return { total, completed, percent, openCritical, due14, overdue };
  }, [enrichedTasks]);

  const filteredTasks = useMemo(() => {
    const s = taskFilters.search.toLowerCase();
    const phaseRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };

    const list = enrichedTasks.filter((t) => {
      if (taskFilters.status !== "All" && t.status !== taskFilters.status) return false;
      if (taskFilters.owner !== "All" && t.owner !== taskFilters.owner) return false;
      if (taskFilters.category !== "All" && t.category !== taskFilters.category) return false;
      if (taskFilters.priority !== "All" && t.priority !== taskFilters.priority) return false;
      if (taskFilters.phase !== "All" && t.phase !== taskFilters.phase) return false;
      if (!(`${t.task} ${t.notes} ${t.owner} ${t.phase}`.toLowerCase().includes(s))) return false;
      return true;
    });

    if (taskFilters.sort === "priority") return [...list].sort((a, b) => (phaseRank[a.priority] ?? 99) - (phaseRank[b.priority] ?? 99));
    if (taskFilters.sort === "status") return [...list].sort((a, b) => a.status.localeCompare(b.status));
    return [...list].sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  }, [enrichedTasks, taskFilters]);

  const budgetSummary = useMemo(() => {
    const estimate = budget.reduce((sum, item) => sum + Number(item.estimate || 0), 0);
    const actual = budget.reduce((sum, item) => sum + Number(item.actual || 0), 0);
    const variance = actual - estimate;
    return { estimate, actual, variance };
  }, [budget]);

  const rentalScored = useMemo(() => {
    const targetRent = 2400;
    const targetCommute = 15;
    return rentals.map((r) => {
      let score = 100;
      score -= Math.max(0, Number(r.rent) - targetRent) / 25;
      score -= Math.max(0, Number(r.commuteMin) - targetCommute) * 2;
      score += Number(r.beds) >= 3 ? 8 : -6;
      score += r.favorite ? 10 : 0;
      return { ...r, fitScore: Math.max(0, Math.round(score)) };
    }).sort((a, b) => b.fitScore - a.fitScore);
  }, [rentals]);

  const addTask = async () => {
    if (!taskForm.task.trim()) return;
    const nextId = tasks.length ? Math.max(...tasks.map((t) => Number(t.id) || 0)) + 1 : 1;
    const created = { id: nextId, ...taskForm, task: taskForm.task.trim() };
    setTasks((prev) => [created, ...prev]);
    setTaskForm({ phase: "Admin", category: "Admin", task: "", owner: "Philip", status: "Not Started", priority: "Medium", dueDate: "", dependency: "", notes: "" });
    setToast("Task added.");

    if (supabase) {
      const payload = { ...created, target: created.dueDate };
      const { error } = await supabase.from("tasks").upsert(payload);
      if (error) setWarning(`Supabase save warning: ${error.message}`);
    }
  };

  const updateTask = (id, patch) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    setToast("Task updated.");
  };

  const addRental = () => {
    const id = rentals.length ? Math.max(...rentals.map((r) => r.id)) + 1 : 1;
    setRentals((prev) => [{ id, property: "", link: "", area: "", beds: 3, rent: 0, commuteMin: 15, leaseStart: "", status: "Researching", notes: "", favorite: false }, ...prev]);
    setToast("Rental row added.");
  };

  const addBudget = () => {
    const id = budget.length ? Math.max(...budget.map((b) => b.id)) + 1 : 1;
    setBudget((prev) => [{ id, category: "New Item", estimate: 0, actual: 0, reimbursable: "No", notes: "" }, ...prev]);
    setToast("Budget row added.");
  };

  const addContact = () => {
    const id = contacts.length ? Math.max(...contacts.map((c) => c.id)) + 1 : 1;
    setContacts((prev) => [{ id, role: "", name: "", phone: "", email: "", location: "", status: "Active", notes: "" }, ...prev]);
    setToast("Contact added.");
  };

  const milestoneProgress = milestones.length ? Math.round((milestones.filter((m) => m.status === "Complete").length / milestones.length) * 100) : 0;

  return (
    <main className="app-shell">
      <section className="header">
        <h1 style={{ margin: 0 }}>Barry Family PCS Planner</h1>
        <p className="muted" style={{ marginTop: 6 }}>A calm operations center for your move from Arnold, MD to Hurlburt Field / Fort Walton Beach.</p>
        <div className="nav-tabs">
          {tabs.map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </div>
      </section>

      {warning && <p className="alert">{warning}</p>}
      {toast && <p className="success">{toast}</p>}

      {activeTab === "Dashboard" && (
        <section className="grid" style={{ gap: 14 }}>
          <div className="grid kpi">
            <KpiCard label="Total Tasks" value={metrics.total} />
            <KpiCard label="Completed" value={metrics.completed} />
            <KpiCard label="Percent Complete" value={`${metrics.percent}%`} />
            <KpiCard label="Open Critical" value={metrics.openCritical} />
            <KpiCard label="Due in 14 Days" value={metrics.due14} />
          </div>

          <div className="grid two">
            <div className="card">
              <h3 className="section-title">This Week / Priority Focus</h3>
              <p className="muted">Focus on overdue + critical items first.</p>
              <ul>
                {enrichedTasks.filter((t) => t.priority === "Critical" || t.overdue).slice(0, 5).map((t) => (
                  <li key={t.id} style={{ marginBottom: 6 }}>
                    <strong>{t.task}</strong> <span className={priorityClass(t.priority)}>{t.priority}</span>
                    <div className="muted">{t.owner} • {t.phase} • due {t.dueDate || "TBD"}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="section-title">Upcoming / Overdue</h3>
              {metrics.overdue > 0 ? <p className="alert">{metrics.overdue} tasks are overdue — let's clear these first.</p> : <p className="success">No overdue tasks. Great job staying ahead.</p>}
              <div style={{ marginTop: 10 }}>
                {enrichedTasks.filter((t) => t.dueSoon).slice(0, 5).map((t) => (
                  <div key={t.id} style={{ marginBottom: 8 }}>
                    <strong>{t.task}</strong>
                    <div className="muted">Due in {t.daysToDue} day(s) • {t.owner}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid two">
            <div className="card">
              <h3>Housing Summary</h3>
              <p className="muted">House milestones complete: {milestoneProgress}%</p>
              <div className="progress"><span style={{ width: `${milestoneProgress}%` }} /></div>
              <p className="muted" style={{ marginTop: 8 }}>Shortlisted rentals: {rentalScored.filter((r) => r.favorite).length} • Best fit: {rentalScored[0]?.property || "N/A"}</p>
            </div>
            <div className="card">
              <h3>Budget Summary</h3>
              <p>Estimate: <strong>${budgetSummary.estimate.toLocaleString()}</strong></p>
              <p>Actual: <strong>${budgetSummary.actual.toLocaleString()}</strong></p>
              <p>Variance: <strong style={{ color: budgetSummary.variance > 0 ? "#b91c1c" : "#166534" }}>${budgetSummary.variance.toLocaleString()}</strong></p>
            </div>
          </div>
        </section>
      )}

      {activeTab === "Master Plan" && (
        <section className="card">
          <h3>Master Plan</h3>
          <p className="muted">Track every task, dependency, owner, and due date in one place.</p>

          <div className="controls">
            <input placeholder="Search tasks" value={taskFilters.search} onChange={(e) => setTaskFilters((f) => ({ ...f, search: e.target.value }))} />
            <select value={taskFilters.status} onChange={(e) => setTaskFilters((f) => ({ ...f, status: e.target.value }))}><option>All</option><option>Not Started</option><option>In Progress</option><option>Blocked</option><option>Complete</option></select>
            <select value={taskFilters.priority} onChange={(e) => setTaskFilters((f) => ({ ...f, priority: e.target.value }))}><option>All</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
            <select value={taskFilters.sort} onChange={(e) => setTaskFilters((f) => ({ ...f, sort: e.target.value }))}><option value="dueDate">Sort: Due Date</option><option value="priority">Sort: Priority</option><option value="status">Sort: Status</option></select>
          </div>

          <div className="grid three" style={{ marginBottom: 10 }}>
            <input placeholder="Task" value={taskForm.task} onChange={(e) => setTaskForm((p) => ({ ...p, task: e.target.value }))} />
            <input placeholder="Owner" value={taskForm.owner} onChange={(e) => setTaskForm((p) => ({ ...p, owner: e.target.value }))} />
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))} />
            <select value={taskForm.phase} onChange={(e) => setTaskForm((p) => ({ ...p, phase: e.target.value }))}><option>Admin</option><option>Orders</option><option>House Sale</option><option>Move</option><option>Family</option><option>Travel</option><option>Arrival</option></select>
            <select value={taskForm.category} onChange={(e) => setTaskForm((p) => ({ ...p, category: e.target.value }))}><option>Admin</option><option>Housing</option><option>Logistics</option><option>School</option><option>Finance</option></select>
            <select value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select>
            <input placeholder="Dependency" value={taskForm.dependency} onChange={(e) => setTaskForm((p) => ({ ...p, dependency: e.target.value }))} />
            <input placeholder="Notes" value={taskForm.notes} onChange={(e) => setTaskForm((p) => ({ ...p, notes: e.target.value }))} />
            <button className="primary" onClick={addTask}>Add Task</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Task</th><th>Owner</th><th>Status</th><th>Priority</th><th>Due</th><th>Days</th><th>Notes</th></tr></thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td><strong>{t.task}</strong><div className="muted">{t.phase} • {t.category} • dep: {t.dependency || "none"}</div></td>
                    <td>{t.owner}</td>
                    <td>
                      <select value={t.status} onChange={(e) => updateTask(t.id, { status: e.target.value })}>
                        <option>Not Started</option><option>In Progress</option><option>Blocked</option><option>Complete</option>
                      </select>
                      {t.overdue && <span className="badge status-overdue" style={{ marginLeft: 6 }}>Overdue</span>}
                    </td>
                    <td><span className={priorityClass(t.priority)}>{t.priority}</span></td>
                    <td>{t.dueDate || "TBD"}</td>
                    <td>{t.daysToDue === null ? "-" : t.daysToDue}</td>
                    <td>{t.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "House Sale" && (
        <section className="card">
          <h3>House Sale Tracker</h3>
          <p className="muted">Property: 911 Whitstable Blvd, Arnold, MD</p>
          <p className="muted">Track milestone status with target vs actual dates.</p>
          <div className="progress" style={{ marginBottom: 10 }}><span style={{ width: `${milestoneProgress}%` }} /></div>
          <div className="table-wrap"><table><thead><tr><th>Milestone</th><th>Owner</th><th>Target</th><th>Actual</th><th>Status</th><th>Notes</th></tr></thead><tbody>
            {milestones.map((m) => (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td>{m.owner}</td>
                <td><input type="date" value={m.targetDate} onChange={(e) => setMilestones((prev) => prev.map((x) => x.id === m.id ? { ...x, targetDate: e.target.value } : x))} /></td>
                <td><input type="date" value={m.actualDate} onChange={(e) => setMilestones((prev) => prev.map((x) => x.id === m.id ? { ...x, actualDate: e.target.value } : x))} /></td>
                <td><select value={m.status} onChange={(e) => setMilestones((prev) => prev.map((x) => x.id === m.id ? { ...x, status: e.target.value } : x))}><option>Not Started</option><option>In Progress</option><option>Complete</option></select></td>
                <td><input value={m.notes} onChange={(e) => setMilestones((prev) => prev.map((x) => x.id === m.id ? { ...x, notes: e.target.value } : x))} /></td>
              </tr>
            ))}
          </tbody></table></div>
        </section>
      )}

      {activeTab === "Rental Search" && (
        <section className="card">
          <h3>Rental Search</h3>
          <p className="muted">Compare options, shortlist favorites, and surface best-fit rentals.</p>
          <button className="ghost" onClick={addRental}>Add Rental Option</button>
          <div className="grid three" style={{ marginTop: 10 }}>
            {rentalScored.map((r) => (
              <article key={r.id} className="card" style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{r.property || "Untitled property"}</strong>
                  <span className="badge medium">Fit {r.fitScore}</span>
                </div>
                <p className="muted" style={{ margin: "4px 0" }}>{r.area} • {r.beds} BR • ${Number(r.rent).toLocaleString()} • {r.commuteMin} min commute</p>
                <input value={r.property} placeholder="Property name" onChange={(e) => setRentals((prev) => prev.map((x) => x.id === r.id ? { ...x, property: e.target.value } : x))} />
                <div className="controls" style={{ marginTop: 8 }}>
                  <input type="number" value={r.rent} onChange={(e) => setRentals((prev) => prev.map((x) => x.id === r.id ? { ...x, rent: Number(e.target.value || 0) } : x))} />
                  <input type="number" value={r.commuteMin} onChange={(e) => setRentals((prev) => prev.map((x) => x.id === r.id ? { ...x, commuteMin: Number(e.target.value || 0) } : x))} />
                  <select value={r.status} onChange={(e) => setRentals((prev) => prev.map((x) => x.id === r.id ? { ...x, status: e.target.value } : x))}><option>Researching</option><option>Tour Scheduled</option><option>Applied</option><option>Rejected</option><option>Selected</option></select>
                  <button className="ghost" onClick={() => setRentals((prev) => prev.map((x) => x.id === r.id ? { ...x, favorite: !x.favorite } : x))}>{r.favorite ? "★ Shortlisted" : "☆ Shortlist"}</button>
                </div>
                <textarea rows={2} placeholder="Notes" value={r.notes} onChange={(e) => setRentals((prev) => prev.map((x) => x.id === r.id ? { ...x, notes: e.target.value } : x))} />
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "Budget" && (
        <section className="card">
          <h3>Budget Tracker</h3>
          <p className="muted">Estimate vs actual, reimbursable visibility, and overrun awareness.</p>
          <button className="ghost" onClick={addBudget}>Add Budget Item</button>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table><thead><tr><th>Category</th><th>Estimate</th><th>Actual</th><th>Variance</th><th>Reimbursable</th><th>Notes</th></tr></thead><tbody>
              {budget.map((item) => {
                const variance = Number(item.actual || 0) - Number(item.estimate || 0);
                return (
                  <tr key={item.id}>
                    <td><input value={item.category} onChange={(e) => setBudget((prev) => prev.map((x) => x.id === item.id ? { ...x, category: e.target.value } : x))} /></td>
                    <td><input type="number" value={item.estimate} onChange={(e) => setBudget((prev) => prev.map((x) => x.id === item.id ? { ...x, estimate: Number(e.target.value || 0) } : x))} /></td>
                    <td><input type="number" value={item.actual} onChange={(e) => setBudget((prev) => prev.map((x) => x.id === item.id ? { ...x, actual: Number(e.target.value || 0) } : x))} /></td>
                    <td style={{ color: variance > 0 ? "#b91c1c" : "#166534" }}>${variance.toLocaleString()}</td>
                    <td><select value={item.reimbursable} onChange={(e) => setBudget((prev) => prev.map((x) => x.id === item.id ? { ...x, reimbursable: e.target.value } : x))}><option>Yes</option><option>Partial</option><option>No</option></select></td>
                    <td><input value={item.notes} onChange={(e) => setBudget((prev) => prev.map((x) => x.id === item.id ? { ...x, notes: e.target.value } : x))} /></td>
                  </tr>
                );
              })}
            </tbody></table>
          </div>
          <div className="grid three" style={{ marginTop: 10 }}>
            <div className="card"><div className="muted">Total Estimate</div><div className="kpi-value">${budgetSummary.estimate.toLocaleString()}</div></div>
            <div className="card"><div className="muted">Total Actual</div><div className="kpi-value">${budgetSummary.actual.toLocaleString()}</div></div>
            <div className="card"><div className="muted">Total Variance</div><div className="kpi-value" style={{ color: budgetSummary.variance > 0 ? "#b91c1c" : "#166534" }}>${budgetSummary.variance.toLocaleString()}</div></div>
          </div>
        </section>
      )}

      {activeTab === "Contacts" && (
        <section className="card">
          <h3>Contacts</h3>
          <p className="muted">Keep your move network handy — realtor, sponsor, schools, movers, and admin help.</p>
          <button className="ghost" onClick={addContact}>Add Contact</button>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table><thead><tr><th>Role</th><th>Name</th><th>Phone</th><th>Email</th><th>Location</th><th>Status</th><th>Notes</th></tr></thead><tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td><input value={c.role} onChange={(e) => setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, role: e.target.value } : x))} /></td>
                  <td><input value={c.name} onChange={(e) => setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} /></td>
                  <td><input value={c.phone} onChange={(e) => setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, phone: e.target.value } : x))} /></td>
                  <td><input value={c.email} onChange={(e) => setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, email: e.target.value } : x))} /></td>
                  <td><input value={c.location} onChange={(e) => setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, location: e.target.value } : x))} /></td>
                  <td><select value={c.status} onChange={(e) => setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, status: e.target.value } : x))}><option>Active</option><option>Pending Intro</option><option>Needs Follow-up</option><option>Done</option></select></td>
                  <td><input value={c.notes} onChange={(e) => setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, notes: e.target.value } : x))} /></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </section>
      )}

      {activeTab === "Onboarding" && (
        <section className="grid two">
          <article className="card">
            <h3>Welcome to your PCS Operations Center</h3>
            <p className="muted">Start in <strong>Dashboard</strong> to see priorities, then use <strong>Master Plan</strong> to update tasks daily.</p>
            <ul>
              <li><strong>Dashboard:</strong> daily snapshot of progress, urgent tasks, and budget/housing status.</li>
              <li><strong>Master Plan:</strong> all move tasks with filters, due dates, and priorities.</li>
              <li><strong>House Sale:</strong> milestone timeline from listing to close.</li>
              <li><strong>Rental Search:</strong> compare options and shortlist best fit homes.</li>
              <li><strong>Budget:</strong> estimate vs actual expenses and reimbursement visibility.</li>
              <li><strong>Contacts:</strong> everyone you need to call in one place.</li>
            </ul>
          </article>
          <article className="card">
            <h3>How progress is calculated</h3>
            <p className="muted">Progress uses completed task count divided by total tasks. Due-in-14 and overdue are computed from due dates and status.</p>
            <div className="grid">
              <div><span className="badge status-complete">Complete</span> counts toward overall progress.</div>
              <div><span className="badge status-overdue">Overdue</span> means due date is in the past and task is not complete.</div>
              <div><span className="badge critical">Critical</span> tracks highest urgency open actions.</div>
            </div>
            <p className="muted" style={{ marginTop: 10 }}>Tip: Update task statuses each evening to keep the dashboard trustworthy.</p>
          </article>
        </section>
      )}
    </main>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="card">
      <div className="muted">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
