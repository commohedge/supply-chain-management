import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_TOPICS = [
  "phosphate", "phosphates", "engrais", "fertilizer", "fertilizers", "fertilisant",
  "commodity", "commodities", "matière première", "raw material",
  "supply chain", "logistique", "logistics", "freight", "fret",
  "incoterm", "incoterms", "FOB", "CFR", "CIF", "DAP", "DDP",
  "énergie", "energy", "gaz", "gas", "pétrole", "oil", "ammonia", "ammoniac",
  "soufre", "sulfur", "acide phosphorique", "phosphoric acid",
  "DAP", "MAP", "TSP", "NPK", "MGA", "SSP",
  "OCP", "port", "vessel", "navire", "cargo", "stockage", "storage",
  "client", "fournisseur", "supplier", "stock", "production",
  "marché", "market", "prix", "price", "netback", "arbitrage",
  "carte", "map", "dashboard", "tableau de bord",
  "demande", "demand", "offre", "supply", "pipeline",
];

function buildSystemPrompt(style: string, jargon: string, dashboardData: string, locale: string): string {
  const isFr = locale === "fr";

  const styleInstructions: Record<string, string> = isFr
    ? {
        concise: "Réponds de manière très concise, en 2-3 phrases maximum. Va droit au but.",
        detailed: "Fournis des réponses détaillées et structurées avec des explications approfondies, des exemples et du contexte.",
        long: "Fournis des réponses longues et exhaustives couvrant tous les aspects du sujet, avec analyses, comparaisons et recommandations.",
      }
    : {
        concise: "Reply very concisely, 2-3 sentences max. Get straight to the point.",
        detailed: "Provide detailed, structured answers with in-depth explanations, examples and context.",
        long: "Provide long, exhaustive answers covering all aspects of the topic, with analyses, comparisons and recommendations.",
      };

  const jargonInstructions: Record<string, string> = isFr
    ? {
        simple: "Utilise un langage simple et accessible, évite le jargon technique. Explique les termes spécialisés si nécessaire.",
        professional: "Utilise un langage professionnel standard du secteur des commodités et de la supply chain.",
        expert: "Utilise le jargon expert du trading de commodités, du shipping et de la supply chain sans simplification. Termes techniques : TC rate, bunker, laytime, demurrage, netback, FOB, CFR, CIF, DAP, etc.",
      }
    : {
        simple: "Use simple, accessible language. Avoid technical jargon. Explain specialized terms when necessary.",
        professional: "Use standard professional language from the commodities and supply chain industry.",
        expert: "Use expert commodity trading, shipping and supply chain jargon without simplification. Technical terms: TC rate, bunker, laytime, demurrage, netback, FOB, CFR, CIF, DAP, etc.",
      };

  const outOfScope = isFr
    ? "Je suis spécialisé en phosphates, énergie, fertilisants, commodités, supply chain, logistique et incoterms. Je ne peux pas répondre à cette question."
    : "I specialize in phosphates, energy, fertilizers, commodities, supply chain, logistics and incoterms. I cannot answer this question.";

  return `You are an AI assistant specialized exclusively in the following domains:
- Phosphates and derivatives (DAP, MAP, TSP, NPK, SSP, phosphoric acid, phosphate rock)
- Energy (natural gas, oil, ammonia, sulfur)
- Fertilizers
- Commodities and raw materials
- Supply chain and maritime logistics
- Incoterms (FOB, CFR, CIF, DAP, DDP, etc.)
- Trading and international markets

ABSOLUTE RULE: You must NEVER answer questions outside these domains. If the question is off-topic, reply politely: "${outOfScope}"

${styleInstructions[style] || styleInstructions.professional}
${jargonInstructions[jargon] || jargonInstructions.professional}

You have access to the user's dashboard data below. Use it to answer questions about clients, suppliers, stocks, ports, vessels, production, market, etc.

=== DASHBOARD DATA ===
${dashboardData}
=== END DATA ===

Reply in ${isFr ? "French" : "English"} by default. If the user writes in the other language, reply in their language.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, style, jargon, dashboardData, locale } = await req.json();
    const AI_GATEWAY_URL =
      Deno.env.get("AI_GATEWAY_URL") ||
      "https://api.openai.com/v1/chat/completions";
    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY is not configured");
    const AI_MODEL = Deno.env.get("AI_MODEL") || "gpt-4o-mini";

    const systemPrompt = buildSystemPrompt(
      style || "professional",
      jargon || "professional",
      dashboardData || "No data available",
      locale || "en"
    );

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants. Ajoutez des crédits dans Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
