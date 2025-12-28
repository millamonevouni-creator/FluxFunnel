
import React from 'react';
import { ArrowLeft, Cookie } from 'lucide-react';

interface CookiesPolicyProps {
    onBack: () => void;
}

const CookiesPolicy = ({ onBack }: CookiesPolicyProps) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={onBack}
                            aria-label="Voltar"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} className="text-slate-600" />
                        </button>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Política de Cookies</h1>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Esta Política de Cookies explica o que são cookies, como os utilizamos e as opções que você tem para controlá-los.
                    </p>
                </div>

                <div className="space-y-12 bg-white p-10 rounded-3xl shadow-sm border border-slate-200">

                    <section>
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                            <Cookie className="text-indigo-600" size={28} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">1. O que são Cookies?</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Cookies são pequenos arquivos de texto que são armazenados no seu computador ou dispositivo móvel quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem, ou funcionarem de maneira mais eficiente, bem como para fornecer informações aos proprietários do site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">2. Como Utilizamos os Cookies</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Utilizamos cookies para diversos fins, incluindo:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li><strong className="text-slate-800">Cookies Essenciais:</strong> Necessários para o funcionamento do site, como autenticação e segurança.</li>
                            <li><strong className="text-slate-800">Cookies de Desempenho:</strong> Coletam informações sobre como os visitantes usam o site, para melhorarmos a performance.</li>
                            <li><strong className="text-slate-800">Cookies de Funcionalidade:</strong> Permitem que o site lembre suas escolhas (como nome de usuário ou idioma).</li>
                            <li><strong className="text-slate-800">Cookies de Publicidade:</strong> Usados para fornecer anúncios mais relevantes para você e seus interesses.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">3. Gerenciamento de Cookies</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Você pode controlar e/ou excluir cookies como desejar. Você pode apagar todos os cookies que já estão no seu computador e pode configurar a maioria dos navegadores para impedir que eles sejam colocados. Se você fizer isso, no entanto, talvez tenha que ajustar manualmente algumas preferências toda vez que visitar um site e alguns serviços e funcionalidades podem não funcionar.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">4. Contato</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco pelo e-mail: <a href="mailto:support@fluxfunnel.fun" className="text-indigo-600 hover:underline decoration-2 underline-offset-2">support@fluxfunnel.fun</a>
                        </p>
                    </section>
                </div>
                <div className="mt-12 text-center text-slate-500 text-sm">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
        </div>
    );
};

export default CookiesPolicy;
