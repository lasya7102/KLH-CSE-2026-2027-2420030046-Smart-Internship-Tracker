import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

const FIELDS = [
  { name: "name", label: "Name", type: "text", placeholder: "Full name" },
  { name: "email", label: "Email", type: "email", placeholder: "you@college.edu" },
  { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
  { name: "college", label: "College", type: "text", placeholder: "Your institute" },
  { name: "branch", label: "Branch", type: "text", placeholder: "e.g. Computer Science" },
  { name: "gradYear", label: "Graduation Year", type: "number", placeholder: "2027" },
];

export default function Register() {
  const { register, authLoading } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
            <Compass size={24} strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Get matched to internships that fit your skills.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-surface p-6 shadow-[0_4px_24px_-4px_rgba(18,33,59,0.06)]"
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-alert/30 bg-alert-soft px-3.5 py-2.5 text-sm text-alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {FIELDS.map(({ name, label, type, placeholder }) => (
            <div key={name} className="mb-4 last:mb-6">
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
              <input
                type={type}
                required
                placeholder={placeholder}
                value={form[name] || ""}
                onChange={(e) => handleChange(name, e.target.value)}
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {authLoading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
