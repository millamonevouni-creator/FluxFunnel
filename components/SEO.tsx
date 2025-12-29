import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    structuredData?: any;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = 'https://www.fluxfunnel.fun/og-image.png',
    url,
    structuredData
}) => {
    const siteTitle = "FluxFunnel";
    // Enforce the preferred domain to avoid "Duplicate without user-selected canonical" issues
    const BASE_URL = 'https://www.fluxfunnel.fun';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Use provided URL or construct canonical URL (stripping query params and ensuring correct domain)
    // This resolves the conflict between https://fluxfunnel.fun and https://www.fluxfunnel.fun
    const finalUrl = url ? url : `${BASE_URL}${currentPath === '/' ? '' : currentPath}`;

    const finalTitle = title ? `${title} | FluxFunnel` : siteTitle;
    const finalDescription = description || "Escale seu negócio com o FluxFunnel. A plataforma definitiva de construção visual de funis e planejamento estratégico, projetada para alta performance.";
    const finalKeywords = keywords || "construtor de funis, planejamento visual, estratégia de marketing, funil de vendas, mapeamento de processos, fluxfunnel";

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords} />
            <link rel="canonical" href={finalUrl || BASE_URL} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={finalUrl} />
            <meta property="twitter:title" content={finalTitle} />
            <meta property="twitter:description" content={finalDescription} />
            <meta property="twitter:image" content={image} />

            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(Array.isArray(structuredData) ? { "@context": "https://schema.org", "@graph": structuredData } : structuredData)}
                </script>
            )}
        </Helmet>
    );
};
