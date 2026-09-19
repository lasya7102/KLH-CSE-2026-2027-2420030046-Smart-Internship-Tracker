import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

const STATUS_OPTIONS = ["Applied", "OA Pending", "Interview", "Selected", "Rejected"];

export default function AddInternship() {
  const { addInternship } = useApp();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    company: "",
    role: "",
    description: "",
    url: "",
    deadline: "",
    oaDate: "",
    interviewDate: "",
    status: "Applied",
    skillsText: "",
  });

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const requiredSkills = form.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const id = await addInternship({
        company: form.company,
        role: form.role,
        description: form.description,
        url: form.url,
        deadline: form.deadline || null,
        oaDate: form.oaDate || null,
        interviewDate: form.interviewDate || null,
        status: form.status,
        requiredSkills: requiredSkills.length ? requiredSkills : ["General"],
      });
      navigate(`/internships/${id}`);
    } catch (err) {
      setError(err.message || "Could not save this internship. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand";

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-line bg-surface p-6"
      >
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-alert/30 bg-alert-soft px-3.5 py-2.5 text-sm text-alert">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Company Name</label>
          <input
            required
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="e.g. ABC Technologies"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Role</label>
          <input
            required
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="e.g. Software Developer Intern"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Job Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Paste or summarize the job description…"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">
            Required Skills <span className="font-normal text-muted">(comma separated)</span>
          </label>
          <input
            value={form.skillsText}
            onChange={(e) => set("skillsText", e.target.value)}
            placeholder="e.g. Java, SQL, DSA, AWS"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Application URL</label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">OA/Test Date</label>
            <input
              type="date"
              value={form.oaDate}
              onChange={(e) => set("oaDate", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Interview Date</label>
          <input
            type="date"
            value={form.interviewDate}
            onChange={(e) => set("interviewDate", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-soft">Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Add Internship"}
        </button>
      </form>
    </div>
  );
}
