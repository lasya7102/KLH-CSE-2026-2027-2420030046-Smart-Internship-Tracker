import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AddSkillModal({ open, onClose }) {
  const { addSkill, studentSkills, skillCatalog } = useApp();
  const [custom, setCustom] = useState("");

  if (!open) return null;

  const available = skillCatalog.filter(
    (s) => !studentSkills.some((have) => have.toLowerCase() === s.toLowerCase())
  );

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!custom.trim()) return;
    addSkill(custom.trim());
    setCustom("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Add a Skill</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-ink/5" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {available.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {available.map((skill) => (
              <button
                key={skill}
                onClick={() => {
                  addSkill(skill);
                  onClose();
                }}
                className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
              >
                + {skill}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Type a custom skill…"
            className="flex-1 rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
