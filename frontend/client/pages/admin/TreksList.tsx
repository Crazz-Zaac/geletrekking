import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { Pencil, Trash2, Plus, Search, Star } from "lucide-react";

export default function TreksList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "destinations" | "optional">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Fetch all treks
  const { data: treks, isLoading } = useQuery({
    queryKey: ["admin-treks"],
    queryFn: async () => {
      const response = await api.get("/api/treks");
      return response.data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/treks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-treks"] });
      alert("✅ Trek deleted successfully!");
    },
    onError: (error: any) => {
      alert("❌ Error deleting trek: " + (error.response?.data?.message || error.message));
    },
  });

  // Filter treks
  const filteredTreks = (treks || []).filter((trek: any) => {
    const matchesSearch = trek.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType =
      filterType === "all" ||
      (filterType === "destinations" && !trek.is_optional) ||
      (filterType === "optional" && trek.is_optional);
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && trek.is_active) ||
      (filterStatus === "inactive" && !trek.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  // Stats
  const stats = {
    total: treks?.length || 0,
    destinations: treks?.filter((t: any) => !t.is_optional).length || 0,
    optional: treks?.filter((t: any) => t.is_optional).length || 0,
    active: treks?.filter((t: any) => t.is_active).length || 0,
    featured: treks?.filter((t: any) => t.is_featured).length || 0,
  };

  return (
    <div className="p-8 text-white min-h-screen bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">🗻 Manage Treks</h1>
          <p className="text-slate-400 mt-1">View, edit, and manage all trekking packages</p>
        </div>
        <button
          onClick={() => navigate("/admin/treks/create")}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors shadow-lg"
        >
          <Plus size={20} />
          Create New Trek
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="text-slate-400 text-sm">Total Treks</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-blue-500/30">
          <div className="text-slate-400 text-sm">Destinations</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{stats.destinations}</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-purple-500/30">
          <div className="text-slate-400 text-sm">Optional</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{stats.optional}</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-green-500/30">
          <div className="text-slate-400 text-sm">Active</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{stats.active}</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-slate-400 text-sm">Featured</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{stats.featured}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search treks by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-yellow-500 focus:outline-none text-white"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === "all"
                  ? "bg-yellow-500 text-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterType("destinations")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === "destinations"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Destinations ({stats.destinations})
            </button>
            <button
              onClick={() => setFilterType("optional")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === "optional"
                  ? "bg-purple-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Optional ({stats.optional})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-slate-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "active"
                  ? "bg-green-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "inactive"
                  ? "bg-red-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Treks Table */}
      {isLoading ? (
        <div className="text-center py-12 bg-slate-900 rounded-lg">
          <div className="text-slate-400">Loading treks...</div>
        </div>
      ) : filteredTreks.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-lg">
          <p className="text-slate-400 text-lg mb-2">No treks found</p>
          <p className="text-slate-500 text-sm">
            {searchTerm ? "Try adjusting your search" : "Create your first trek to get started"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate("/admin/treks/create")}
              className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
            >
              Create Trek
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Trek</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTreks.map((trek: any) => (
                  <tr key={trek._id} className="hover:bg-slate-800/50 transition-colors">
                    {/* Trek Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {trek.image_url ? (
                          <img
                            src={trek.image_url}
                            alt={trek.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-slate-500 text-xs">
                            No Image
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{trek.name}</div>
                          <div className="text-sm text-slate-400 line-clamp-2 mt-1">
                            {trek.overview || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="text-slate-300">
                          {trek.duration_days} days • {trek.difficulty}
                        </div>
                        <div className="text-slate-400">${trek.price_usd || 0} USD</div>
                        {trek.has_offer && (
                          <div className="text-green-400 text-xs">🎉 Has Offer</div>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trek.is_optional
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {trek.is_optional ? "Optional" : "Destination"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 w-fit ${
                            trek.is_active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {trek.is_active ? "Active" : "Inactive"}
                        </span>
                        {trek.is_featured && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 inline-flex items-center gap-1 w-fit">
                            <Star size={12} fill="currentColor" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/admin/treks/edit/${trek._id}`)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                          title="Edit Trek"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(trek._id, trek.name)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Delete Trek"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results count */}
      {!isLoading && filteredTreks.length > 0 && (
        <div className="mt-4 text-center text-sm text-slate-400">
          Showing {filteredTreks.length} of {treks?.length || 0} treks
        </div>
      )}
    </div>
  );
}
