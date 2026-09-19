import { useState } from "react";
import { GraduationCap, Mail, BookOpen, CalendarRange, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import SkillBadge from "../components/SkillBadge";

export default function Profile() {
  const { profile, updateProfile, studentSkills, removeSkill } = useApp();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile.name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-white">
          {initials}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">{profile.name}</h2>
          <p className="text-sm text-muted">{profile.branch} · Class of {profile.gradYear}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <h3 className="font-display text-base font-semibold text-ink">Details</h3>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-alert/30 bg-alert-soft px-3.5 py-2.5 text-sm text-alert">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ProfileField icon={GraduationCap} label="Name" value={form.name} onChange={(v) => set("name", v)} />
        <ProfileField icon={Mail} label="Email" value={form.email} onChange={(v) => set("email", v)} type="email" />
        <ProfileField icon={BookOpen} label="College" value={form.college} onChange={(v) => set("college", v)} />
        <ProfileField icon={GraduationCap} label="Branch" value={form.branch} onChange={(v) => set("branch", v)} />
        <ProfileField
          icon={CalendarRange}
          label="Graduation Year"
          value={form.gradYear}
          onChange={(v) => set("gradYear", v)}
          type="number"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-display text-base font-semibold text-ink">My Skills</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {studentSkills.map((skill) => (
            <SkillBadge key={skill} skill={skill} status="have" onRemove={removeSkill} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 focus-within:border-brand">
        <Icon size={16} className="text-muted" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-ink outline-none"
        />
      </div>
    </div>
  );
}
