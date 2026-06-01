import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Monitor,
  Camera,
  UserCheck,
  AlertTriangle,
  ClipboardCheck,
  Eye,
  Lock,
  MousePointerClick,
  NotebookText,
  Siren,
  FileCheck2,
} from "lucide-react";
import { useCurrentUser } from "@hooks/useAuth";
import { useTheme } from "@hooks/useTheme";

const ProctoringPage = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", {
        state: { from: "/proctoring", message: "Please login to access proctoring" },
        replace: true,
      });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading proctoring workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // These cards define the main monitoring surfaces we want to support.
  const featureCards = [
    {
      title: "Webcam Monitoring",
      description: "Watch the candidate feed during the exam and store snapshots or short review clips when needed.",
      icon: Camera,
      status: "Planned",
    },
    {
      title: "Screen Recording / Sharing",
      description: "Capture the active exam screen or permit controlled screen sharing for live supervision.",
      icon: Monitor,
      status: "Planned",
    },
    {
      title: "Identity Checks",
      description: "Confirm the learner with ID prompts, face match review, or examiner approval before launch.",
      icon: UserCheck,
      status: "Planned",
    },
    {
      title: "Browser Lockdown",
      description: "Reduce access to other apps, new tabs, copy/paste shortcuts, and navigation away from the exam.",
      icon: Lock,
      status: "Planned",
    },
    {
      title: "Suspicious Activity Detection",
      description: "Track tab switching, window blur, copy/paste attempts, and repeated focus loss events.",
      icon: Siren,
      status: "Planned",
    },
    {
      title: "Audit Trail",
      description: "Keep a structured log of proctoring events for later review and escalation.",
      icon: FileCheck2,
      status: "Planned",
    },
  ];

  // This checklist shows the operational flow we can implement gradually.
  const workflowSteps = [
    {
      title: "Pre-exam setup",
      description: "Enable proctoring settings on the exam and confirm the allowed monitoring modes.",
      icon: NotebookText,
    },
    {
      title: "Identity verification",
      description: "Check the candidate's identity before the exam starts and store the verification result.",
      icon: UserCheck,
    },
    {
      title: "Live supervision",
      description: "Watch webcam, screen-share, and tab-switch events while the learner is in the exam.",
      icon: Eye,
    },
    {
      title: "Lockdown enforcement",
      description: "Suppress risky browser actions such as tab changes, copy/paste, and focus loss.",
      icon: Lock,
    },
    {
      title: "Incident review",
      description: "Flag suspicious activity and push the event into a review queue for proctors.",
      icon: AlertTriangle,
    },
    {
      title: "Audit export",
      description: "Store a complete trail of proctoring events for compliance, review, or dispute handling.",
      icon: ClipboardCheck,
    },
  ];

  const safeguards = [
    "Detects tab switching and window blur events.",
    "Tracks copy, paste, and other suspicious keyboard shortcuts.",
    "Allows webcam and screen capture controls to be enabled per exam.",
    "Maintains an auditable event trail for later review.",
  ];

  return (
    <div className={`min-h-screen py-8 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Hero section: explains what the proctoring workspace is for. */}
        <div className={`mb-8 rounded-3xl p-8 shadow-xl ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-sm font-medium text-blue-600">
                <Shield className="h-4 w-4" />
                Proctoring
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Proctoring Control Room</h1>
              <p className={`mt-3 max-w-2xl text-sm md:text-base ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                This workspace is the entry point for exam monitoring, verification, lockdown, and audit review.
                The controls below are scaffolded so each proctoring feature can be implemented one at a time.
              </p>
            </div>
            <Link
              to="/admin_panel"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Admin Panel
            </Link>
          </div>
        </div>

        {/* Feature grid: each card maps to a real proctoring capability. */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => (
            <div key={card.title} className={`rounded-2xl border p-6 shadow-lg ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="inline-flex rounded-xl bg-blue-600/10 p-3 text-blue-600">
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
                  {card.status}
                </span>
              </div>
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className={`mt-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{card.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Workflow panel: shows the order these controls are typically applied. */}
          <div className={`rounded-2xl border p-6 shadow-lg ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Monitoring Workflow</h2>
            </div>
            <ul className="space-y-3">
              {workflowSteps.map((step, index) => (
                <li key={step.title} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${darkMode ? "bg-gray-700/60" : "bg-gray-50"}`}>
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <step.icon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{step.title}</span>
                    </div>
                    <span className={`mt-1 block text-sm leading-6 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      {step.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Side panel: useful guardrails and rollout notes for the feature set. */}
          <div className={`rounded-2xl border p-6 shadow-lg ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
            <div className="mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Current Safeguards</h2>
            </div>
            <ul className="space-y-3">
              {safeguards.map((item) => (
                <li key={item} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${darkMode ? "bg-gray-700/60" : "bg-gray-50"}`}>
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span className={`text-sm leading-6 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-dashed border-blue-500/30 bg-blue-600/5 p-4">
              <div className="flex items-center gap-2 text-blue-600">
                <MousePointerClick className="h-4 w-4" />
                <span className="text-sm font-semibold">Implementation note</span>
              </div>
              <p className={`mt-2 text-sm leading-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Each feature can be connected later to real event listeners, backend logging, and per-exam settings without changing this page structure.
              </p>
            </div>
          </div>
        </div>

        {/* Footer-style action strip for future integration work. */}
        <div className={`mt-8 rounded-2xl border p-6 shadow-lg ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ready for feature-by-feature rollout</h2>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Webcam, screen recording, identity checks, lockdown rules, event detection, and audit export are all represented here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Open live session monitor
              </button>
              <button className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${darkMode ? "border-gray-600 bg-gray-700 text-white hover:bg-gray-600" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"}`}>
                Review audit trail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProctoringPage;