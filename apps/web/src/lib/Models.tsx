import React, { useRef } from "react";

const glassSectionStyle: React.CSSProperties = {
    gridColumn: "1 / -1",
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.10)",
    background: "linear-gradient(135deg, rgba(255,255,255,.03), rgba(255,255,255,.01))",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: "0 0 10px rgba(0,0,0,.22)",
    position: "relative",
    overflow: "hidden",
    /* height: "100%", */

    "--mx": "0px",
    "--my": "0px",
    "--ma": "0",
} as React.CSSProperties;

export const Section: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => {
    const ref = useRef<HTMLDivElement | null>(null);

    const onMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        el.style.setProperty("--ma", "1");
    };

    const onLeave = () => {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--ma", "0");
    };

    return (
        <div ref={ref} style={glassSectionStyle} onMouseMove={onMove} onMouseLeave={onLeave}>
            {/* soft ambient glass */}
            <div
                style={{
                    position: "absolute",
                    inset: -6,
                    pointerEvents: "none",
                    background:
                        "radial-gradient(900px circle at 20% 10%, rgba(99,102,241,.06), transparent 40%)," +
                        "radial-gradient(700px circle at 85% 30%, rgba(236,72,153,.05), transparent 35%)",
                    opacity: 0.85,
                }}
            />

            {/* hover glow */}
            <div
                style={{
                    position: "absolute",
                    inset: -2,
                    pointerEvents: "none",
                    opacity: "var(--ma)" as any,
                    transition: "opacity 160ms ease",
                    background:
                        "radial-gradient(260px circle at var(--mx) var(--my), rgba(255,255,255,.14), rgba(255,255,255,.06) 32%, transparent 60%)",
                    filter: "blur(10px)",
                }}
            />

            <div style={{ fontWeight: 800, marginBottom: 10, opacity: 0.9, position: "relative", zIndex: 1 }}>
                {title}
            </div>

            <div
                className="form-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 0fr",
                    gap: 12,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {children}
            </div>
        </div>
    );
};