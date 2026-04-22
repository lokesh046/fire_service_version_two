import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";
import { uploadRAGDocument, deleteRAGDocument } from "../api/admin";

export function AdminPanel() {
    const { user } = useAuthStore();
    const [file, setFile] = useState<File | null>(null);
    const [deleteSource, setDeleteSource] = useState("");
    const [status, setStatus] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Protected Route Logic
    if (!user || user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus({ type: "error", msg: "Please select a file first." });
            return;
        }

        setLoading(true);
        setStatus({ type: "info", msg: "Uploading and indexing document..." });

        try {
            await uploadRAGDocument(file);
            setStatus({ type: "success", msg: `Success! ${file.name} added to knowledge base.` });
            setFile(null);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.message || "Upload failed.";
            setStatus({ type: "error", msg: `Upload Failed: ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deleteSource.trim()) {
            setStatus({ type: "error", msg: "Please enter a source name to delete." });
            return;
        }

        setLoading(true);
        setStatus({ type: "info", msg: "Deleting source from vector DB..." });

        try {
            await deleteRAGDocument(deleteSource.trim());
            setStatus({ type: "success", msg: `Success! Source '${deleteSource}' removed from knowledge base.` });
            setDeleteSource("");
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.message || "Delete failed.";
            setStatus({ type: "error", msg: `Delete Failed: ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 mt-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Manage the Vector Database Retrieval-Augmented Generation (RAG) knowledge.
                </p>
            </div>

            {status && (
                <div className={`p-4 rounded-xl text-sm border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}>
                    {status.msg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Form */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Upload Document</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Select .txt or .pdf file
                            </label>
                            <input
                                type="file"
                                accept=".txt,.pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-emerald-500/10 file:text-emerald-400
                  hover:file:bg-emerald-500/20"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                        >
                            Upload and Index
                        </button>
                    </form>
                </div>

                {/* Delete Form */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Remove Source</h2>
                    <form onSubmit={handleDelete} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Exact Source/Filename
                            </label>
                            <input
                                type="text"
                                value={deleteSource}
                                onChange={(e) => setDeleteSource(e.target.value)}
                                placeholder="e.g. guide.txt"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !deleteSource}
                            className="w-full rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                        >
                            Delete from Vector DB
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
