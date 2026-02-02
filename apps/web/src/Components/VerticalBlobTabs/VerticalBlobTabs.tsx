import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import "./VerticaBlocTabs.styles.less";

type Item<T extends string> = { value: T; label: string; icon?: React.ReactElement };
type Props<T extends string> = { items: Item<T>[]; value: T; onChange: (next: T) => void; className?: string };

export default function VerticalBlobTabs<T extends string>({
    items, value, onChange, className,
}: Props<T>) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [blob, setBlob] = useState({ top: 0, height: 44 });
    const [changing, setChanging] = useState(false);
    const [animKey, setAnimKey] = useState(0);
    const [hover, setHover] = useState<{ top: number; height: number } | null>(null);

    const index = useMemo(() => items.findIndex(i => i.value === value), [items, value]);

    const recalc = () => {
        const root = rootRef.current;
        if (!root) return;
        const el = root.querySelector<HTMLButtonElement>(".MuiTab-root.Mui-selected");
        if (!el) return;
        setBlob({ top: el.offsetTop, height: el.offsetHeight || 44 });
    };

    useEffect(() => {
        recalc();
        setChanging(true);
        setAnimKey(k => k + 1);
        const t = setTimeout(() => setChanging(false), 520);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, items.length]);

    useEffect(() => {
        const ro = new ResizeObserver(recalc);
        if (rootRef.current) ro.observe(rootRef.current);
        window.addEventListener("resize", recalc);
        return () => { ro.disconnect(); window.removeEventListener("resize", recalc); };
    }, []);

    return (
        <div
            ref={rootRef}
            className={`vblob-tabs ${changing ? "is-changing" : ""} ${className ?? ""}`}
            style={
                {
                    // @ts-ignore – used by CSS
                    "--blobTop": `${blob.top}px`,
                    "--blobH": `${blob.height}px`,
                    "--hoverTop": `${hover?.top ?? blob.top}px`,
                    "--hoverH": `${hover?.height ?? blob.height}px`,
                } as React.CSSProperties
            }
        >
            {/* liquid pill */}
            <span
                className="vblob-tabs__blob"
                style={{ transform: `translateY(${blob.top}px)`, height: blob.height }}
                aria-hidden
            />
            {/* hover halo */}
            <span
                className={`vblob-tabs__hover ${hover ? "is-on" : ""}`}
                style={{ transform: `translateY(${hover?.top ?? blob.top}px)`, height: hover?.height ?? blob.height }}
                aria-hidden
            />
            {/* trail + splashes (restart with key) */}
            <span key={`trail-${animKey}`} className="vblob-tabs__trail" style={{ transform: `translateY(${blob.top}px)`, height: blob.height }} />
            <span key={`splash-l-${animKey}`} className="vblob-tabs__splash vblob-tabs__splash--l" style={{ top: blob.top + blob.height / 2 }} />
            <span key={`splash-r-${animKey}`} className="vblob-tabs__splash vblob-tabs__splash--r" style={{ top: blob.top + blob.height / 2 }} />

            <Tabs
                orientation="vertical"
                value={value}
                onChange={(_, v) => onChange(v as T)}
                TabIndicatorProps={{ style: { display: "none" } }}
                aria-label="Profile tabs"
                className="vblob-tabs__track"
            >
                {items.map((it) => (
                    <Tab
                        key={it.value}
                        value={it.value}
                        icon={it.icon ?? undefined}
                        iconPosition={it.icon ? "start" : undefined}
                        label={it.label as any}
                        className="jello-tab"
                        disableRipple
                        onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            setHover({ top: el.offsetTop, height: el.offsetHeight || 44 });
                        }}
                        onMouseLeave={() => setHover(null)}
                    />
                ))}
            </Tabs>
        </div>
    );
}