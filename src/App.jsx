import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api, setBaseUrl } from "./store";
import { resources } from "./config/resources";
import { logout } from "./store/auth-slice";
import LoginPage from "./pages/login";

// RTK Query exposes one hook per endpoint on api.endpoints.<name>.
const endpointHook = (resource, op) => {
  const def = api.endpoints[`${resource}:${op}`];
  return op === "list" || op === "get" || op === "custom" ? def.useQuery : def.useMutation;
};

const apiError = (e) => {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  const data = e.data || e;
  if (typeof data === "string") return data;

  const main = data.detail || data.error || data.message;
  const extra = data.constraint ? ` (${data.constraint})` : data.code ? ` [${data.code}]` : "";
  if (main) return `${main}${extra}`;
  if (data.details) return typeof data.details === "string" ? data.details : JSON.stringify(data.details);
  if (e.status) return `HTTP ${e.status}: ${JSON.stringify(data)}`;
  return String(e.error || e);
};

const pad = (n) => String(n).padStart(2, "0");
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : "");

const fieldToInput = (value, type) => {
  if (type === "boolean") return !!value;
  if (type === "datetime") return toLocalInput(value);
  if (type === "json") return value != null ? JSON.stringify(value, null, 2) : "";
  return value ?? "";
};

// Build the JSON payload from the form values; empty optionals are omitted
// so the API can apply DB defaults. Returns { payload, error }.
const buildPayload = (fields, values) => {
  const payload = {};
  for (const f of fields) {
    const raw = values[f.key];
    if (f.type === "boolean") {
      payload[f.key] = raw;
    } else if (f.type === "json") {
      if (!String(raw).trim()) continue;
      try {
        payload[f.key] = JSON.parse(raw);
      } catch {
        return { payload: null, error: `${f.label}: invalid JSON` };
      }
    } else if (f.type === "datetime") {
      if (!raw) continue;
      payload[f.key] = fromLocalInput(raw);
    } else if (f.type === "number") {
      if (raw === "" || raw == null) continue;
      payload[f.key] = Number(raw);
    } else {
      if (typeof raw === "string" && !raw.trim()) continue;
      payload[f.key] = raw;
    }
  }
  return { payload, error: null };
};

const fmt = (v) => {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (typeof v === "object") v = JSON.stringify(v);
  v = String(v);
  return v.length > 36 ? v.slice(0, 33) + "…" : v;
};

export default function App() {
  const baseUrl = useSelector((s) => s.settings.baseUrl);
  const { isAuthenticated, user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(resources[0].name);
  const [baseInput, setBaseInput] = useState(baseUrl);
  const [health, setHealth] = useState(null);
  const [authChecked, setAuthChecked] = useState(!token);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("invalid");
        return r.json();
      })
      .then((u) => {
        if (!cancelled && u.role !== "admin") {
          dispatch(logout());
        }
        if (!cancelled) setAuthChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          dispatch(logout());
          setAuthChecked(true);
        }
      });
    return () => { cancelled = true; };
  }, [token, baseUrl, dispatch]);

  useEffect(() => {
    let cancelled = false;
    setHealth(null);
    fetch(`${baseUrl}/health`)
      .then((r) => r.json())
      .then((d) => !cancelled && setHealth({ ok: true, data: d }))
      .catch((e) => !cancelled && setHealth({ ok: false, error: String(e) }));
    return () => { cancelled = true; };
  }, [baseUrl]);

  if (!authChecked) {
    return (
      <div className="login-page">
        <p className="muted">Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const current = resources.find((r) => r.name === selected);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Unisole Admin</h1>
          <span
            className={`health ${health ? (health.ok ? "ok" : "bad") : "unknown"}`}
            title={health ? JSON.stringify(health.data || health.error) : "checking…"}
          >
            {health ? (health.ok ? "API online" : "API offline") : "checking…"}
          </span>
        </div>
        <div className="topbar-right">
          <div className="base-url">
            <input
              type="text"
              value={baseInput}
              placeholder="http://localhost:3000"
              onChange={(e) => setBaseInput(e.target.value)}
            />
            <button onClick={() => dispatch(setBaseUrl(baseInput.trim() || "http://localhost:3000"))}>
              Set API URL
            </button>
          </div>
          <span className="user-badge">
            {user?.name || user?.email}
            {user?.role && <em> ({user.role})</em>}
          </span>
          <button className="danger" onClick={() => dispatch(logout())}>
            Logout
          </button>
        </div>
      </header>

      <div className="layout">
        <nav className="sidebar">
          {resources.map((r) => (
            <button
              key={r.name}
              className={`nav-item ${r.name === selected ? "active" : ""}`}
              onClick={() => setSelected(r.name)}
            >
              {r.label}
            </button>
          ))}
        </nav>
        <main className="main">
          <ResourcePanel
            key={`${current.name}:${baseUrl}`}
            resource={current}
            baseUrl={baseUrl}
          />
        </main>
      </div>
    </div>
  );
}

