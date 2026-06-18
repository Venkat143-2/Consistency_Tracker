/**
 * @license
 * Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Search, Trash2, Edit3, CheckCircle2, Circle, RefreshCcw, GripVertical, HelpCircle } from "lucide-react";
import { Task, TaskCategory } from "../types";

interface TaskSectionProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onCreateTask: (title: string, category: TaskCategory) => void;
  onEditTask: (taskId: string, title: string, category: TaskCategory) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks?: (reorderedTasks: Task[]) => void;
  loading: boolean;
}

export function TaskSection({
  tasks,
  onToggleTask,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onReorderTasks,
  loading,
}: TaskSectionProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All");

  // Drag and Drop State
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Creation form states
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("DSA");

  // Editing form states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<TaskCategory>("DSA");

  const categoriesList: { value: TaskCategory; label: string; color: string }[] = [
    { value: "DSA", label: "DSA", color: "text-[#3B82F6] bg-blue-500/10 border-blue-500/20" },
    { value: "Java", label: "Java", color: "text-[#06B6D4] bg-cyan-500/10 border-cyan-500/20" },
    { value: "Communication", label: "Communication", color: "text-[#10B981] bg-emerald-500/10 border-emerald-500/20" },
    { value: "Aptitude", label: "Aptitude", color: "text-[#F59E0B] bg-amber-500/10 border-amber-500/20" },
    { value: "Fitness", label: "Fitness", color: "text-[#EF4444] bg-rose-500/10 border-rose-500/20" },
    { value: "Reading", label: "Reading", color: "text-[#A855F7] bg-purple-500/10 border-purple-500/20" },
    { value: "Other", label: "Other", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateTask(newTitle.trim(), newCategory);
    setNewTitle("");
  };

  const startEdit = (t: Task) => {
    setEditingTask(t);
    setEditTitle(t.title);
    setEditCategory(t.category);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    onEditTask(editingTask.id, editTitle.trim(), editCategory);
    setEditingTask(null);
  };

  // Filter pipeline
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Completed" && t.completedToday) ||
      (statusFilter === "Pending" && !t.completedToday);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Dynamic metrics rates
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completedToday).length;
  const metricsPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // --- Native HTML5 Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    if (draggingIndex === null || draggingIndex === targetIndex) return;
    
    // Perform real-time swap reordering
    const reordered = [...filteredTasks];
    const draggedItem = reordered[draggingIndex];
    reordered.splice(draggingIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);
    
    setDraggingIndex(targetIndex);
    if (onReorderTasks) {
      onReorderTasks(reordered);
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Metrics Row Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Active Checklist</div>
          <div className="mt-2 text-2xl font-black text-white">{totalCount}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tasks Accomplished</div>
          <div className="mt-2 text-2xl font-black text-emerald-400">{completedCount}</div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Efficiency rate</div>
          <div className="mt-1.5 text-2xl font-black text-blue-400 flex items-center justify-between">
            <span>{metricsPct}%</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-850">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${metricsPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Creation section form card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-blue-500" />
              Pin New Habit Task
            </h3>
            
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Task Title / Action
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Code 2 LeetCode questions"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Habit Category
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setNewCategory(cat.value)}
                      className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-all ${
                        newCategory === cat.value
                          ? "bg-blue-600/10 border-blue-505/40 text-blue-400 font-bold"
                          : "bg-slate-900/35 border-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10"
              >
                <Plus className="h-4 w-4" />
                Add Habit Checklist
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Search, Filters & Drag & Drop Reorder List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 backdrop-blur-md">
            
            {/* Filter Toolbars */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-slate-900">
              {/* Keyword Search */}
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Identify task title..."
                />
              </div>

              {/* Status Selector */}
              <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 shrink-0">
                {(["All", "Pending", "Completed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                      statusFilter === s
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills Slider */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter("All")}
                className={`rounded-full px-3 py-1 text-[10px] uppercase font-bold transition-all border ${
                  categoryFilter === "All"
                    ? "bg-slate-100 text-slate-950 border-slate-100"
                    : "bg-slate-900/60 text-slate-400 border-slate-850 hover:text-white"
                }`}
              >
                All Categories
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`rounded-full px-3 py-1 text-[10px] uppercase font-bold transition-all border ${
                    categoryFilter === cat.value
                      ? "bg-slate-100 text-slate-950 border-slate-100"
                      : "bg-slate-900/60 text-slate-400 border-slate-850 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Tasks list with left Drag handles */}
            <div className="mt-6 space-y-2.5">
              {loading ? (
                <div className="py-20 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCcw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                  Synchronizing tasks state...
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center text-xs text-slate-500">
                  No habits match the active filters. Drag handles are active with multiple tasks!
                </div>
              ) : (
                filteredTasks.map((t, index) => {
                  const catConfig = categoriesList.find((c) => c.value === t.category);
                  const isChecked = t.completedToday;
                  const isDragging = draggingIndex === index;

                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center justify-between rounded-xl border p-4 transition-all duration-150 ${
                        isDragging
                          ? "border-blue-500/50 bg-slate-900/90 opacity-55 scale-[0.985] shadow-inner"
                          : isChecked
                          ? "bg-emerald-950/5 border-emerald-950/20 text-slate-400"
                          : "bg-slate-900/10 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 max-w-[70%]">
                        {/* Drag Handle left */}
                        <div
                          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                          title="Drag to reorder task"
                        >
                          <GripVertical className="h-4.5 w-4.5 text-slate-500" />
                        </div>

                        {/* Task toggle trigger */}
                        <button
                          onClick={() => onToggleTask(t.id)}
                          className={`flex h-4.5 w-4.5 items-center justify-center rounded-sm border transition-all hover:scale-105 cursor-pointer shrink-0 ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-600 hover:border-blue-500 text-transparent"
                          }`}
                        >
                          {isChecked ? <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" /> : <Circle className="h-3.5 w-3.5" />}
                        </button>

                        <div className="truncate">
                          <p
                            className={`text-xs font-bold transition-all truncate ${
                              isChecked ? "line-through text-slate-505" : "text-white"
                            }`}
                          >
                            {t.title}
                          </p>

                          {/* Category Badge metadata */}
                          <span
                            className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${
                              catConfig?.color || "text-slate-400 bg-slate-900"
                            }`}
                          >
                            {t.category}
                          </span>
                        </div>
                      </div>

                      {/* Controls (Edit / Delete) */}
                      <div className="flex items-center space-x-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(t)}
                          className="rounded-lg bg-slate-950 hover:bg-slate-800 p-1.5 text-slate-400 hover:text-white border border-slate-900 cursor-pointer"
                          title="Edit Task Details"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="rounded-lg bg-slate-950 hover:bg-rose-950 p-1.5 text-slate-400 hover:text-rose-400 border border-slate-900 cursor-pointer"
                          title="Delete Action Item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Helpful tip overlay */}
            <div className="mt-4 p-3 bg-blue-900/5 rounded-xl border border-blue-500/10 flex items-center gap-2 text-[10px] text-slate-405 leading-snug">
              <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Drag the left grip handle of any task to vertically re-sequence. Your sorted preference reflects synchronously everywhere.</span>
            </div>

          </div>
        </div>
      </div>

      {/* Editing Task Modal popup */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Edit Habit Task Details
            </h4>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
                  className="mt-1.5 w-full rounded-lg border border-slate-805 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none bg-slate-950"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
                >
                  Apply Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
