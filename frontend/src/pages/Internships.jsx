import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import InternshipCard from "../components/InternshipCard";

const FILTERS = ["All", "Applied", "OA Pending", "Interview", "Selected", "Rejected"];

export default function Internships() {
  const { internships } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return internships.filter((i) => {
      const matchesFilter = filter === "All" || i.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || i.company.toLowerCase().includes(q) || i.role.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [internships, query, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search internships…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <Link
          to="/internships/add"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={16} /> Add Internship
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f
                ? "bg-ink text-canvas"
                : "bg-surface text-muted border border-line hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="font-medium text-ink">No internships match your search.</p>
          <p className="mt-1 text-sm text-muted">Try a different keyword or filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((i) => (
            <InternshipCard key={i.id} internship={i} />
          ))}
        </div>
      )}
    </div>
  );
}
