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
    <div className="space-y-6 select-none font-sans max-w-4xl mx-auto">
      {/* Header and Title (Matching screenshot 2 exactly) */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Tasks</h2>
        <p className="text-sm text-slate-400 font-medium">
          Today's plan. Drag tasks to reorder — your custom order is saved automatically.
        </p>
      </div>

      {/* Creation form card (Flat horizontal bar with inline Categories button, modeled from screenshot 2) */}
      <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-2xl relative">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-lg border border-[#083047] bg-[#020e17] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
            placeholder="Add a new task — e.g. DSA, Java, Communication Skills"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-[#10b981] hover:bg-[#10b981]/90 text-[#010e17] font-black px-6 py-3 text-sm transition-all duration-150 flex items-center justify-center gap-1 shrink-0 shadow-lg shadow-[#10b981]/20 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3]" />
            Add
          </button>
        </form>

        {/* Dynamic Category Chips underneath creation input */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 mr-1">Choose Category:</span>
          {categoriesList.map((cat) => {
            const isSelected = newCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setNewCategory(cat.value)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all border ${
                  isSelected
                    ? "bg-[#10b981] border-[#10b981] text-[#010e17]"
                    : "bg-[#020e17] border-[#083047] text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Lists container card */}
      <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-lg space-y-5">
        
        {/* Keyword Search & Tab status filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-3 left-3 h-4 w-4 text-slate-550" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#083047] bg-[#020e17] py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#10b981] focus:outline-none"
              placeholder="Search tasks..."
            />
          </div>

          <div className="flex gap-1 rounded-lg border border-[#083047] bg-[#020e17] p-1 shrink-0 self-stretch sm:self-auto justify-center">
            {(["All", "Pending", "Completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded px-3 py-1.5 text-[10px] font-black uppercase transition-all cursor-pointer ${
                  statusFilter === s
                    ? "bg-[#10b981] text-[#010e17]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Slider inside List view */}
        <div className="flex flex-wrap gap-1.5 pb-1 select-none">
          <button
            onClick={() => setCategoryFilter("All")}
            className={`rounded-full px-3.5 py-1 text-[10px] uppercase font-black transition-all border ${
              categoryFilter === "All"
                ? "bg-slate-100 text-slate-950 border-slate-100"
                : "bg-[#020e17] text-slate-400 border-[#083047] hover:text-white"
            }`}
          >
            All Categories
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`rounded-full px-3.5 py-1 text-[10px] uppercase font-black transition-all border ${
                categoryFilter === cat.value
                  ? "bg-slate-100 text-slate-950 border-slate-100"
                  : "bg-[#020e17] text-slate-400 border-[#083047] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tasks list with left Drag handles */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-450 flex items-center justify-center gap-2">
              <RefreshCcw className="h-4 w-4 animate-spin text-[#10b981]" />
              Synchronizing tasks state...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800/80 py-16 text-center text-xs text-slate-500 whitespace-pre-wrap">
              No tasks yet. Add your first one above.
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
                      ? "border-[#10b981]/50 bg-slate-950 opacity-50 scale-[0.985] shadow-inner"
                      : isChecked
                      ? "bg-emerald-950/10 border-[#10b981]/15 text-slate-400"
                      : "bg-[#020e17] border-[#083047] hover:border-[#10b981]/25"
                  }`}
                >
                  <div className="flex items-center space-x-3 max-w-[75%]">
                    {/* Drag Handle left */}
                    <div
                      className="text-slate-650 hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                      title="Drag to reorder task"
                    >
                      <GripVertical className="h-4.5 w-4.5 text-slate-600 group-hover:text-slate-450" />
                    </div>

                    {/* Task toggle trigger checkbox */}
                    <button
                      onClick={() => onToggleTask(t.id)}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-all hover:scale-105 cursor-pointer shrink-0 ${
                        isChecked
                          ? "bg-[#10b981] border-[#10b981] text-[#010e17]"
                          : "border-slate-700 hover:border-[#10b981] text-transparent"
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-transparent Group-hover:text-slate-600" />
                      )}
                    </button>

                    <div className="truncate">
                      <p
                        className={`text-xs font-black transition-all truncate leading-relaxed ${
                          isChecked ? "line-through text-slate-500 font-medium" : "text-slate-100"
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
                      className="rounded-lg bg-slate-950 hover:bg-slate-900 p-1.5 text-slate-400 hover:text-white border border-slate-900 cursor-pointer"
                      title="Edit Task Details"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="rounded-lg bg-slate-950 hover:bg-rose-950/80 p-1.5 text-slate-400 hover:text-rose-400 border border-slate-900 cursor-pointer"
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
        <div className="mt-4 p-3 bg-teal-950/20 rounded-xl border border-teal-500/10 flex items-center gap-2 text-[10px] text-slate-400 leading-snug">
          <HelpCircle className="h-4 w-4 text-[#10b981] shrink-0" />
          <span>Drag the left grip handle of any task to vertically re-sequence. Your sorted preference reflects synchronously everywhere.</span>
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
