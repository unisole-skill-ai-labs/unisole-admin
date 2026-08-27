import React, { useState } from "react";
import {
  useGetPathwaysQuery,
  useCreatePathwayMutation,
  useUpdatePathwayMutation,
} from "../../store";
import PathwayBuilderModal from "./PathwayBuilderModal";
import {
  Plus,
  Compass,
  Edit2,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function PathwaysManager({ baseUrl }) {
  const { data: pathways = [], isLoading, refetch } = useGetPathwaysQuery(baseUrl);
  const [createPathway, { isLoading: isCreating }] = useCreatePathwayMutation();
  const [updatePathway, { isLoading: isUpdating }] = useUpdatePathwayMutation();

  const [search, setSearch] = useState("");
  const [editingPathway, setEditingPathway] = useState(null); // null | 'create' | pathwayObj
  const [buildingPathway, setBuildingPathway] = useState(null); // null | pathwayObj
  const [errorNotice, setErrorNotice] = useState(null);

  const filteredPathways = pathways.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSavePathway = async (formData) => {
    setErrorNotice(null);
    try {
      if (editingPathway === "create") {
        await createPathway({
          baseUrl,
          body: {
            title: formData.title,
            slug: formData.slug,
            shortDescription: formData.shortDescription,
            description: formData.description,
            pricePaise: Math.round(Number(formData.priceRupees || 0) * 100),
          },
        }).unwrap();
      } else {
        await updatePathway({
          baseUrl,
          id: editingPathway.id,
          body: {
            title: formData.title,
            slug: formData.slug,
            shortDescription: formData.shortDescription,
            description: formData.description,
            pricePaise: Math.round(Number(formData.priceRupees || 0) * 100),
            status: formData.status,
            isActive: formData.isActive,
          },
        }).unwrap();
      }
      setEditingPathway(null);
    } catch (err) {
      setErrorNotice(err?.data?.error || err?.data?.message || "Failed to save pathway");
    }
  };

  const handleToggleActive = async (pathway) => {
    try {
      await updatePathway({
        baseUrl,
        id: pathway.id,
        body: { isActive: !pathway.isActive },
      }).unwrap();
    } catch (err) {
      alert("Failed to toggle status: " + (err?.data?.error || err.message));
    }
  };

  return (
    <div className="view-container">
      <div className="section-header">
        <div>
          <h2>Pathways Management</h2>
          <p className="text-muted">
            Design, price, publish, and sequence multi-course educational pathways.
          </p>
        </div>
        <div className="flex-center gap-2">
          <button className="btn-secondary" onClick={refetch} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => setEditingPathway("create")}>
            <Plus size={16} /> Create Pathway
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search pathways by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-muted text-xs">
          Showing <strong>{filteredPathways.length}</strong> of {pathways.length} pathways
        </div>
      </div>

      {/* Pathways Grid / Table */}
      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & Slug</th>
                <th>Price (INR)</th>
                <th>Lifecycle Status</th>
                <th>Visibility</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-muted">
                    Loading pathways...
                  </td>
                </tr>
              ) : filteredPathways.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted">
                    No pathways found. Click "+ Create Pathway" to add one.
                  </td>
                </tr>
              ) : (
                filteredPathways.map((p) => {
                  const priceInRupees = (Number(p.pricePaise) || 0) / 100;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="font-semibold text-base">{p.title}</div>
                        <div className="font-mono text-xs text-muted">/{p.slug} · ID: {p.id}</div>
                      </td>
                      <td>
                        <span className="price-tag">
                          ₹{priceInRupees.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill pill-${p.status?.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`pill-toggle ${p.isActive ? "active" : "inactive"}`}
                          onClick={() => handleToggleActive(p)}
                          title="Click to toggle Active status"
                        >
                          {p.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="flex-end gap-1">
                          <button
                            className="btn-accent-sm"
                            onClick={() => setBuildingPathway(p)}
                            title="Manage linked courses, categories, and colleges"
                          >
                            <Layers size={14} /> Curriculum Builder
                          </button>
                          <button
                            className="btn-ghost-sm"
                            onClick={() => setEditingPathway(p)}
                            title="Edit details"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {editingPathway && (
        <PathwayFormModal
          pathway={editingPathway === "create" ? null : editingPathway}
          isLoading={isCreating || isUpdating}
          error={errorNotice}
          onClose={() => setEditingPathway(null)}
          onSave={handleSavePathway}
        />
      )}

      {/* Curriculum Builder Modal */}
      {buildingPathway && (
        <PathwayBuilderModal
          pathway={buildingPathway}
          baseUrl={baseUrl}
          onClose={() => setBuildingPathway(null)}
        />
      )}
    </div>
  );
}

function PathwayFormModal({ pathway, isLoading, error, onClose, onSave }) {
  const isEditing = !!pathway;
  const [title, setTitle] = useState(pathway?.title || "");
  const [slug, setSlug] = useState(pathway?.slug || "");
  const [shortDescription, setShortDescription] = useState(pathway?.shortDescription || "");
  const [description, setDescription] = useState(pathway?.description || "");
  const [priceRupees, setPriceRupees] = useState(
    pathway?.pricePaise ? (pathway.pricePaise / 100).toString() : "0"
  );
  const [status, setStatus] = useState(pathway?.status || "DRAFT");
  const [isActive, setIsActive] = useState(pathway?.isActive ?? true);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing) {
      // Auto-generate slug on creation
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      slug,
      shortDescription,
      description,
      priceRupees,
      status,
      isActive,
    });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditing ? "Edit Pathway" : "Create New Pathway"}</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert-error mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Pathway Title *</label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Master in Fullstack AI Development"
                required
              />
            </div>

            <div className="form-group span-2">
              <label>URL Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. fullstack-ai-development"
                required
              />
            </div>

            <div className="form-group">
              <label>Price in Rupees (₹) *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="0 for free"
                required
              />
            </div>

            {isEditing && (
              <div className="form-group">
                <label>Publication Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            )}

            <div className="form-group span-2">
              <label>Short Summary</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief one-line overview"
              />
            </div>

            <div className="form-group span-2">
              <label>Detailed Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed curriculum overview and prerequisites..."
              />
            </div>

            {isEditing && (
              <div className="form-group span-2 checkbox-row">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive">Active / Available in System</label>
              </div>
            )}
          </div>

          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Pathway"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
