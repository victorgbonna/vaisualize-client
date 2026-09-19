import { AppLayout, ColorPicker, LoadButton, SelectOptionAsObjectValue } from "@/components";
import { SampleChart } from "@/components/chart/D3Charts";
import { ContinueCancel } from "@/components/modal";
import { PAGE_ROUTES } from "@/configs";
import { useLocalStorage, useToast } from "@/hooks";
import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "webbi_default_chart_theme";
const MAX_CHART_COLORS = 8;
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const DEFAULT_CHART_THEME = {
    background_color: "#f4fbff",
    font_color: "#000000",
    font_family: { label: "Inter", value: "Inter" },
    chart_colors: ["#4FC3F7", "#4adea0"]
};

export default function DefaultTheme() {
    return (
        <AppLayout active={'Defaults'}>
            <DefaultThemeTemplate />
        </AppLayout>
    );
}

function DefaultThemeTemplate() {
    const { getItemInLS, storeItemInLS } = useLocalStorage();
    const { NotifySuccess } = useToast();
    const [theme, setTheme] = useState(DEFAULT_CHART_THEME);
    const [showResetModal, setShowResetModal] = useState(false);

    // Fetch the currently saved theme details from local storage, no endpoint call needed.
    useEffect(() => {
        const saved = getItemInLS(THEME_STORAGE_KEY);
        if (saved) setTheme({ ...DEFAULT_CHART_THEME, ...saved });
    }, []);

    const updateField = (field, value) => setTheme((prev) => ({ ...prev, [field]: value }));

    const updateChartColor = (index, color) => {
        const next = [...theme.chart_colors];
        next[index] = color;
        updateField('chart_colors', next);
    };

    const addChartColor = () => {
        if (theme.chart_colors.length >= MAX_CHART_COLORS) return;
        updateField('chart_colors', [...theme.chart_colors, '#000000']);
    };

    const removeChartColor = (index) => {
        if (theme.chart_colors.length <= 1) return;
        updateField('chart_colors', theme.chart_colors.filter((_, i) => i !== index));
    };

    const moveChartColor = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= theme.chart_colors.length) return;
        const next = [...theme.chart_colors];
        [next[index], next[target]] = [next[target], next[index]];
        updateField('chart_colors', next);
    };

    const handleSave = () => {
        storeItemInLS({ key: THEME_STORAGE_KEY, val: theme });
        NotifySuccess('Default chart theme saved');
    };

    const handleReset = () => {
        setTheme(DEFAULT_CHART_THEME);
        storeItemInLS({ key: THEME_STORAGE_KEY, val: DEFAULT_CHART_THEME });
        setShowResetModal(false);
        NotifySuccess('Default chart theme reset');
    };

    return (
        <main className="flex-1 h-screen overflow-y-auto p-4 tablet:p-4 pb-24">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="space-y-2 max-w-2xl">
                    <h1 className="text-2xl tablet:text-xl font-semibold text-slate-900 tracking-tight">
                        Default Chart Theme
                    </h1>
                    <p className="text-sm tablet:text-sm text-slate-500 leading-relaxed">
                        These settings control how your charts look by default across every WebBI project. Changes apply to newly created charts that have not been customized on their own.
                    </p>
                </div>

                <div className="grid grid-cols-2 tablet:grid-cols-1 gap-6 items-start">
                    <div className="space-y-6 order-1">
                        <section className="bg-white border border-slate-200 rounded-2xl p-5 tablet:p-4 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-slate-900">Default Chart Appearance</h2>
                                <p className="text-sm text-slate-500">Controls the background, typography color and font used across your charts.</p>
                            </div>

                            <div className="space-y-5">
                                <HexColorField
                                    label="Background Color"
                                    description="The default canvas color behind every chart."
                                    value={theme.background_color}
                                    onChange={(val) => updateField('background_color', val)}
                                />

                                <HexColorField
                                    label="Font Color"
                                    description="Used for chart labels, titles, axis text and other typography."
                                    value={theme.font_color}
                                    onChange={(val) => updateField('font_color', val)}
                                />

                                <div>
                                    <p className="text-[15px] font-medium text-slate-800">Font Family</p>
                                    <p className="text-sm text-slate-500 mb-2">The typography used by chart titles, labels and legends.</p>
                                    <div className="max-w-xs">
                                        <SelectOptionAsObjectValue
                                            options={PAGE_ROUTES.FONT_SELECTIONS}
                                            label="Font Family"
                                            value={theme.font_family}
                                            containerClass="w-full"
                                            onChange={(val) => updateField('font_family', val)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-slate-200 rounded-2xl p-5 tablet:p-4 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-slate-900">Chart Colors</h2>
                                <p className="text-sm text-slate-500">The default color palette applied, in order, to chart data series when no custom colors are set.</p>
                            </div>

                            <div className="space-y-3">
                                {theme.chart_colors.map((color, index) => (
                                    <div key={index} className="flex items-center gap-x-2">
                                        <ColorPicker
                                            value={color}
                                            onChange={(newColor) => updateChartColor(index, newColor)}
                                        />
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) => updateChartColor(index, e.target.value)}
                                            className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${HEX_COLOR_REGEX.test(color) ? '' : 'border-red-300'}`}
                                        />
                                        <div className="flex items-center gap-x-1 shrink-0">
                                            <button
                                                type="button"
                                                aria-label="Move color up"
                                                disabled={index === 0}
                                                onClick={() => moveChartColor(index, -1)}
                                                className="w-8 h-8 flex items-center justify-center border rounded-md text-slate-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Move color down"
                                                disabled={index === theme.chart_colors.length - 1}
                                                onClick={() => moveChartColor(index, 1)}
                                                className="w-8 h-8 flex items-center justify-center border rounded-md text-slate-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Remove color"
                                                disabled={theme.chart_colors.length <= 1}
                                                onClick={() => removeChartColor(index)}
                                                className="w-8 h-8 flex items-center justify-center border rounded-md text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addChartColor}
                                disabled={theme.chart_colors.length >= MAX_CHART_COLORS}
                                className="mt-4 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                + Add Chart Color
                            </button>
                        </section>
                    </div>

                    <div className="space-y-4 order-2 sticky top-4 tablet:static">
                        <section className="bg-white border border-slate-200 rounded-2xl p-5 tablet:p-4 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">Live Preview</h2>
                                <p className="text-sm text-slate-500">A preview of your default chart theme using sample data.</p>
                            </div>

                            <div className="space-y-4">
                                <SampleChart
                                    type="bar"
                                    data={[10, 20, 30, 40]}
                                    bgColor={theme.background_color}
                                    textColor={theme.font_color}
                                    font={theme.font_family}
                                    chartColors={theme.chart_colors}
                                />
                                <SampleChart
                                    data={[10, 20, 30, 40]}
                                    bgColor={theme.background_color}
                                    textColor={theme.font_color}
                                    font={theme.font_family}
                                    chartColors={theme.chart_colors}
                                />
                            </div>
                        </section>

                        <section className="bg-white border border-slate-200 rounded-2xl p-5 tablet:p-4 shadow-sm space-y-3">
                            <LoadButton
                                onClick={handleSave}
                                className="w-full text-center bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg"
                            >
                                Save Changes
                            </LoadButton>
                            <button
                                type="button"
                                onClick={() => setShowResetModal(true)}
                                className="w-full text-center border border-slate-300 text-slate-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg"
                            >
                                Reset to Default
                            </button>
                        </section>
                    </div>
                </div>
            </div>

            {showResetModal ? (
                <ContinueCancel
                    text="Reset your default chart theme? This will restore the background color, font color, font family and chart colors to WebBI's defaults."
                    cancelLabel="Cancel"
                    continueLabel="Reset"
                    continueClass="bg-primary"
                    onClose={() => setShowResetModal(false)}
                    onNext={handleReset}
                />
            ) : null}
        </main>
    );
}

function HexColorField({ label, description, value, onChange }) {
    return (
        <div>
            <p className="text-[15px] font-medium text-slate-800">{label}</p>
            {description ? <p className="text-sm text-slate-500 mb-2">{description}</p> : null}
            <div className="flex items-center gap-x-2 max-w-xs">
                <ColorPicker value={value} onChange={onChange} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${HEX_COLOR_REGEX.test(value) ? '' : 'border-red-300'}`}
                />
            </div>
        </div>
    );
}
