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
  const styleInstructions: Record<string, string> = {
    concise: "Réponds de manière très concise, en 2-3 phrases maximum. Va droit au but.",
    detailed: "Fournis des réponses détaillées et structurées avec des explications approfondies, des exemples et du contexte.",
    long: "Fournis des réponses longues et exhaustives couvrant tous les aspects du sujet, avec analyses, comparaisons et recommandations.",
  };

  const jargonInstructions: Record<string, string> = {
    simple: "Utilise un langage simple et accessible, évite le jargon technique. Explique les termes spécialisés si nécessaire.",
    professional: "Utilise un langage professionnel standard du secteur des commodités et de la supply chain.",
    expert: "Utilise le jargon expert du trading de commodités, du shipping et de la supply chain sans simplification. Termes techniques : TC rate, bunker, laytime, demurrage, netback, FOB, CFR, CIF, DAP, etc.",
  };

  return `Tu es un assistant IA spécialisé exclusivement dans les domaines suivants :
- Phosphates et produits dérivés (DAP, MAP, TSP, NPK, SSP, acide phosphorique, roche phosphate)
- Énergie (gaz naturel, pétrole, ammoniac, soufre)
- Engrais et fertilisants
- Commodités et matières premières
- Supply chain et logistique maritime
- Incoterms (FOB, CFR, CIF, DAP, DDP, etc.)
- Trading et marchés internationaux

RÈGLE ABSOLUE : Tu ne dois JAMAIS répondre à des questions en dehors de ces domaines. Si la question est hors sujet, réponds poliment : "Je suis spécialisé en phosphates, énergie, fertilisants, commodités, supply chain, logistique et incoterms. Je ne peux pas répondre à cette question."

${styleInstructions[style] || styleInstructions.professional}
${jargonInstructions[jargon] || jargonInstructions.professional}

Tu as accès aux données du dashboard de l'utilisateur ci-dessous. Utilise-les pour répondre aux questions sur les clients, fournisseurs, stocks, ports, navires, production, marché, etc.

=== DONNÉES DU DASHBOARD ===
${dashboardData}
=== FIN DES DONNÉES ===

Réponds dans la même langue que la question posée (français ou anglais).`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, style, jargon, dashboardData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = buildSystemPrompt(
      style || "professional",
      jargon || "professional",
      dashboardData || "Aucune donnée disponible"
    );

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
