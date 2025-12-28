import React, { useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Tag, Share2, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { SEO } from '../SEO';
import { BLOG_POSTS, BlogPost as BlogPostType } from './BlogData';

interface BlogPostProps {
    onBack: () => void;
    postSlug: string;
    onNavigate?: (path: string) => void;
    onGetStarted?: () => void;
}

const BlogPost = ({ onBack, postSlug, onNavigate, onGetStarted }: BlogPostProps) => {
    const post = BLOG_POSTS.find(p => p.slug === postSlug);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [postSlug]);



    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Artigo não encontrado</h2>
                <button onClick={onBack} className="text-indigo-600 hover:underline">Voltar para o Blog</button>
            </div>
        );
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShare = (platform: string) => {
        const text = `Confira este artigo: ${post.title}`;
        let url = '';

        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                alert('Link copiado!');
                return;
        }

        if (url) window.open(url, '_blank', 'width=600,height=400');
    };

    // Simple markdown-like parser for the content
    // In a real app, use a library like react-markdown
    const renderContent = (content: string) => {
        const parseBold = (text: string, key: number) => {
            const parts = text.split(/(\*\*.*?\*\*)/g);
            return (
                <span key={key}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </span>
            );
        };

        const parseLine = (text: string, lineIndex: number) => {
            const parts = text.split(/(\[.*?\]\(.*?\))/g);
            return (
                <p key={lineIndex} className="mb-4 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    {parts.map((part, i) => {
                        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
                        if (linkMatch) {
                            const [_, label, url] = linkMatch;
                            return (
                                <a
                                    key={i}
                                    href={url}
                                    onClick={(e) => {
                                        if (url === '/auth' && onGetStarted) {
                                            e.preventDefault();
                                            onGetStarted();
                                        } else if (url.startsWith('/') && onNavigate) {
                                            e.preventDefault();
                                            onNavigate(url);
                                        }
                                    }}
                                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold hover:underline transition-colors"
                                >
                                    {label}
                                </a>
                            );
                        }
                        return parseBold(part, i);
                    })}
                </p>
            );
        };

        return content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) return <h1 key={index} className="text-3xl md:text-4xl font-extrabold mt-8 mb-6 text-slate-900 dark:text-white">{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={index} className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-slate-800 dark:text-slate-100">{line.replace('## ', '')}</h2>;
            if (line.startsWith('### ')) return <h3 key={index} className="text-xl md:text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200">{line.replace('### ', '')}</h3>;
            if (line.startsWith('* ')) return <li key={index} className="ml-6 list-disc mb-2 text-slate-700 dark:text-slate-300">{parseBold(line.replace('* ', ''), index)}</li>;
            if (line.startsWith('1. ')) return <li key={index} className="ml-6 list-decimal mb-2 text-slate-700 dark:text-slate-300">{parseBold(line.replace('1. ', ''), index)}</li>;
            if (line.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 py-2 my-6 bg-slate-50 dark:bg-slate-800/50 italic text-slate-700 dark:text-slate-300 rounded-r-lg">{parseBold(line.replace('> ', ''), index)}</blockquote>;
            if (line.trim() === '') return <br key={index} />;

            return parseLine(line, index);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20">
            <SEO
                title={`${post.title} | Blog FluxFunnel`}
                description={post.description}
                keywords={post.keywords}
                url={`https://fluxfunnel.fun/blog/${post.slug}`}
                image={`https://fluxfunnel.fun/og-blog-${post.id}.jpg`} // Placeholder
            />

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-0" id="scroll-progress"></div>
            </div>

            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-all">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Voltar para o Blog</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button onClick={() => handleShare('copy')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors" title="Copiar Link"><Copy size={18} /></button>
                        <button onClick={() => handleShare('twitter')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full text-slate-500 hover:text-blue-400 transition-colors" title="Twitter"><Twitter size={18} /></button>
                        <button onClick={() => handleShare('linkedin')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full text-slate-500 hover:text-blue-700 transition-colors" title="LinkedIn"><Linkedin size={18} /></button>
                    </div>
                </div>
            </header>

            <article className="max-w-3xl mx-auto px-6 pt-12">
                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <Tag size={12} /> {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-6 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
                        <span className="flex items-center gap-2"><Clock size={16} /> {post.readTime} de leitura</span>
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg">
                    {renderContent(post.content)}
                </div>

                {/* Author / CTA Footer */}
                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Gostou deste artigo?</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Coloque essas estratégias em prática agora mesmo. Crie seu primeiro funil visual gratuitamente no FluxFunnel.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30"
                        >
                            Começar Grátis
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
