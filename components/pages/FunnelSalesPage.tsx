import React from 'react';
import { ArrowLeft, ArrowRight, Target, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { SEO } from '../SEO';

interface Props {
    onBack: () => void;
    onGetStarted: () => void;
}

const FunnelSalesPage: React.FC<Props> = ({ onBack, onGetStarted }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Funil de Vendas: O que é, Como Funciona e Como Fazer | FluxFunnel"
                description="Aprenda tudo sobre Funil de Vendas. Descubra as etapas, evite erros comuns e veja como visualizar sua estratégia na prática com o FluxFunnel."
                keywords="funil de vendas, o que é funil de vendas, etapas do funil, topo de funil, meio de funil, fundo de funil, jornada do cliente, estratégia de vendas"
                url="https://www.fluxfunnel.fun/funil-de-vendas"
            />

            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={onBack} aria-label="Voltar" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                        Criar meu Funil Grátis
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <article className="prose dark:prose-invert lg:prose-xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight text-slate-900 dark:text-white">Funil de Vendas: O Guia Definitivo para Escalar seus Resultados</h1>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-10">
                        <p className="text-lg font-medium text-indigo-900 dark:text-indigo-200 m-0">
                            <strong>Resumo:</strong> O funil de vendas é o modelo estratégico que mapeia a jornada do seu cliente desde o primeiro contato até o fechamento da compra. Entendê-lo é crucial para não perder dinheiro com tráfego desqualificado.
                        </p>
                    </div>

                    <h2>O que é um Funil de Vendas?</h2>
                    <p>
                        Imagine um funil real. No topo, ele é largo e cabe muita coisa. No fundo, é estreito e só passa o essencial.
                        No marketing, é a mesma lógica:
                    </p>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2"><Target className="text-indigo-600 mt-1 shrink-0" size={20} /> <strong>Topo (Atração):</strong> Muita gente chega (visitantes).</li>
                        <li className="flex items-start gap-2"><TrendingUp className="text-indigo-600 mt-1 shrink-0" size={20} /> <strong>Meio (Consideração):</strong> Alguns se interessam (leads).</li>
                        <li className="flex items-start gap-2"><Zap className="text-indigo-600 mt-1 shrink-0" size={20} /> <strong>Fundo (Decisão):</strong> Poucos compram (clientes).</li>
                    </ul>

                    <h2 className="mt-12">As 3 Etapas Indispensáveis</h2>

                    <h3>1. Topo de Funil (ToFu) - Consciência</h3>
                    <p>Aqui o cliente nem sabe que tem um problema, ou acabou de descobrir. Seu objetivo não é vender, é <strong>educar</strong>. Conteúdos como blog posts, vídeos e redes sociais funcionam bem aqui.</p>

                    <h3>2. Meio de Funil (MoFu) - Consideração</h3>
                    <p>O cliente já sabe que tem um problema e está buscando soluções. Ele te deu o e-mail (virou Lead). Aqui você nutre com e-books, webinars e provas sociais.</p>

                    <h3>3. Fundo de Funil (BoFu) - Decisão</h3>
                    <p>Hora da verdade. O lead está pronto para comprar. Ofertas diretas, demonstrações e cupons de desconto são a chave para o fechamento.</p>

                    <h2 className="mt-12">Erros Comuns que Matam seu Funil</h2>
                    <div className="grid gap-4 not-prose">
                        <div className="flex gap-4 p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-lg">
                            <AlertTriangle className="text-red-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-red-900 dark:text-red-200">Tentar vender no primeiro encontro</h4>
                                <p className="text-sm text-red-800 dark:text-red-300">Não ofereça casamento para quem você acabou de conhecer. Não tente vender seu produto mais caro para um visitante frio.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-lg">
                            <AlertTriangle className="text-red-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-red-900 dark:text-red-200">Não medir as conversões</h4>
                                <p className="text-sm text-red-800 dark:text-red-300">Se você não sabe onde os leads estão travando, você está queimando dinheiro. É por isso que visualizar o funil é essencial.</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="mt-12">Como Visualizar seu Funil na Prática</h2>
                    <p>
                        A maior dificuldade de gestores e empresários é que o funil muitas vezes fica abstrato, apenas em planilhas ou na cabeça.
                        O <strong>FluxFunnel</strong> resolve isso permitindo que você desenhe visualmente cada etapa.
                    </p>

                    <div className="my-8 p-8 bg-slate-900 rounded-2xl text-white not-prose text-center">
                        <h3 className="text-2xl font-bold mb-4">Pare de imaginar e comece a ver</h3>
                        <p className="mb-6 text-slate-300">Crie seu primeiro mapa de funil agora mesmo. É gratuito e não precisa de cartão de crédito.</p>
                        <button onClick={onGetStarted} className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto">
                            Mapear meu Funil Agora <ArrowRight size={20} />
                        </button>
                    </div>

                </article>
            </main>
        </div>
    );
};

export default FunnelSalesPage;
