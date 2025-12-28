
import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
    lang?: 'pt' | 'en' | 'es';
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, lang = 'pt' }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            aria-label="Voltar"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Shield className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Política de Privacidade</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h1 className="text-3xl font-bold mb-6">Política de Privacidade do FluxFunnel</h1>
                    <p className="text-sm text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Introdução</h2>
                            <p>
                                Bem-vindo ao FluxFunnel. Comprometemo-nos a proteger a sua privacidade e os seus dados pessoais.
                                Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações
                                quando você visita nosso site fluxfunnel.fun ou utiliza nosso aplicativo.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Coleta de Dados</h2>
                            <p>
                                Coletamos informações que você nos fornece diretamente ao se registrar, como seu nome, endereço de e-mail
                                e imagem de perfil (via Google Auth ou upload). Também podemos coletar dados de uso e preferências
                                para melhorar sua experiência na plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Uso das Informações</h2>
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Para fornecer e manter nosso Serviço;</li>
                                <li>Para notificá-lo sobre alterações em nosso Serviço;</li>
                                <li>Para permitir que você participe de recursos interativos;</li>
                                <li>Para fornecer suporte ao cliente;</li>
                                <li>Para monitorar o uso do Serviço e detectar problemas técnicos.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Proteção de Dados</h2>
                            <p>
                                A segurança dos seus dados é importante para nós. Utilizamos práticas de segurança padrão da indústria
                                e serviços confiáveis (como Google Cloud e Supabase) para proteger suas informações contra acesso não autorizado.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Compartilhamento de Dados</h2>
                            <p>
                                Não vendemos suas informações pessoais. Podemos compartilhar dados com prestadores de serviços terceirizados
                                apenas na medida necessária para operar nosso Serviço (por exemplo, processamento de pagamentos ou hospedagem).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Seus Direitos</h2>
                            <p>
                                Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento.
                                Você pode fazer isso diretamente nas configurações da sua conta ou entrando em contato conosco.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Contato</h2>
                            <p>
                                Se tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo e-mail:
                                <a href="mailto:suporte@fluxfunnel.fun" className="text-indigo-600 hover:underline ml-1">suporte@fluxfunnel.fun</a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
