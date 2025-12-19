
import { GoogleGenAI } from "@google/genai";
import { Node, Edge } from 'reactflow';

export const generateFunnelInsights = async (
  nodes: Node[], 
  edges: Edge[], 
  userQuery: string
): Promise<string> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const funnelContext = JSON.stringify({
    nodes: nodes.map(n => ({ 
      id: n.id, 
      label: n.data.label, 
      type: n.data.type,
    })),
    edges: edges.map(e => ({ 
      source: e.source, 
      target: e.target, 
      label: e.label 
    }))
  }, null, 2);

  const systemInstruction = `
    Você é a FluxFunnel AI, uma especialista em arquitetura operacional e estratégia de vendas.
    
    O usuário está desenhando um fluxograma visual para sua empresa.
    Você tem acesso à estrutura atual do diagrama em JSON.
    
    Seu objetivo é:
    1. Analisar o fluxo lógico (Tráfego -> Captação -> Nutrição -> Vendas -> Entrega).
    2. Identificar "gargalos" estruturais (ex: "Você tem um Checkout mas não tem sequência de recuperação de boleto").
    3. Sugerir as melhores conexões entre equipes operacionais e automações.
    
    Mantenha as respostas curtas, em Português do Brasil, altamente acionáveis e formatadas em Markdown.
    Use o contexto técnico para dar insights que realmente mudem o jogo do usuário.
  `;

  try {
    // Upgrading to gemini-3-pro-preview for complex reasoning tasks like funnel auditing
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Blueprint Context: ${funnelContext}\n\nUser Question: ${userQuery}`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 2000 } // Adding some thinking budget for deeper analysis
      },
    });

    return response.text || "Não foi possível gerar um insight no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao analisar seu fluxograma. Verifique sua conexão ou cota de API.";
  }
};
