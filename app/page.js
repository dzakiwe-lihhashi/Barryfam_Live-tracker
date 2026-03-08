import React, { useMemo, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Car, DollarSign, Home, MapPin, Plane, Plus, School, Truck, X } from "lucide-react";

const initialTasks = [
  {
    id: 1,
    phase: "Orders",
    task: "Complete admin items required to generate PCS orders",
    owner: "Philip",
    target: "2026-03-13",
    status: "In Progress",
    priority: "Critical",
    notes: "Top priority. Orders unlock TMO, PPM, DLA, and scheduling.",
    done: false,
  },
  {
    id: 2,
    phase: "Orders",
    task: "Confirm sponsor contact at Hurlburt Field",
    owner: "Philip",
    target: "2026-03-13",
    status: "Not Started",
    priority: "High",
    notes: "Request inbound checklist and local housing recommendations.",
    done: false,
  },
  {
    id: 3,
    phase: "House Sale",
    task: "Finalize decluttering plan for 911 Whitstable Blvd",
    owner: "Family",
    target: "2026-03-20",
    status: "Not Started",
    priority: "High",
    notes: "Focus on staging and reducing visual clutter for photos/showings.",
    done: false,
  },
  {
    id: 4,
    phase: "House Sale",
    task: "Complete cosmetic touch-ups, deep clean, and curb appeal prep",
    owner: "Philip",
    target: "2026-03-27",
    status: "Not Started",
    priority: "High",
    notes: "Paint touch-ups, pressure wash, yard cleanup, minor fixes.",
    done: false,
  },
  {
    id: 5,
    phase: "House Sale",
    task: "Schedule listing photos and publish house listing",
    owner: "Realtor",
    target: "2026-04-03",
    status: "Not Started",
    priority: "Critical",
    notes: "Goal is early April listing to support end-of-June close.",
    done: false,
  },
  {
    id: 6,
    phase: "House Sale",
    task: "Review offers and accept contract",
    owner: "Philip",
    target: "2026-05-01",
    status: "Not Started",
    priority: "Critical",
    notes: "Aim for contract by early May.",
    done: false,
  },
  {
    id: 7,
    phase: "Rental",
    task: "Define Fort Walton Beach rental requirements",
    owner: "Philip + Claire",
    target: "2026-04-10",
    status: "Not Started",
    priority: "Medium",
    notes: "3BR, family-friendly area, short Hurlburt commute, remote rental.",
    done: false,
  },
  {
    id: 8,
    phase: "Rental",
    task: "Build shortlist of remote rental options in Fort Walton / Mary Esther",
    owner: "Philip",
    target: "2026-05-15",
    status: "Not Started",
    priority: "High",
    notes: "Target signing by early June.",
    done: false,
  },
  {
    id: 9,
    phase: "Move",
    task: "Schedule HHG move in DPS after orders arrive",
    owner: "Philip",
    target: "2026-05-08",
    status: "Blocked",
    priority: "Critical",
    notes: "Blocked until orders are issued.",
    done: false,
  },
  {
    id: 10,
    phase: "Move",
    task: "Create partial PPM list for personally moved items",
    owner: "Philip",
    target: "2026-05-15",
    status: "Not Started",
    priority: "Medium",
    notes: "Documents, uniforms, valuables, kids essentials, select electronics.",
    done: false,
  },
  {
    id: 11,
    phase: "Family",
    task: "Request school records for 7-year-old",
    owner: "Philip + Claire",
    target: "2026-05-22",
    status: "Not Started",
    priority: "High",
    notes: "Include any enrollment, immunization, and report records.",
    done: false,
  },
  {
    id: 12,
    phase: "Family",
    task: "Identify preschool/daycare needs for 3-year-old",
    owner: "Claire",
    target: "2026-06-05",
    status: "Not Started",
    priority: "Medium",
    notes: "Useful during settlement leave after arrival.",
    done: false,
  },
  {
    id: 13,
    phase: "Closing",
    task: "Confirm title, closing date, and stay-in-home-through-close plan",
    owner: "Philip + Realtor",
    target: "2026-06-12",
    status: "Not Started",
    priority: "Critical",
    notes: "Plan assumes staying in home until closing day.",
    done: false,
  },
  {
    id: 14,
    phase: "Closing",
    task: "Shut down Maryland utilities and set forwarding address",
    owner: "Philip",
    target: "2026-06-26",
    status: "Not Started",
    priority: "High",
    notes: "Coordinate around closing and pack-out dates.",
    done: false,
  },
  {
    id: 15,
    phase: "Pack-Out",
    task: "Create and label Do Not Pack zone",
    owner: "Family",
    target: "2026-07-03",
    status: "Not Started",
    priority: "Critical",
    notes: "Travel clothes, documents, kids items, medications, laptops.",
    done: false,
  },
  {
    id: 16,
    phase: "Pack-Out",
    task: "HHG pack and load for 2.3K sq ft home",
    owner: "TMO / Movers",
    target: "2026-07-08",
    status: "Not Started",
    priority: "Critical",
    notes: "Expect 1-2 days for pack and load.",
    done: false,
  },
  {
    id: 17,
    phase: "Travel",
    task: "Drive two vehicles from Arnold, MD to Fort Walton Beach",
    owner: "Family",
    target: "2026-07-17",
    status: "Not Started",
    priority: "Critical",
    notes: "Plan two-day drive with kid-friendly overnight stop.",
    done: false,
  },
  {
    id: 18,
    phase: "Arrival",
    task: "Complete 10-14 days of settlement leave and home setup",
    owner: "Family",
    target: "2026-07-28",
    status: "Not Started",
    priority: "High",
    notes: "Utilities, groceries, school setup, HHG delivery, neighborhood orientation.",
    done: false,
  },
  {
    id: 19,
    phase: "Finance",
    task: "Track house sale proceeds and park funds in HYSA while renting",
    owner: "Philip",
    target: "2026-07-01",
    status: "Not Started",
    priority: "Medium",
    notes: "Supports flexibility while planning 2-year rental strategy.",
    done: false,
  },
  {
    id: 20,
    phase: "Admin",
    task: "File PCS travel voucher, DLA, and PPM reimbursement",
    owner: "Philip",
    target: "2026-08-08",
    status: "Not Started",
    priority: "High",
    notes: "Do after arrival and completion of move-related actions.",
    done: false,
  },
];

const rentalLeads = [
  {
    id: 1,
    area: "Fort Walton Beach West",
    type: "House",
    beds: "3+",
    budget: "$2,100-$2,600",
    commute: "10-15 min",
    status: "Researching",
    notes: "Best fit for family + short commute.",
  },
  {
    id: 2,
    area: "Mary Esther",
    type: "House/Townhome",
    beds: "3",
    budget: "$2,000-$2,500",
    commute: "8-12 min",
    status: "Researching",
    notes: "Military-heavy area with practical commute.",
  },
  {
    id: 3,
    area: "Wright",
    type: "House",
    beds: "3",
    budget: "$2,000-$2,400",
    commute: "10-15 min",
    status: "Researching",
    notes: "Useful backup area if Fort Walton options tighten.",
  },
];

const budgetItems = [
  { category: "Fuel", estimate: 350, actual: "", reimbursable: "Yes" },
  { category: "Hotels", estimate: 400, actual: "", reimbursable: "Yes" },
  { category: "Packing supplies for PPM", estimate: 100, actual: "", reimbursable: "Partial" },
  { category: "Cleaning / touch-up costs", estimate: 300, actual: "", reimbursable: "No" },
  { category: "Temporary household setup", estimate: 250, actual: "", reimbursable: "No" },
];