function ResourcePanel({ resource, baseUrl }) {
  const { name, label, path, fields, required, actions = [], passwordAction } = resource;

  const listHook = endpointHook(name, "list");
  const createHook = endpointHook(name, "create");
  const updateHook = endpointHook(name, "update");
  const removeHook = endpointHook(name, "remove");

  const { data, error, isFetching, refetch } = listHook(baseUrl);
  const [create, createRes] = createHook();
  const [update, updateRes] = updateHook();
  const [remove, removeRes] = removeHook();

  const [form, setForm] = useState(null);
  const [jsonUrl, setJsonUrl] = useState(null);
  const [notice, setNotice] = useState(null);
  const [pwRow, setPwRow] = useState(null);

  useEffect(() => {
    const res = createRes.isSuccess
      ? { type: "ok", text: `Created new ${label} row.` }
      : createRes.isError
        ? { type: "err", text: apiError(createRes.error) }
        : updateRes.isSuccess
          ? { type: "ok", text: `Updated ${label} row.` }
          : updateRes.isError
            ? { type: "err", text: apiError(updateRes.error) }
            : removeRes.isSuccess
              ? { type: "ok", text: `Deleted ${label} row.` }
              : removeRes.isError
                ? { type: "err", text: apiError(removeRes.error) }
                : null;
    if (res) setNotice(res);
  }, [createRes, updateRes, removeRes, label]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const onDelete = (row) => {
    if (window.confirm(`Delete ${label} row ${row.id}?`)) remove(row.id);
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>{label}</h2>
          <code>{path}</code>
        </div>
        <div className="toolbar">
          <button onClick={refetch} disabled={isFetching}>
            {isFetching ? "Loading…" : "Refresh"}
          </button>
          <button className="primary" onClick={() => setForm({ mode: "create" })}>
            + Add Row
          </button>
        </div>
      </div>

      {notice && <div className={`notice ${notice.type}`}>{notice.text}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {fields.filter((f) => !f.hideInTable).map((f) => (
                <th key={f.key}>{f.label}</th>
              ))}
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={fields.filter((f) => !f.hideInTable).length + 1} className="table-error">
                  {apiError(error)}
                </td>
              </tr>
            ) : isFetching && !data ? (
              <tr>
                <td colSpan={fields.filter((f) => !f.hideInTable).length + 1} className="muted">
                  Loading…
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={fields.filter((f) => !f.hideInTable).length + 1} className="muted">
                  No rows yet — click “+ Add Row”.
                </td>
              </tr>
              ) : (
              data.map((row) => (
                <tr key={row.id}>
                  {fields.filter((f) => !f.hideInTable).map((f) => (
                    <td key={f.key} title={row[f.key] != null ? String(row[f.key]) : ""}>
                      {fmt(row[f.key])}
                    </td>
                  ))}
                  <td className="row-actions">
                    <button onClick={() => setJsonUrl({ title: `${label} ${row.id}`, url: `${path}/${row.id}` })}>
                      View
                    </button>
                    <button onClick={() => setForm({ mode: "edit", row })}>Edit</button>
                    {actions.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => setJsonUrl({ title: a.label, url: a.url(row.id) })}
                      >
                        {a.label}
                      </button>
                    ))}
                    {passwordAction && (
                      <button onClick={() => setPwRow(row)}>Change Password</button>
                    )}
                    <button className="danger" onClick={() => onDelete(row)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <FormModal
          resource={resource}
          mode={form.mode}
          row={form.row}
          baseUrl={baseUrl}
          onClose={() => setForm(null)}
          onSubmit={(payload) => {
            if (form.mode === "create") create(payload);
            else update({ id: form.row.id, body: payload });
            setForm(null);
          }}
        />
      )}

      {jsonUrl && (
        <JsonModal
          resource={resource}
          url={jsonUrl.url}
          title={jsonUrl.title}
          baseUrl={baseUrl}
          onClose={() => setJsonUrl(null)}
        />
      )}

      {pwRow && (
        <PasswordModal
          row={pwRow}
          baseUrl={baseUrl}
          passwordAction={passwordAction}
          onClose={() => setPwRow(null)}
        />
      )}
    </section>
  );
}

