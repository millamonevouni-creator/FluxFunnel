import { ArrowLeft, BookOpen, Calendar, Tag, ArrowRight } from 'lucide-react';
import { SEO } from './SEO';
import { BLOG_POSTS } from './blog/BlogData';

interface BlogProps {
    onBack: () => void;
    onNavigate: (slug: string) => void;
}

const Blog = ({ onBack, onNavigate }: BlogProps) => {
    const articles = BLOG_POSTS;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Blog FluxFunnel: Estratégias de Marketing e Funis de Vendas"
                description="Artigos, tutoriais e dicas sobre funis de vendas, marketing digital, tráfego pago e lançamentos. Aprenda a escalar seu negócio."
                keywords="blog marketing digital, dicas funil de vendas, tutorial fluxfunnel, estratégias de lançamento, marketing de conteúdo"
                url="https://fluxfunnel.fun/blog"
            />

            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            aria-label="Voltar"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <BookOpen className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Blog</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
                        Conhecimento para Escalar
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        As melhores estratégias de funis e marketing digital, direto ao ponto.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <article key={article.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                <BookOpen className="text-indigo-300 dark:text-indigo-700 opacity-50" size={48} />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wider">
                                    <Tag size={12} /> {article.category}
                                </div>
                                <h2 onClick={() => onNavigate(article.slug)} className="text-xl font-bold mb-3 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer">
                                    {article.title}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-1">
                                    {article.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} /> {article.date}
                                    </div>
                                    <div>{article.readTime} de leitura</div>
                                </div>
                                {/* In a real app, this would be a Link to /blog/[slug] */}
                                <button onClick={() => onNavigate(article.slug)} className="mt-4 w-full py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                                    Ler Artigo <ArrowRight size={16} />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Quer receber estratégias exclusivas?</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Entre para nossa lista VIP e receba conteúdos em primeira mão.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                        <input type="email" placeholder="Seu melhor e-mail" className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" />
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap">
                            Inscrever Grátis
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Blog;
