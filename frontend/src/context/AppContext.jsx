import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { skillCatalog } from "../data/mockData";
import { computeMatch } from "../utils/match";
import { getToken, setToken } from "../api/client";
import * as authApi from "../api/authApi";
import * as userApi from "../api/userApi";
import * as internshipApi from "../api/internshipApi";
import * as applicationApi from "../api/applicationApi";
import * as recommendationApi from "../api/recommendationApi";
import * as skillApi from "../api/skillApi";

const AppContext = createContext(null);

// Backend dates arrive as full ISO datetimes ("2026-08-27T00:00:00.000Z");
// the frontend's date utils expect plain "YYYY-MM-DD" strings. Normalize
// once, here, so every component downstream keeps working unmodified.
function toDateOnly(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function mapUserToProfile(user) {
  if (!user) return { name: "", email: "", college: "", branch: "", gradYear: "" };
  return {
    name: user.name || "",
    email: user.email || "",
    college: user.college || "",
    branch: user.branch || "",
    gradYear: user.graduationYear || "",
  };
}

function mapApplicationToInternship(app, studentSkills) {
  const i = app.internship || {};
  const requiredSkills = i.requiredSkills || [];
  return {
    id: i._id,
    applicationId: app._id,
    company: i.company,
    role: i.role,
    location: i.location,
    stipend: i.stipend,
    requiredSkills,
    status: app.status,
    deadline: toDateOnly(i.deadline),
    oaDate: toDateOnly(app.oaDate || i.oaDate),
    interviewDate: toDateOnly(app.interviewDate || i.interviewDate),
    appliedOn: toDateOnly(app.appliedOn),
    url: i.url,
    description: i.description,
    matchInfo: computeMatch(requiredSkills, studentSkills),
  };
}

export function AppProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(!!getToken());
  const [initializing, setInitializing] = useState(!!getToken());
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [skillDemand, setSkillDemand] = useState({});
  const [missingSkillPriority, setMissingSkillPriority] = useState([]);
  const [catalogRecommendations, setCatalogRecommendations] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Surfaced to the UI so pages can show real loading/error states
  // instead of silently swallowing failed API calls (Section 24).
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  const studentSkills = useMemo(() => user?.skills || [], [user]);
  const learningSkills = useMemo(() => user?.learningSkills || [], [user]);
  const profile = useMemo(() => mapUserToProfile(user), [user]);

  const refreshSkillDemand = useCallback(async () => {
    try {
      const { demand, missingSkillPriority: missing } = await skillApi.getSkillDemand();
      const map = Object.fromEntries(demand.map((d) => [d.skill, d.count]));
      setSkillDemand(map);
      setMissingSkillPriority(missing);
    } catch (err) {
      setDataError(err.message);
    }
  }, []);

  const refreshApplications = useCallback(async () => {
    const apps = await applicationApi.listApplications();
    setApplications(apps);
    return apps;
  }, []);

  const refreshCatalogRecommendations = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const { recommendations } = await recommendationApi.listRecommendations(9);
      setCatalogRecommendations(recommendations);
    } catch (err) {
      // Non-fatal — the tracked-internships view still works without this.
      setCatalogRecommendations([]);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      await Promise.all([refreshApplications(), refreshSkillDemand(), refreshCatalogRecommendations()]);
    } catch (err) {
      setDataError(err.message || "Failed to load your data.");
    } finally {
      setDataLoading(false);
    }
  }, [refreshApplications, refreshSkillDemand, refreshCatalogRecommendations]);

  // On mount: if a token is already stored (returning session), verify it
  // and hydrate state. Optimistically treat the user as authed so
  // ProtectedRoute doesn't flash a redirect to /login while this resolves.
  useEffect(() => {
    let cancelled = false;
    if (!getToken()) {
      setInitializing(false);
      return;
    }
    (async () => {
      try {
        const me = await authApi.fetchMe();
        if (cancelled) return;
        setUser(me);
        setIsAuthed(true);
        await refreshAll();
      } catch (err) {
        if (cancelled) return;
        setToken(null);
        setIsAuthed(false);
        setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      setAuthError(null);
      setAuthLoading(true);
      try {
        const me = await authApi.login(email, password);
        setUser(me);
        setIsAuthed(true);
        await refreshAll();
      } catch (err) {
        setAuthError(err.message || "Login failed");
        throw err;
      } finally {
        setAuthLoading(false);
      }
    },
    [refreshAll]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setApplications([]);
    setSkillDemand({});
    setMissingSkillPriority([]);
    setCatalogRecommendations([]);
    setIsAuthed(false);
  }, []);

  const register = useCallback(
    async (data) => {
      setAuthError(null);
      setAuthLoading(true);
      try {
        const me = await authApi.register(data);
        setUser(me);
        setIsAuthed(true);
        await refreshAll();
      } catch (err) {
        setAuthError(err.message || "Registration failed");
        throw err;
      } finally {
        setAuthLoading(false);
      }
    },
    [refreshAll]
  );

  const updateProfile = useCallback(async (updates) => {
    const updated = await userApi.updateProfile(updates);
    setUser(updated);
    return updated;
  }, []);

  const addSkill = useCallback(
    async (skill) => {
      const { skills, learningSkills: newLearning } = await userApi.addSkill(skill);
      setUser((u) => (u ? { ...u, skills, learningSkills: newLearning } : u));
      refreshSkillDemand();
    },
    [refreshSkillDemand]
  );

  const removeSkill = useCallback(
    async (skill) => {
      const { skills } = await userApi.removeSkill(skill);
      setUser((u) => (u ? { ...u, skills } : u));
      refreshSkillDemand();
    },
    [refreshSkillDemand]
  );

  const markAsLearning = useCallback(async (skill) => {
    const { learningSkills: newLearning } = await userApi.addLearningSkill(skill);
    setUser((u) => (u ? { ...u, learningSkills: newLearning } : u));
  }, []);

  const markSkillLearned = useCallback(
    async (skill) => {
      const { skills, learningSkills: newLearning } = await userApi.markSkillLearned(skill);
      setUser((u) => (u ? { ...u, skills, learningSkills: newLearning } : u));
      refreshSkillDemand();
    },
    [refreshSkillDemand]
  );

  const addInternship = useCallback(async (data) => {
    const internship = await internshipApi.createInternship({
      company: data.company,
      role: data.role,
      description: data.description,
      url: data.url || undefined,
      deadline: data.deadline || undefined,
      oaDate: data.oaDate || undefined,
      interviewDate: data.interviewDate || undefined,
      requiredSkills: data.requiredSkills,
    });

    await applicationApi.createApplication({
      internship: internship._id,
      status: data.status || "Applied",
      oaDate: data.oaDate || undefined,
      interviewDate: data.interviewDate || undefined,
    });

    await refreshApplications();
    return internship._id;
  }, [refreshApplications]);

  const updateInternshipStatus = useCallback(
    async (internshipId, status) => {
      const app = applications.find((a) => a.internship && a.internship._id === internshipId);
      if (!app) return;
      await applicationApi.updateApplicationStatus(app._id, status);
      await refreshApplications();
    },
    [applications, refreshApplications]
  );

  // Turns a catalog recommendation into a tracked application (i.e. "Apply"),
  // and records the interaction so the behavioral model can learn from it.
  const applyFromRecommendation = useCallback(
    async (internshipId) => {
      await applicationApi.createApplication({ internship: internshipId, status: "Applied" });
      await recommendationApi.recordInteraction(internshipId, "RECOMMENDATION_CLICK");
      await Promise.all([refreshApplications(), refreshCatalogRecommendations()]);
      return internshipId;
    },
    [refreshApplications, refreshCatalogRecommendations]
  );

  const internships = useMemo(
    () => applications.map((app) => mapApplicationToInternship(app, studentSkills)),
    [applications, studentSkills]
  );

  const value = {
    isAuthed,
    initializing,
    login,
    logout,
    register,
    authError,
    authLoading,
    dataError,
    dataLoading,

    profile,
    updateProfile,

    studentSkills,
    addSkill,
    removeSkill,
    learningSkills,
    markAsLearning,
    markSkillLearned,
    skillCatalog,

    internships,
    addInternship,
    updateInternshipStatus,

    skillDemand,
    missingSkillPriority,

    catalogRecommendations,
    catalogLoading,
    applyFromRecommendation,
    refreshCatalogRecommendations,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
