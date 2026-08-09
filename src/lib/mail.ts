export async function sendMagicLink(email: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[Kangae] Lien de connexion pour ${email} : ${url}`);
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "Kangae <onboarding@resend.dev>",
      to: email,
      subject: "Votre lien de connexion Kangae",
      html: `<p>Cliquez pour vous connecter à Kangae : <a href="${url}">${url}</a></p><p>Valable 15 minutes.</p>`,
    }),
  });
}
