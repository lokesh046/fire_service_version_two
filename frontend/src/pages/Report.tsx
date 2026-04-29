import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { getDashboard, type DashboardData } from "../api/dashboard";
import { getFireHistory } from "../api/fire";
import { ReportTemplate } from "../components/ReportTemplate";

export function Report() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [fireHistory, setFireHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const componentRef = useRef<HTMLDivElement>(null);

  // Use the hook to trigger print
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Wealth_To_FIRE_Report",
    onAfterPrint: () => {
      // Optional: Navigate back to dashboard after printing or cancelling
      navigate("/dashboard");
    },
  });

  useEffect(() => {
    // 6. Wait for Data Load
    Promise.all([getDashboard(), getFireHistory()])
      .then(([dashboardRes, historyRes]) => {
        
        // If history has scenarios, find the primary one to use for FIRE stats
        let activeFire = dashboardRes.fire;
        if (historyRes.calculations && historyRes.calculations.length > 0) {
           activeFire = historyRes.calculations[0]; // Or primary goal
        }

        setData({
          ...dashboardRes,
          fire: activeFire,
        });
        setFireHistory(historyRes);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load report data.");
        setLoading(false);
      });
  }, []);

  // 8. Better Button Flow: Automatically trigger print when data loads
  useEffect(() => {
    if (!loading && data && !error) {
      // Wait a tiny bit for the DOM and Recharts to render the chart fully
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, data, error, handlePrint]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-emerald-400 font-medium">
          Generating your PDF Report...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
          <button
            onClick={() => navigate("/dashboard")}
            className="block mt-4 text-sm underline hover:text-red-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-10 overflow-auto">
      <div className="text-center mb-6">
        <p className="text-slate-400 text-sm mb-4">
          The print dialog should open automatically. If it doesn't, click the button below.
        </p>
        <button
          onClick={() => handlePrint()}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2 rounded-lg transition-colors"
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="ml-4 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* The invisible printable area. We use a container that looks good on screen but prints perfectly. */}
      {data && (
        <ReportTemplate data={data} fireHistory={fireHistory} ref={componentRef} />
      )}
    </div>
  );
}
