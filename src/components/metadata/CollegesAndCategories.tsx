import React, { useState } from "react";
import {
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../../store";
import {
  GraduationCap,
  Tag,
  Plus,
  Edit2,
  Search,
  X,
  RefreshCw,
} from "lucide-react";

export default function CollegesAndCategories({ baseUrl }) {
  const [activeTab, setActiveTab] = useState("colleges"); // 'colleges' | 'categories'

  return (
    <div className="view-container">
      <div className="section-header">
        <div>
          <h2>Colleges & Categories</h2>
          <p className="text-muted">
            Manage partner universities, colleges, and domain categories.
          </p>
        </div>
      </div>

      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "colleges" ? "active" : ""}`}
          onClick={() => setActiveTab("colleges")}
        >
          <GraduationCap size={16} /> Partner Colleges
        </button>
        <button
          className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          <Tag size={16} /> Domain Categories
        </button>
      </div>

      <div className="tab-content mt-3">
        {activeTab === "colleges" && <CollegesSection baseUrl={baseUrl} />}
        {activeTab === "categories" && <CategoriesSection baseUrl={baseUrl} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. COLLEGES SECTION
// ----------------------------------------------------
function CollegesSection({ baseUrl }) {
  const { data: colleges = [], isLoading, refetch } = useGetCollegesQuery(baseUrl);
  const [createCollege, { isLoading: isCreating }] = useCreateCollegeMutation();
  const [updateCollege, { isLoading: isUpdating }] = useUpdateCollegeMutation();

  const [search, setSearch] = useState("");
  const [editingCollege, setEditingCollege] = useState(null);

  const filtered = colleges.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase()) ||
      c.shortName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (editingCollege === "create") {
      await createCollege({ baseUrl, body: formData }).unwrap();
    } else {
      await updateCollege({ baseUrl, id: editingCollege.id, body: formData }).unwrap();
    }
    setEditingCollege(null);
  };

  return (
    <div>
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search colleges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => setEditingCollege("create")}>
            <Plus size={16} /> Add College
          </button>
        </div>
      </div>

      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>College Name & Slug</th>
                <th>Short Name</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">Loading colleges...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">No colleges found.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-muted font-mono text-xs">/{c.slug} · ID: {c.id}</div>
                    </td>
                    <td>{c.shortName ? <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{c.shortName}</span> : "—"}</td>
                    <td>
                      {c.isActive ? (
                        <span className="status-pill pill-active">Active</span>
                      ) : (
                        <span className="status-pill pill-inactive">Disabled</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn-ghost-sm" onClick={() => setEditingCollege(c)}>
                        <Edit2 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingCollege && (
        <CollegeModal
          college={editingCollege === "create" ? null : editingCollege}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingCollege(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. CATEGORIES SECTION
// ----------------------------------------------------
function CategoriesSection({ baseUrl }) {
  const { data: categories = [], isLoading, refetch } = useGetCategoriesQuery(baseUrl);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const filtered = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (editingCategory === "create") {
      await createCategory({ baseUrl, body: formData }).unwrap();
    } else {
      await updateCategory({ baseUrl, id: editingCategory.id, body: formData }).unwrap();
    }
    setEditingCategory(null);
  };

  return (
    <div>
      <div className="toolbar-card">
        <div className="search-input-wrapper">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-center gap-2">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => setEditingCategory("create")}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="panel-card mt-3">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name & Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">Loading categories...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-muted">No categories found.</td></tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="font-semibold">{cat.name}</div>
                      <div className="text-muted font-mono text-xs">/{cat.slug} · ID: {cat.id}</div>
                    </td>
                    <td className="text-muted text-xs">{cat.description || "—"}</td>
                    <td>
                      {cat.isActive ? (
                        <span className="status-pill pill-active">Active</span>
                      ) : (
                        <span className="status-pill pill-inactive">Disabled</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn-ghost-sm" onClick={() => setEditingCategory(cat)}>
                        <Edit2 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingCategory && (
        <CategoryModal
          category={editingCategory === "create" ? null : editingCategory}
          isLoading={isCreating || isUpdating}
          onClose={() => setEditingCategory(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function CollegeModal({ college, isLoading, onClose, onSave }) {
  const isEditing = !!college;
  const [name, setName] = useState(college?.name || "");
  const [slug, setSlug] = useState(college?.slug || "");
  const [shortName, setShortName] = useState(college?.shortName || "");
  const [description, setDescription] = useState(college?.description || "");
  const [isActive, setIsActive] = useState(college?.isActive ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, slug, shortName: shortName || null, description, isActive });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditing ? "Edit College" : "Add College"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>College Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                required
              />
            </div>
            <div className="form-group">
              <label>Slug *</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Short Name / Acronym</label>
              <input type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="e.g. IITD" />
            </div>
            <div className="form-group span-2">
              <label>Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            {isEditing && (
              <div className="form-group span-2 checkbox-row">
                <input type="checkbox" id="clgActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <label htmlFor="clgActive">Active College</label>
              </div>
            )}
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save College"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ category, isLoading, onClose, onSave }) {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, slug, description, isActive });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{isEditing ? "Edit Category" : "Add Category"}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Category Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                }}
                required
              />
            </div>
            <div className="form-group span-2">
              <label>Slug *</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="form-group span-2">
              <label>Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            {isEditing && (
              <div className="form-group span-2 checkbox-row">
                <input type="checkbox" id="catActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <label htmlFor="catActive">Active Category</label>
              </div>
            )}
          </div>
          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
