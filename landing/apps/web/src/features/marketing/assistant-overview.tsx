import {
  Bot,
  Check,
  FileText,
  Headphones,
  Layers3,
  ListChecks,
  Network,
  Sparkles,
} from "lucide-react";

const tools = [
  { title: "خلاصه‌سازی", icon: FileText },
  { title: "فلش‌کارت", icon: Layers3 },
  { title: "آزمون تمرینی", icon: ListChecks },
  { title: "نقشهٔ مفهومی", icon: Network },
  { title: "راهنمای مطالعه", icon: Sparkles },
  { title: "خروجی صوتی", icon: Headphones },
];

export function AssistantOverview() {
  return (
    <figure
      className="assistant-overview w-full rounded-3xl border border-blue-200 bg-blue-50/70 p-5 tablet:p-7"
      aria-label="دستیار فعال ماکان و ابزارهای مطالعه"
    >
      <div className="flex items-center gap-3 border-b border-blue-200 pb-5">
        <span className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-white">
          <Bot size={26} aria-hidden="true" />
        </span>
        <div>
          <strong className="block text-lg text-slate-900">دستیار ماکان</strong>
          <span className="text-xs text-slate-600">
            یادگیری، با منابع خودتان
          </span>
        </div>
        <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          <Check size={14} aria-hidden="true" /> فعال
        </span>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4">
        <FileText className="shrink-0 text-blue-700" aria-hidden="true" />
        <div>
          <strong className="block text-sm text-slate-800">
            منابع انتخاب‌شدهٔ شما
          </strong>
          <span className="mt-1 block text-xs text-slate-600">
            منابع آماده، با مجوز جاری حساب
          </span>
        </div>
      </div>
      <ol className="my-5 grid gap-3 text-sm text-slate-700">
        {[
          "منبع را انتخاب کنید",
          "سؤال بپرسید یا ابزار مطالعه را انتخاب کنید",
          "پاسخ را دریافت و در کنار منبع مرور کنید",
        ].map((step, index) => (
          <li key={step} className="flex items-center gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-blue-200 bg-white text-xs text-blue-700">
              {(index + 1).toLocaleString("fa-IR")}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
        {tools.map(({ title, icon: Icon }) => (
          <span
            key={title}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs text-slate-700"
          >
            <Icon
              size={16}
              className="shrink-0 text-blue-700"
              aria-hidden="true"
            />
            {title}
          </span>
        ))}
      </div>
      <figcaption className="mt-5 text-xs leading-6 text-slate-600">
        گفت‌وگو و ابزارهای مطالعه، در زمینهٔ منابع انتخاب‌شده.
      </figcaption>
    </figure>
  );
}
