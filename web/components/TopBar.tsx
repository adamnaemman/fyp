import Link from "next/link";
import type { Viewer } from "@/lib/types";

export default function TopBar({
  viewer,
  mode,
  generated,
}: {
  viewer: Viewer | null;
  mode: "supabase" | "snapshot";
  generated: string;
}) {
  return (
    <div className="top">
      <div className="wrap">
        <div className="brand">
          <i />
          BagSense <small>FYP1 · BICS 4321</small>
        </div>
        <span className={`badge ${mode === "supabase" ? "live" : "ro"}`}>
          {mode === "supabase" ? "supabase" : "snapshot"}
        </span>
        <div className="spacer" />
        <div className="stamp">dikemas kini {generated.slice(0, 16).replace("T", " ")}</div>
        {viewer ? (
          <div className="who">
            <b>{viewer.name}</b>
            <span className="badge">{viewer.role}</span>
            <form method="post" action="/api/auth/signout">
              <button className="btn" type="submit">
                keluar
              </button>
            </form>
          </div>
        ) : (
          <div className="who">
            <Link className="btn" href="/login">
              log masuk
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