function FormModal({ resource, mode, row, baseUrl, onClose, onSubmit }) {
  const { fields } = resource;
  const [values, setValues] = useState(() => {
    const init = {};
    for (const f of fields) init[f.key] = fieldToInput(row ? row[f.key] : undefined, f.type);
    return init;
  });
  const [error, setError] = useState(null);

  const set = (key) => (v) => setValues((prev) => ({ ...prev, [key]: v }));

  const submit = () => {
    const { payload, error: buildError } = buildPayload(fields, values);
    if (buildError) {
      setError(buildError);
      return;
    }
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>
          {mode === "create" ? "Add" : "Edit"} — {resource.label}
        </h3>
        <p className="muted">
          Base URL: <code>{baseUrl}</code> · Method:{" "}
          <code>{mode === "create" ? `POST ${resource.path}` : `PUT ${resource.path}/:id`}</code>
        </p>
        {error && <div className="notice err">{error}</div>}
        <div className="form">
          {fields
            .filter((f) => {
              if (f.key === "created_at" || f.key === "updated_at") return false;
              if (f.key === "id" && mode === "create") return false;
              return true;
            })
            .map((f) => (
            <FieldInput
              key={f.key}
              field={f}
              value={values[f.key]}
              onChange={set(f.key)}
              disabled={f.key === "id" && mode === "edit"}
            />
          ))}
        </div>
        <div className="modal-foot">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={submit}>
            {mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange, disabled }) {
  const { key, label, type, options, required } = field;
  const id = `field-${key}`;
  let control;
  if (type === "boolean") {
    control = (
      <input id={id} type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
    );
  } else if (type === "select") {
    control = (
      <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else if (type === "number") {
    control = (
      <input id={id} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    );
  } else if (type === "datetime") {
    control = (
      <input id={id} type="datetime-local" value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    );
  } else if (type === "textarea") {
    control = <textarea id={id} rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
  } else if (type === "password") {
    control = <input id={id} type="password" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} autoComplete="new-password" />;
  } else {
    control = <input id={id} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
  }
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {required && <em> *</em>}
      </span>
      {control}
    </label>
  );
}

function JsonModal({ resource, url, title, baseUrl, onClose }) {
  const hook = endpointHook(resource.name, "custom");
  const { data, error, isFetching, refetch } = hook(url);
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal json-modal">
        <h3>{title}</h3>
        <p className="muted">
          GET <code>{baseUrl}{url}</code>
        </p>
        <div className="json-box">
          {isFetching && !data ? (
            <span className="muted">Loading…</span>
          ) : error ? (
            <span className="table-error">{apiError(error)}</span>
          ) : (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
        <div className="modal-foot">
          <button onClick={refetch} disabled={isFetching}>
            Refetch
          </button>
          <button className="primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ row, baseUrl, passwordAction, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("unisole-admin:token");
      const res = await fetch(`${baseUrl}${passwordAction.url(row.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Change Password — {row.name || row.email || row.id}</h3>
        <p className="muted">New password will be hashed and stored.</p>
        {error && <div className="notice err">{error}</div>}
        {success && <div className="notice ok">Password updated.</div>}
        <div className="form" style={{ gridTemplateColumns: "1fr", marginTop: 14 }}>
          <label className="field" htmlFor="pw">
            <span>New Password *</span>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              autoFocus
            />
          </label>
        </div>
        <div className="modal-foot">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={submit} disabled={loading || success}>
            {loading ? "Saving…" : success ? "Done" : "Save Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
