import type { Plan, Spec } from "@/lib/types";

export function Specs({ specs }: { specs: Spec[] }) {
  return (
    <div className="panel">
      <div className="ph">
        <h3>Spesifikasi terkunci</h3>
      </div>
      <div className="pb">
        <dl className="kv">
          {specs.map((s) => (
            <div key={s.key} style={{ display: "contents" }}>
              <dt>{s.key}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="secnote" style={{ margin: 0 }}>
          Ubah hanya dengan kelulusan penyelia.
        </p>
      </div>
    </div>
  );
}

export function Plans({ plans }: { plans: Plan[] }) {
  return (
    <div>
      {plans.map((p) => (
        <div className="plan" key={p.name} style={{ marginBottom: 12 }}>
          <h3>{p.name}</h3>
          <p>{p.text}</p>
        </div>
      ))}
    </div>
  );
}
