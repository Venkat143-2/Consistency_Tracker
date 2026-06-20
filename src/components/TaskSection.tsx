/**
 * @license
 * Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Search, Trash2, Edit3, CheckCircle2, Circle, RefreshCcw, GripVertical, HelpCircle, ChevronUp, ChevronDown } from "lucide-react";
import { Task, TaskCategory } from "../types";

interface TaskSectionProps {
  tasks: Task[];
  onToggleTask?: (taskId: string) => void;
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Drag and Drop State by taskId
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Creation form states
  const [newTitle, setNewTitle] = useState("");

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

    // Smart auto-detection of categories based on keyword match
    let detectedCat: TaskCategory = "Other";
    const titleVal = newTitle.toLowerCase();
    
    if (titleVal.includes("dsa") || titleVal.includes("structure") || titleVal.includes("algorithm") || titleVal.includes("problem")) {
      detectedCat = "DSA";
    } else if (titleVal.includes("java") || titleVal.includes("spring") || titleVal.includes("development") || titleVal.includes("coding")) {
      detectedCat = "Java";
    } else if (
      titleVal.includes("communication") || 
      titleVal.includes("talk") || 
      titleVal.includes("pitch") || 
      titleVal.includes("accent") || 
      titleVal.includes("speak") || 
      titleVal.includes("english")
    ) {
      detectedCat = "Communication";
    } else if (
      titleVal.includes("aptitude") || 
      titleVal.includes("logic") || 
      titleVal.includes("reasoning") || 
      titleVal.includes("drill") || 
      titleVal.includes("math")
    ) {
      detectedCat = "Aptitude";
    } else if (
      titleVal.includes("fitness") || 
      titleVal.includes("gym") || 
      titleVal.includes("run") || 
      titleVal.includes("workout") || 
      titleVal.includes("exercise") || 
      titleVal.includes("health")
    ) {
      detectedCat = "Fitness";
    } else if (
      titleVal.includes("read") || 
      titleVal.includes("philosophy") || 
      titleVal.includes("book") || 
      titleVal.includes("page") || 
      titleVal.includes("article")
    ) {
      detectedCat = "Reading";
    }

    onCreateTask(newTitle.trim(), detectedCat);
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

  // --- Native HTML5 Drag and Drop Handlers with task IDs ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, targetTaskId: string) => {
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const fromIndex = tasks.findIndex((t) => t.id === draggedTaskId);
    const toIndex = tasks.findIndex((t) => t.id === targetTaskId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const reordered = [...tasks];
      const [draggedItem] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, draggedItem);

      if (onReorderTasks) {
        onReorderTasks(reordered);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  // Click-to-move sequencing handlers (great for desktop & mobile)
  const handleMoveUp = (taskId: string) => {
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx <= 0) return;
    const reordered = [...tasks];
    const item = reordered[idx];
    reordered.splice(idx, 1);
    reordered.splice(idx - 1, 0, item);
    if (onReorderTasks) {
      onReorderTasks(reordered);
    }
  };

  const handleMoveDown = (taskId: string) => {
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1 || idx >= tasks.length - 1) return;
    const reordered = [...tasks];
    const item = reordered[idx];
    reordered.splice(idx, 1);
    reordered.splice(idx + 1, 0, item);
    if (onReorderTasks) {
      onReorderTasks(reordered);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl mx-auto">
      {/* Header and Title (Matching screenshot 2 exactly) */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Tasks</h2>
        <p className="text-sm text-slate-400 font-medium bg-gradient-to-r from-transparent to-transparent">
          Today's plan. Drag tasks to reorder — your custom order is saved automatically.
        </p>
      </div>

      {/* Creation form card (Simple row inline format, matching image 2 exactly) */}
      <div className="rounded-xl border border-[#083047] bg-[#041a27] p-5 shadow-2xl relative">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            ref={inputRef}
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
      </div>

      {/* List content / empty state (Matching screenshot 2 exactly) */}
      {loading ? (
        <div className="rounded-xl border border-[#083047] bg-[#041a27]/30 py-20 text-center text-xs text-slate-450 flex items-center justify-center gap-2">
          <RefreshCcw className="h-4 w-4 animate-spin text-[#10b981]" />
          Synchronizing tasks state...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-[#083047]/60 bg-[#041a27]/20 py-12 text-center text-sm text-slate-400 font-medium shadow-md">
          No tasks yet. Add your first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t, index) => {
            const catConfig = categoriesList.find((c) => c.value === t.category);
            const isDragging = draggedTaskId === t.id;

            return (
              <div
                key={t.id}
                draggable
                onDragStart={(e) => handleDragStart(e, t.id)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, t.id)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center justify-between rounded-xl border p-4 transition-all duration-150 ${
                  isDragging
                    ? "border-[#10b981]/50 bg-slate-950 opacity-50 scale-[0.985] shadow-inner"
                    : "bg-[#020e17] border-[#083047] hover:border-[#10b981]/25"
                }`}
              >
                <div className="flex items-center space-x-3 max-w-[75%]">
                  {/* Drag Handle left & reordering buttons */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <div
                      className="text-slate-655 hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 shrink-0 hidden sm:block"
                      title="Drag to reorder task"
                    >
                      <GripVertical className="h-4.5 w-4.5 text-slate-600 group-hover:text-slate-450" />
                    </div>
                    
                    {/* Mobile Up/Down controls */}
                    <div className="flex flex-col sm:hidden shrink-0 -space-y-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(t.id)}
                        className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-900 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(t.id)}
                        className="p-1 text-slate-500 hover:text-white rounded hover:bg-slate-900 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="truncate">
                    <p
                      className="text-xs font-black transition-all truncate leading-relaxed text-slate-100"
                    >
                      {t.title}
                    </p>
                  </div>
                </div>

                {/* Controls (Edit / Delete) */}
                <div className="flex items-center space-x-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  {/* Desktop Up/Down sorting shortcuts */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(t.id)}
                    className="hidden sm:inline-block rounded-lg bg-slate-950 hover:bg-slate-900 p-1.5 text-slate-550 hover:text-white border border-slate-900 cursor-pointer"
                    title="Move Up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(t.id)}
                    className="hidden sm:inline-block rounded-lg bg-slate-950 hover:bg-slate-900 p-1.5 text-slate-550 hover:text-white border border-slate-900 cursor-pointer"
                    title="Move Down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

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
          })}

          {/* Helpful tip overlay */}
          <div className="mt-4 p-3 bg-teal-950/20 rounded-xl border border-teal-500/10 flex items-center gap-2 text-[10px] text-slate-400 leading-snug">
            <HelpCircle className="h-4 w-4 text-[#10b981] shrink-0" />
            <span>Drag the left grip handle of any task to vertically re-sequence. Your sorted preference reflects synchronously everywhere.</span>
          </div>
        </div>
      )}

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
