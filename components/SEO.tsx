import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = 'https://fluxfunnel.fun/og-image.png',
    url = window.location.href
}) => {
    const siteTitle = "FluxFunnel - O Construtor Visual de Funis e Planejamento Estratégico";
    const finalTitle = title ? `${title} | FluxFunnel` : siteTitle;
    const finalDescription = description || "Escale seu negócio com o FluxFunnel. A plataforma definitiva de construção visual de funis e planejamento estratégico, projetada para alta performance.";
    const finalKeywords = keywords || "construtor de funis, planejamento visual, estratégia de marketing, funil de vendas, mapeamento de processos, fluxfunnel";

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={finalTitle} />
            <meta property="twitter:description" content={finalDescription} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};
