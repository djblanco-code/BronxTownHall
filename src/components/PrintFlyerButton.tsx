import { useEffect, useState } from "react";
import { Printer, X } from "lucide-react";
import QRCode from "qrcode";
import { useI18n } from "@/lib/i18n-context";

export type FlyerData = {
  name: string;
  category?: string;
  address: string;
  phone: string;
  hours: string;
  notes?: string;
  description?: string;
  url: string;
};

/**
 * Print Flyer — generates a clean, black-and-white, image-free one-pager
 * for a resource so CBO workers can hang it in building lobbies.
 */
export function PrintFlyerButton({ data, className }: { data: FlyerData; className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ??
          "no-min-h inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
        }
      >
        <Printer className="h-4 w-4" /> {t("interface.printFlyer")}
      </button>
      {open && <FlyerModal data={data} onClose={() => setOpen(false)} />}
    </>
  );
}

function FlyerModal({ data, onClose }: { data: FlyerData; onClose: () => void }) {
  const { t } = useI18n();
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(data.url, {
      margin: 1,
      width: 320,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [data.url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("flyer-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("flyer-open");
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 overflow-auto p-4 flyer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Printable flyer preview"
    >
      <div className="mx-auto max-w-[8.5in] bg-white text-black rounded-lg shadow-xl">
        <div className="print-hide flex items-center justify-between gap-2 border-b border-neutral-300 px-4 py-3">
          <p className="text-sm font-medium text-neutral-700">
            Flyer preview — black &amp; white, no images
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="no-min-h inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
            >
              <Printer className="h-4 w-4" /> {t("interface.print")}
            </button>
            <button
              onClick={onClose}
              aria-label={t("interface.close")}
              className="no-min-h rounded-lg border border-neutral-300 p-2 hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div id="flyer-sheet" className="px-10 py-10">
          <p className="text-[11px] uppercase tracking-[0.2em] border-b-2 border-black pb-2">
            The Bronx App · Community Resource{data.category ? ` · ${data.category}` : ""}
          </p>

          <h1 className="mt-6 text-4xl">{data.name}</h1>
          {data.description && <p className="mt-3 text-lg leading-snug">{data.description}</p>}

          <dl className="mt-8 space-y-4 text-xl">
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest">
                {t("interface.address")}
              </dt>
              <dd className="mt-0.5 font-semibold">{data.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest">
                {t("interface.phone")}
              </dt>
              <dd className="mt-0.5 font-semibold">{data.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest">
                {t("interface.hours")}
              </dt>
              <dd className="mt-0.5 font-semibold">{data.hours}</dd>
            </div>
            {data.notes && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest">
                  What to bring / notes
                </dt>
                <dd className="mt-0.5 text-lg font-normal">{data.notes}</dd>
              </div>
            )}
          </dl>

          <div className="mt-10 flex items-end justify-between gap-6 border-t-2 border-black pt-6">
            <div className="max-w-[62%]">
              <p className="text-lg font-bold">Scan for directions, hours &amp; more help</p>
              <p className="mt-1 text-sm">Or visit: {data.url.replace(/^https?:\/\//, "")}</p>
              <p className="mt-4 text-xs">Free · Multilingual · Made for Bronx residents</p>
            </div>
            {qr ? (
              <img
                src={qr}
                alt="QR code linking to this resource in The Bronx App"
                width={150}
                height={150}
              />
            ) : (
              <div className="h-[150px] w-[150px] border border-black" aria-hidden="true" />
            )}
          </div>

          <p className="mt-6 text-[10px]">
            Printed from The Bronx App on {new Date().toLocaleDateString()}. Information may change
            — call ahead to confirm.
          </p>
        </div>
      </div>
    </div>
  );
}
