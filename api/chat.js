// Función serverless de Vercel: POST /api/chat
// Lupi explica términos médicos en palabras sencillas usando Claude.
// Requiere la variable de entorno ANTHROPIC_API_KEY en Vercel.
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM = `Eres Lupi, una lupa simpática que vive en la app "well well" de un hospital.
Tu único trabajo es explicar palabras, estudios, procedimientos y medicinas en español sencillo.

Reglas:
- Responde en español, cálido y claro. Máximo 90 palabras.
- Si el modo es "nino": habla para un niño de 6 a 11 años, con comparaciones cotidianas (juguetes, comida, superhéroes). Frases cortas.
- Si el modo es "adulto": lenguaje simple para pacientes y familias, sin tecnicismos innecesarios.
- Puedes usar **negritas** para la idea principal. No uses listas largas ni títulos.
- No des diagnósticos, no digas qué dosis tomar ni cambies tratamientos. Si te preguntan algo así, explica el concepto general y sugiere preguntarle a su doctor o enfermera.
- Si alguien describe una emergencia, dolor fuerte, dificultad para respirar o que se siente muy mal, dile que avise de inmediato a su enfermera o médico (o use el botón de llamado).
- Si la pregunta no es de salud u hospital, responde con amabilidad que solo sabes de palabras del hospital.
- Nunca pidas datos personales.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const question = String(body.question || "").trim().slice(0, 300);
  const mode = body.mode === "adulto" ? "adulto" : "nino";
  if (!question) return res.status(400).json({ error: "Falta la pregunta" });

  // Historial corto para preguntas de seguimiento ("¿y eso duele?")
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
  const messages = [];
  for (const m of history) {
    if ((m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
      messages.push({ role: m.role, content: m.content.slice(0, 1200) });
    }
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  messages.push({ role: "user", content: `[modo: ${mode}] ${question}` });

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM,
      messages,
    });

    if (response.stop_reason === "refusal") {
      return res.status(200).json({ answer: "Esa pregunta mejor házsela a tu doctor o enfermera, ellos te pueden ayudar mejor que yo. ¿Quieres que te explique otra palabra?" });
    }
    const answer = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return res.status(200).json({ answer });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("ANTHROPIC_API_KEY inválida o ausente");
      return res.status(500).json({ error: "Asistente sin configurar" });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Muchas preguntas a la vez, intenta en un momento" });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Error de API ${error.status}:`, error.message);
      return res.status(502).json({ error: "El asistente no respondió" });
    }
    console.error(error);
    return res.status(500).json({ error: "Error inesperado" });
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
