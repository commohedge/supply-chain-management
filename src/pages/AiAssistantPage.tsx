import { useState, useRef, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Settings2, Sparkles, Eraser } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function serializeDashboardData(config: any): string {
  const sections: string[] = [];

  const g = config.general;
  sections.push(`Entreprise: ${g.companyName}, Date: ${g.dashboardDate}, Devise: ${g.currency}`);

  if (config.referentiel) {
    const r = config.referentiel;
    if (r.ports?.length) sections.push(`PORTS:\n${JSON.stringify(r.ports, null, 1)}`);
    if (r.exportProducts?.length) sections.push(`PRODUITS EXPORT:\n${JSON.stringify(r.exportProducts, null, 1)}`);
    if (r.importMaterials?.length) sections.push(`MATIÈRES IMPORTÉES:\n${JSON.stringify(r.importMaterials, null, 1)}`);
    if (r.suppliers?.length) sections.push(`FOURNISSEURS:\n${JSON.stringify(r.suppliers, null, 1)}`);
    if (r.clients?.length) sections.push(`CLIENTS:\n${JSON.stringify(r.clients, null, 1)}`);
  }

  if (config.overview) {
    const o = config.overview;
    if (o.kpis?.length) sections.push(`KPIs OVERVIEW:\n${JSON.stringify(o.kpis, null, 1)}`);
    if (o.storage?.length) sections.push(`STOCKS PAR PAYS:\n${JSON.stringify(o.storage, null, 1)}`);
    if (o.demand?.length) sections.push(`DEMANDE:\n${JSON.stringify(o.demand, null, 1)}`);
  }

  if (config.supply) {
    const s = config.supply;
    if (s.kpis?.length) sections.push(`KPIs SUPPLY:\n${JSON.stringify(s.kpis, null, 1)}`);
    if (s.ports?.length) sections.push(`PORTS UTILISATION:\n${JSON.stringify(s.ports, null, 1)}`);
    if (s.vessels) sections.push(`NAVIRES: ${JSON.stringify(s.vessels)}`);
  }

  if (config.pipeline) {
    const p = config.pipeline;
    if (p.kpis?.length) sections.push(`KPIs PIPELINE:\n${JSON.stringify(p.kpis, null, 1)}`);
    if (p.destinations?.length) sections.push(`DESTINATIONS:\n${JSON.stringify(p.destinations, null, 1)}`);
    if (p.clientsByRegion?.length) sections.push(`CLIENTS PAR RÉGION:\n${JSON.stringify(p.clientsByRegion, null, 1)}`);
  }

  if (config.market) {
    const m = config.market;
    if (m.kpis?.length) sections.push(`KPIs MARCHÉ:\n${JSON.stringify(m.kpis, null, 1)}`);
    if (m.netback?.length) sections.push(`NETBACK:\n${JSON.stringify(m.netback, null, 1)}`);
    if (m.competitors?.length) sections.push(`CONCURRENTS:\n${JSON.stringify(m.competitors, null, 1)}`);
  }

  if (config.flows) {
    const f = config.flows;
    if (f.tradeRoutes?.length) sections.push(`ROUTES COMMERCIALES:\n${JSON.stringify(f.tradeRoutes, null, 1)}`);
  }

  return sections.join("\n\n");
}

export default function AiAssistantPage() {
  const { config } = useDashboardData();
  const { t, locale } = useI18n();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState("professional");
  const [jargon, setJargon] = useState("professional");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const dashboardData = serializeDashboardData(config);

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          style,
          jargon,
          dashboardData,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(err.error || `Erreur ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur de communication avec l'IA");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ ${e.message || "Erreur de communication avec l'IA"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, config, style, jargon]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isFr = useI18n().locale === "fr";

  const suggestions = isFr
    ? [
        "Quel est le stock actuel par pays ?",
        "Quels sont nos principaux clients ?",
        "Analyse le netback par marché",
        "Quels navires sont en mer ?",
        "Compare les prix DAP vs FOB",
        "Quels sont les incoterms les plus utilisés ?",
      ]
    : [
        "What is the current stock by country?",
        "Who are our main clients?",
        "Analyze netback by market",
        "Which vessels are at sea?",
        "Compare DAP vs FOB prices",
        "What are the most common incoterms?",
      ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Commodity Expert</h1>
              <p className="text-xs text-muted-foreground">
                Phosphates · Energy · Fertilizers · Supply Chain · Incoterms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessages([])}
              title={isFr ? "Effacer la conversation" : "Clear conversation"}
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              variant={showSettings ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="py-3 px-1 border-b border-border grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">{isFr ? "Style de réponse" : "Response style"}</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">{isFr ? "Concis" : "Concise"}</SelectItem>
                  <SelectItem value="professional">Standard</SelectItem>
                  <SelectItem value="detailed">{isFr ? "Détaillé" : "Detailed"}</SelectItem>
                  <SelectItem value="long">{isFr ? "Exhaustif" : "Exhaustive"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">{isFr ? "Jargon" : "Jargon level"}</label>
              <Select value={jargon} onValueChange={setJargon}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">{isFr ? "Simple / Vulgarisé" : "Simple / Layman"}</SelectItem>
                  <SelectItem value="professional">{isFr ? "Professionnel" : "Professional"}</SelectItem>
                  <SelectItem value="expert">Expert / Trading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {isFr ? "Assistant IA Commodités" : "AI Commodity Assistant"}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  {isFr
                    ? "Posez vos questions sur les phosphates, l'énergie, les fertilisants, la supply chain, la logistique ou les incoterms. J'ai accès à toutes les données de votre dashboard."
                    : "Ask questions about phosphates, energy, fertilizers, supply chain, logistics or incoterms. I have access to all your dashboard data."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors text-xs py-1.5 px-3"
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                <CardContent className="p-3">
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-li:my-0 max-w-none text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </CardContent>
              </Card>
              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4 text-foreground/70" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="bg-muted/50">
                <CardContent className="p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">{isFr ? "Analyse en cours…" : "Analyzing…"}</span>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border pt-3 pb-2">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isFr ? "Posez votre question sur les phosphates, énergie, fertilisants, supply chain..." : "Ask about phosphates, energy, fertilizers, supply chain, logistics, incoterms..."}
              className="min-h-[44px] max-h-32 resize-none text-sm"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center">
            {isFr
              ? "Spécialisé en phosphates, énergie, fertilisants, commodités, supply chain, logistique et incoterms uniquement."
              : "Specialized in phosphates, energy, fertilizers, commodities, supply chain, logistics and incoterms only."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
