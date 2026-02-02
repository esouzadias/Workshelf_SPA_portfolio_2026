import { useRef, useState, useEffect } from "react";
import { Paper, Box, Typography } from "@mui/material";
import "./Tile.styles.less";

export type TileProps = {
    icon?: any;
    title: string;
    subtitle?: string;
    onClick?: (e?:any) => void;
    className?: string;
    children?: React.ReactNode;
};

/** Card compacto com animações e ripple css-only */
export default function Tile({ icon, title, subtitle, onClick, className, children }: TileProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [anim, setAnim] = useState<string>("");

    const [phase, setPhase] = useState<"idle" | "outA" | "inA" | "outB" | "inB">("idle");
    const timerRef = useRef<number | null>(null);

    const clearTimer = () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
    const OUT_MS = 500;

    useEffect(() => {
        timerRef.current = window.setTimeout(() => setPhase("inA"), 0);
        return clearTimer;
    }, []);

    const setRandomTargets = () => {
        const host = rootRef.current;
        if (!host) return;
        host.querySelectorAll<HTMLElement>(".mini-bar__fill").forEach((el) => {
            const v = 0.35 + Math.random() * 0.55;
            el.style.setProperty("--pct", String(v));
        });
    };

    const runSequence = (outPhase: "outA" | "outB", inPhase: "inA" | "inB") => {
        clearTimer();
        setPhase(outPhase);
        timerRef.current = window.setTimeout(() => {
            setRandomTargets();
            setPhase(inPhase);
        }, OUT_MS + 30);
    };

    const ripple = (e: React.MouseEvent) => {
        if (!rootRef.current) return;
        const host = rootRef.current;
        const r = document.createElement("span");
        r.className = "tile__ripple";
        const rect = host.getBoundingClientRect();
        r.style.left = `${e.clientX - rect.left}px`;
        r.style.top = `${e.clientY - rect.top}px`;
        host.appendChild(r);
        setTimeout(() => r.remove(), 520);
    };

    const triggerRandomIconAnim = () => {
        const list = ["icon-anim--spin", "icon-anim--bounce", "icon-anim--wiggle", "icon-anim--stretch", "icon-anim--flip", "icon-anim--pulse"];
        const next = list[Math.floor(Math.random() * list.length)];
        setAnim(next);
        window.setTimeout(() => setAnim(""), 520);
    };

    return (
        <Paper
            ref={rootRef}
            elevation={0}
            className={`tile ${onClick ? "is-clickable" : ""} ${className ?? ""}`}
            data-phase={phase}
            onClick={onClick}
            onMouseDown={ripple}
            onMouseEnter={() => { triggerRandomIconAnim(); runSequence("outA", "inA"); }}
            onMouseLeave={() => runSequence("outB", "inB")}
            onMouseMove={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                const r = el.getBoundingClientRect();
                el.style.setProperty("--mx", `${e.clientX - r.left}px`);
                el.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
        >
            <Box className="tile__head">
                <img className={`tile__icon ${anim}`} src={icon} style={{padding: "10px"}}/>
                <Box className="tile__titles">
                    <Typography className="tile__title">{title}</Typography>
                    {subtitle && (
                        <Typography className="tile__subtitle" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}

                    {onClick && <strong><Typography className="tile_action_text" fontWeight={500}>Click to Expand</Typography></strong>}
                </Box>
            </Box>
            {children && <Box className="tile__body">{children}</Box>}
        </Paper>
    );
}