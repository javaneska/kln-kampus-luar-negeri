import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const wa = typeof body?.wa === "string" ? body.wa.trim() : "";
    const mail = typeof body?.mail === "string" ? body.mail.trim() : "";
    const level = typeof body?.level === "string" ? body.level.trim() : "";
    const country = typeof body?.country === "string" ? body.country.trim() : "";
    const plan = typeof body?.plan === "string" ? body.plan.trim() : "";
    const consent = Boolean(body?.consent);
    const lang = body?.lang === "en" ? "en" : "id";

    if (!name || !wa || !mail || !consent) {
      return NextResponse.json(
        {
          ok: false,
          error:
            lang === "en"
              ? "Please complete all required fields and consent."
              : "Mohon lengkapi semua isian wajib dan centang persetujuan.",
        },
        { status: 400 }
      );
    }

    const waMessage =
      lang === "en"
        ? `Hello KLN Advisor, I would like to book a free study abroad consultation.\n\nName: ${name}\nWhatsApp: ${wa}\nEmail: ${mail}\nLevel: ${level}\nDestination: ${country || "Not decided yet"}\nStudy Plan: ${plan || "-"}`
        : `Halo Konselor KLN, saya ingin menjadwalkan konsultasi rencana studi.\n\nNama: ${name}\nWhatsApp: ${wa}\nEmail: ${mail}\nJenjang: ${level}\nNegara tujuan: ${country || "Belum ditentukan"}\nRencana: ${plan || "-"}`;

    const whatsappUrl = `https://wa.me/16026005671?text=${encodeURIComponent(waMessage)}`;

    return NextResponse.json({
      ok: true,
      submittedAt: new Date().toISOString(),
      whatsappUrl,
      contactEmail: "info@kampusluarnegeri.com",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
