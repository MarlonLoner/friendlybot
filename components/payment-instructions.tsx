import { MessageCircle } from "lucide-react";

export function PaymentInstructions({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-lg border border-eclipse-gold/40 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-eclipse-gold">Payment Instructions</p>
      <h2 className="mt-2 text-2xl font-bold text-eclipse-ink">Activate for USD $10/year</h2>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
        <p><span className="font-semibold text-eclipse-ink">EcoCash / InnBucks:</span> 0772219228</p>
        <p><span className="font-semibold text-eclipse-ink">POP WhatsApp:</span> +263772219228</p>
        <p><span className="font-semibold text-eclipse-ink">Western Union / WorldRemit / Mukuru:</span> Send to Sandra using the same contact details.</p>
        <p><span className="font-semibold text-eclipse-ink">Account Name:</span> Eclipse Executive Selection (Pvt) Ltd</p>
        <p><span className="font-semibold text-eclipse-ink">NMB ZiG Account:</span> 0000021277959</p>
        <p><span className="font-semibold text-eclipse-ink">NMB USD Account:</span> 00000201400</p>
      </div>
      {!compact ? (
        <a
          href={`https://wa.me/263772219228?text=${encodeURIComponent("Hi Sandra, I have submitted my lodge on Find Lodges by Eclipse and I want to send proof of payment for the USD $10 annual listing.")}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 py-3 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Send POP to Sandra
        </a>
      ) : null}
    </div>
  );
}
