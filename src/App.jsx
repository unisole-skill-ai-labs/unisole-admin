import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api, setBaseUrl } from "./store";
import { resources } from "./config/resources";

// RTK Query exposes one hook per endpoint on api.endpoints.<name>.
const endpointHook = (resource, op) => {
  const def = api.endpoints[`${resource}:${op}`];
  return op === "list" || op === "get" || op === "custom" ? def.useQuery : def.useMutation;
};

const apiError = (e) => {
  if (!e) return "Unknown error";
  if (e.data && e.data.error) return e.data.error;
  if (e.data && e.data.message) return e.data.message;
  if (e.status) return `HTTP ${e.status}`;
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
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(resources[0].name);
  const [baseInput, setBaseInput] = useState(baseUrl);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setHealth(null);
    fetch(`${baseUrl}/health`)
      .then((r) => r.json())
      .then((d) => !cancelled && setHealth({ ok: true, data: d }))
      .catch((e) => !cancelled && setHealth({ ok: false, error: String(e) }));
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

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
  const { name, label, path, fields, required, actions = [] } = resource;

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
              {fields.map((f) => (
                <th key={f.key}>{f.label}</th>
              ))}
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={fields.length + 1} className="table-error">
                  {apiError(error)}
                </td>
              </tr>
            ) : isFetching && !data ? (
              <tr>
                <td colSpan={fields.length + 1} className="muted">
                  Loading…
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} className="muted">
                  No rows yet — click “+ Add Row”.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  {fields.map((f) => (
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
          {fields.map((f) => (
            <FieldInput key={f.key} field={f} value={values[f.key]} onChange={set(f.key)} />
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

function FieldInput({ field, value, onChange }) {
  const { key, label, type, options, required } = field;
  const id = `field-${key}`;
  let control;
  if (type === "boolean") {
    control = (
      <input id={id} type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    );
  } else if (type === "select") {
    control = (
      <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)}>
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
      <input id={id} type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    );
  } else if (type === "datetime") {
    control = (
      <input id={id} type="datetime-local" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    );
  } else if (type === "textarea") {
    control = <textarea id={id} rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  } else {
    control = <input id={id} type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
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