function statusColor(status) {
  switch (status) {
    case "Complete":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Blocked":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function priorityColor(priority) {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "High":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Medium":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PCSCommandDashboard() {
  const [tasks, setTasks] = useState([]);

  // Load tasks from Supabase
  useEffect(() => {
    loadTasks();

    // Realtime subscription so multiple users see updates instantly
    const channel = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('id');
    if (data) setTasks(data);
  };
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newTask, setNewTask] = useState({
    phase: "Admin",
    task: "",
    owner: "Philip",
    target: "",
    status: "Not Started",
    priority: "Medium",
    notes: "",
  });
  const [showAddTask, setShowAddTask] = useState(false);

  const completedCount = tasks.filter((t) => t.done).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const filterMatch = filter === "All" ? true : task.phase === filter;
      const searchMatch = [task.task, task.owner, task.notes, task.phase]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      return filterMatch && searchMatch;
    });
  }, [tasks, filter, search]);

  const toggleDone = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              done: !task.done,
              status: !task.done ? "Complete" : "Not Started",
            }
          : task
      )
    );
  };

  const phaseCounts = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.phase] = (acc[task.phase] || 0) + 1;
      return acc;
    }, {});
  }, [tasks]);

  const criticalOpen = tasks.filter((t) => t.priority === "Critical" && !t.done).length;

  const addTask = async () => () => {
    if (!newTask.task.trim()) return;

    const nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const taskToAdd = {
      id: nextId,
      phase: newTask.phase,
      task: newTask.task.trim(),
      owner: newTask.owner.trim() || "Philip",
      target: newTask.target || "",
      status: newTask.status,
      priority: newTask.priority,
      notes: newTask.notes.trim(),
      done: newTask.status === "Complete",
    };

    await supabase.from('tasks').insert(taskToAdd);
    loadTasks();
    setNewTask({
      phase: newTask.phase,
      task: "",
      owner: "Philip",
      target: "",
      status: "Not Started",
      priority: "Medium",
      notes: "",
    });
    setShowAddTask(false);
  };

  const removeTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    loadTasks();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Plane className="h-4 w-4" />
                Philip Barry Family PCS Command Dashboard
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Arnold, MD → Hurlburt Field / Fort Walton Beach
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Built as a Google-Sheets-style React tracker for your PCS, home sale, remote rental,
                partial PPM, and family transition.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Card className="rounded-2xl shadow-none">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">RNLTD</div>
                  <div className="mt-1 text-lg font-semibold">31 Jul</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl shadow-none">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">Departure Goal</div>
                  <div className="mt-1 text-lg font-semibold">17 Jul</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl shadow-none">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">House Sale Goal</div>
                  <div className="mt-1 text-lg font-semibold">End of Jun</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl shadow-none">
                <CardContent className="p-4">
                  <div className="text-xs text-slate-500">Settle-in Leave</div>
                  <div className="mt-1 text-lg font-semibold">10–14 days</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Overall Progress</div>
                  <div className="mt-1 text-2xl font-semibold">{progress}%</div>
                </div>
                <CalendarDays className="h-5 w-5 text-slate-400" />
              </div>
              <Progress value={progress} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Open Critical Tasks</div>
                  <div className="mt-1 text-2xl font-semibold">{criticalOpen}</div>
                </div>
                <Truck className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Vehicles</div>
                  <div className="mt-1 text-2xl font-semibold">2 Driving</div>
                </div>
                <Car className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Housing Plan</div>
                  <div className="mt-1 text-2xl font-semibold">Renting</div>
                </div>
                <Home className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tracker" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white p-1 shadow-sm border border-slate-200">
            <TabsTrigger value="tracker" className="rounded-xl">Master Tracker</TabsTrigger>
            <TabsTrigger value="gantt" className="rounded-xl">Gantt View</TabsTrigger>
            <TabsTrigger value="rental" className="rounded-xl">Rental Search</TabsTrigger>
            <TabsTrigger value="budget" className="rounded-xl">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-4">
            <Card className="rounded-3xl border-slate-200">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-xl">PCS Master Tracker</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Use this like a live spreadsheet with filters, search, and completion toggles.</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search task, owner, notes..."
                      className="w-full sm:w-72 rounded-xl"
                    />
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-full sm:w-52 rounded-xl">
                        <SelectValue placeholder="Filter by phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Phases</SelectItem>
                        {Object.keys(phaseCounts).map((phase) => (
                          <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setShowAddTask((prev) => !prev)} className="rounded-xl">
                      <Plus className="mr-2 h-4 w-4" />
                      {showAddTask ? "Hide Add Task" : "Add Task"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showAddTask && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">Add missing task</div>
                        <div className="text-xs text-slate-500">Create new PCS tasks directly in the tracker.</div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowAddTask(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Phase</label>
                        <Select value={newTask.phase} onValueChange={(value) => setNewTask((prev) => ({ ...prev, phase: value }))}>
                          <SelectTrigger className="rounded-xl bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Orders", "House Sale", "Rental", "Move", "Family", "Closing", "Pack-Out", "Travel", "Arrival", "Finance", "Admin"].map((phase) => (
                              <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 xl:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Task</label>
                        <Input
                          value={newTask.task}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, task: e.target.value }))}
                          placeholder="Example: Schedule final walkthrough with realtor"
                          className="rounded-xl bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Owner</label>
                        <Input
                          value={newTask.owner}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, owner: e.target.value }))}
                          placeholder="Philip"
                          className="rounded-xl bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Target date</label>
                        <Input
                          type="date"
                          value={newTask.target}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, target: e.target.value }))}
                          className="rounded-xl bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Priority</label>
                        <Select value={newTask.priority} onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: value }))}>
                          <SelectTrigger className="rounded-xl bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Critical", "High", "Medium", "Low"].map((priority) => (
                              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Status</label>
                        <Select value={newTask.status} onValueChange={(value) => setNewTask((prev) => ({ ...prev, status: value }))}>
                          <SelectTrigger className="rounded-xl bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Not Started", "In Progress", "Blocked", "Complete"].map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 md:col-span-2 xl:col-span-3">
                        <label className="text-xs font-medium text-slate-600">Notes</label>
                        <Input
                          value={newTask.notes}
                          onChange={(e) => setNewTask((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Helpful details, dependencies, or reminders"
                          className="rounded-xl bg-white"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button onClick={addTask} className="rounded-xl">
                        <Plus className="mr-2 h-4 w-4" />
                        Save Task
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() =>
                          setNewTask({
                            phase: "Admin",
                            task: "",
                            owner: "Philip",
                            target: "",
                            status: "Not Started",
                            priority: "Medium",
                            notes: "",
                          })
                        }
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead className="bg-slate-100 text-left text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Done</th>
                        <th className="px-4 py-3 font-medium">Phase</th>
                        <th className="px-4 py-3 font-medium">Task</th>
                        <th className="px-4 py-3 font-medium">Owner</th>
                        <th className="px-4 py-3 font-medium">Target</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Priority</th>
                        <th className="px-4 py-3 font-medium">Notes</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="border-t border-slate-200 bg-white align-top">
                          <td className="px-4 py-3">
                            <Checkbox checked={task.done} onCheckedChange={() => toggleDone(task.id)} />
                          </td>
                          <td className="px-4 py-3">{task.phase}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{task.task}</td>
                          <td className="px-4 py-3">{task.owner}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{task.target}</td>
                          <td className="px-4 py-3"><Badge className={statusColor(task.status)}>{task.status}</Badge></td>
                          <td className="px-4 py-3"><Badge className={priorityColor(task.priority)}>{task.priority}</Badge></td>
                          <td className="px-4 py-3 text-slate-600">{task.notes}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" className="rounded-xl text-slate-500" onClick={() => removeTask(task.id)}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gantt">
            <Card className="rounded-3xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Simple Gantt View</CardTitle>
                <p className="text-sm text-slate-500">This gives you a spreadsheet-style phase timeline from March through August.</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead className="bg-slate-100 text-left text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Phase</th>
                        <th className="px-4 py-3 font-medium">Mar</th>
                        <th className="px-4 py-3 font-medium">Apr</th>
                        <th className="px-4 py-3 font-medium">May</th>
                        <th className="px-4 py-3 font-medium">Jun</th>
                        <th className="px-4 py-3 font-medium">Jul</th>
                        <th className="px-4 py-3 font-medium">Aug</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Orders", ["bg-blue-500", "bg-blue-500", "", "", "", ""]],
                        ["House Sale", ["bg-amber-400", "bg-amber-400", "bg-amber-400", "bg-amber-400", "", ""]],
                        ["Rental Search", ["", "bg-emerald-500", "bg-emerald-500", "bg-emerald-500", "", ""]],
                        ["HHG / PPM", ["", "", "bg-violet-500", "bg-violet-500", "bg-violet-500", ""]],
                        ["Travel / Arrival", ["", "", "", "", "bg-rose-500", ""]],
                        ["Reimbursements / Admin", ["", "", "", "", "bg-slate-400", "bg-slate-400"]],
                      ].map(([phase, bars]) => (
                        <tr key={phase} className="border-t border-slate-200 bg-white">
                          <td className="px-4 py-4 font-medium text-slate-900">{phase}</td>
                          {(bars).map((bar, idx) => (
                            <td key={idx} className="px-4 py-4">
                              <div className={`h-6 rounded-lg ${bar || "bg-transparent"}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rental">
            <div className="grid gap-4 lg:grid-cols-[1.3fr,0.7fr]">
              <Card className="rounded-3xl border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Remote Rental Tracker</CardTitle>
                  <p className="text-sm text-slate-500">Focused on Fort Walton Beach, Mary Esther, and nearby practical options.</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-left text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Area</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="px-4 py-3 font-medium">Beds</th>
                          <th className="px-4 py-3 font-medium">Budget</th>
                          <th className="px-4 py-3 font-medium">Commute</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rentalLeads.map((lead) => (
                          <tr key={lead.id} className="border-t border-slate-200 bg-white">
                            <td className="px-4 py-3 font-medium">{lead.area}</td>
                            <td className="px-4 py-3">{lead.type}</td>
                            <td className="px-4 py-3">{lead.beds}</td>
                            <td className="px-4 py-3">{lead.budget}</td>
                            <td className="px-4 py-3">{lead.commute}</td>
                            <td className="px-4 py-3"><Badge className="bg-blue-100 text-blue-800 border-blue-200">{lead.status}</Badge></td>
                            <td className="px-4 py-3 text-slate-600">{lead.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Rental Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <div className="font-medium">Target area</div>
                      <div>Fort Walton Beach first, Mary Esther as strong backup.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <Home className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <div className="font-medium">Preferred home profile</div>
                      <div>3 bedrooms, family-friendly layout, garage or storage, fenced yard preferred.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <School className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <div className="font-medium">Family factor</div>
                      <div>Easy school setup, practical commute, quick transition for ages 3 and 7.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
              <Card className="rounded-3xl border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">PCS Budget Sheet</CardTitle>
                  <p className="text-sm text-slate-500">Use this as your simple spreadsheet for expected versus actual costs.</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-left text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Estimate</th>
                          <th className="px-4 py-3 font-medium">Actual</th>
                          <th className="px-4 py-3 font-medium">Reimbursable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetItems.map((item) => (
                          <tr key={item.category} className="border-t border-slate-200 bg-white">
                            <td className="px-4 py-3 font-medium">{item.category}</td>
                            <td className="px-4 py-3">${item.estimate}</td>
                            <td className="px-4 py-3">{item.actual || "—"}</td>
                            <td className="px-4 py-3">{item.reimbursable}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Finance Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <DollarSign className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div>
                      <div className="font-medium">Expected reimbursements</div>
                      <div>DLA, mileage, per diem, and partial PPM reimbursement.</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="font-medium">House proceeds strategy</div>
                    <div className="mt-1 text-slate-600">Given your current leaning to rent, this dashboard assumes proceeds can be parked in a HYSA for flexibility.</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="font-medium">Key reminder</div>
                    <div className="mt-1 text-slate-600">Capture receipts early and keep one folder for PCS reimbursements, closing docs, and rental documents.</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-3">
          <Button className="rounded-2xl">Update Dashboard</Button>
          <Button variant="outline" className="rounded-2xl">Export to Spreadsheet Later</Button>
        </div>
      </div>
    </div>
  );
}
