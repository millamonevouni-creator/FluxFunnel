
import React from 'react';
import { FileText, ChevronLeft } from 'lucide-react';

interface TermsOfServiceProps {
    onBack: () => void;
    lang?: 'pt' | 'en' | 'es';
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack, lang = 'pt' }) => {
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
                            <FileText className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Termos de Uso</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h1 className="text-3xl font-bold mb-6">Termos de Uso do FluxFunnel</h1>
                    <p className="text-sm text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Aceitação dos Termos</h2>
                            <p>
                                Ao acessar ou usar o FluxFunnel, você concorda em ficar vinculado a estes Termos de Uso.
                                Se você não concordar com qualquer parte dos termos, não poderá acessar o Serviço.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Licença de Uso</h2>
                            <p>
                                O FluxFunnel concede a você uma licença limitada, não exclusiva e intransferível para usar nosso software
                                estritamente de acordo com estes termos. É proibido modificar, copiar, distribuir, transmitir,
                                exibir, executar, reproduzir, publicar, licenciar, criar trabalhos derivados, transferir ou vender
                                qualquer informação ou software obtido através do Serviço.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Contas de Usuário</h2>
                            <p>
                                Ao criar uma conta conosco, você deve fornecer informações precisas, completas e atuais.
                                O não cumprimento desta obrigação constitui uma violação dos Termos, o que pode resultar no encerramento imediato da sua conta.
                                Você é responsável por proteger a senha que usa para acessar o Serviço.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Propriedade Intelectual</h2>
                            <p>
                                O Serviço e seu conteúdo original (excluindo conteúdo fornecido por usuários), recursos e funcionalidades
                                são e permanecerão de propriedade exclusiva do FluxFunnel e de seus licenciadores.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Limitação de Responsabilidade</h2>
                            <p>
                                Em nenhum caso o FluxFunnel, nem seus diretores, funcionários, parceiros ou agentes, serão responsáveis
                                por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação,
                                perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Alterações nos Termos</h2>
                            <p>
                                Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento.
                                Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência
                                antes que quaisquer novos termos entrem em vigor.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Contato</h2>
                            <p>
                                Se tiver dúvidas sobre estes Termos, entre em contato conosco pelo e-mail:
                                <a href="mailto:suporte@fluxfunnel.fun" className="text-indigo-600 hover:underline ml-1">suporte@fluxfunnel.fun</a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TermsOfService;
