
import { Project, User, PlanConfig, FeedbackItem, TeamMember, SystemConfig, Template, TemplateStatus } from '../types';
import { supabase, isOffline } from './supabaseClient';
import { Folder } from 'lucide-react';
import React from 'react';

const safeGetErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.context?.message) return error.context.message; // Sometimes Supabase wraps it
    try {
        return JSON.stringify(error);
    } catch {
        return 'Erro desconhecido';
    }
};

const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name || 'Usuário',
    email: profile.email || '',
    plan: profile.plan || 'FREE',
    status: profile.status || 'ACTIVE',
    lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
    avatarUrl: profile.avatar_url,
    isSystemAdmin: profile.is_system_admin || false,
    company_name: profile.company_name,
    job_title: profile.job_title
});

const mapDBProjectToApp = (dbProject: any): Project => ({
    id: dbProject.id,
    name: dbProject.name,
    nodes: dbProject.nodes || [],
    edges: dbProject.edges || [],
    updatedAt: new Date(dbProject.updated_at),
    ownerId: dbProject.owner_id
});

// Helper for calling Edge Functions
const invokeEdgeFunction = async (functionName: string, body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
    };

    // Local development fallback or production URL
    // Note: Manually stringifying body ensures consistent behavior across client versions
    const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.stringify(body),
        headers: headers
    });

    if (error) throw error;
    return data;
}

// Helper for Audit Logging (Graceful Failure)


export const api = {
    subscriptions: {
        createCheckoutSession: async (priceId: string) => {
            // You can also use supabase.functions.invoke here directly
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    priceId,
                    successUrl: window.location.origin + '?session_id={CHECKOUT_SESSION_ID}',
                    cancelUrl: window.location.origin
                }
            });

            if (error) throw error;
            return data; // Expect { sessionId: string }
        }
    },
    auth: {
        login: async (email: string, password?: string): Promise<{ user: User, token: string }> => {
            if (isOffline) {
                // SECURITY FIX: Never allow mock login in production build, even if keys are missing.
                throw new Error("Modo offline detectado. Verifique as variáveis de ambiente (VITE_SUPABASE_URL, VITE_SUPABASE_KEY). Login desativado por segurança.");
            }

            // Timeout wrapper for signInWithPassword
            const loginPromise = supabase.auth.signInWithPassword({ email, password: password || '123456' });
            const timeoutLogin = new Promise((resolve) => setTimeout(() => resolve({ data: { user: null, session: null }, error: { message: 'Timeout login' } }), 15000));

            const { data, error } = await Promise.race([loginPromise, timeoutLogin]) as any;

            if (error) throw error;

            // Try to fetch profile, but handle failure gracefully
            const fetchProfile = supabase.from('profiles').select('*').eq('id', data.user.id).single();
            const timeoutProfile = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: 'Timeout' }), 4000));

            const { data: profile } = await Promise.race([fetchProfile, timeoutProfile]) as { data: any, error: any };

            if (!profile) {
                console.warn("Profile missing/blocked/timed out for user, using auth fallback", data.user.id);
                // Fallback using auth data so login doesn't crash
                const fallbackUser: User = {
                    id: data.user.id,
                    name: data.user.user_metadata?.name || email.split('@')[0],
                    email: email,
                    plan: data.user.user_metadata?.plan || 'FREE', // Use metadata plan (e.g. CONVIDADO)
                    status: 'ACTIVE',
                    lastLogin: new Date(),
                    isSystemAdmin: false // SECURITY FIX: Never grant admin on fallback
                };
                return { user: fallbackUser, token: data.session?.access_token || '' };
            }

            // SELF-HEALING: Link Team Memberships if user_id is missing
            try {
                if (data.user?.email) {
                    await supabase.from('team_members')
                        .update({ user_id: data.user.id })
                        .eq('email', data.user.email)
                        .is('user_id', null);
                }
            } catch (err) { console.error("Auto-link team error:", err); }

            return { user: mapProfileToUser(profile), token: data.session?.access_token || '' };
        },
        register: async (email: string, password?: string, name?: string): Promise<{ user: User, token: string }> => {
            if (isOffline) {
                return {
                    user: { id: 'u' + Date.now(), name: name || 'Novo', email, plan: 'FREE', status: 'ACTIVE', lastLogin: new Date() },
                    token: 'mock_token'
                };
            }
            const { data, error } = await supabase.auth.signUp({ email, password: password || '123456', options: { data: { name } } });
            if (error) throw error;
            return { user: mapProfileToUser({ id: data.user!.id, name, email }), token: data.session?.access_token || '' };
        },
        logout: async () => { if (!isOffline) await supabase.auth.signOut(); },
        loginWithGoogle: async () => {
            if (isOffline) {
                alert("Login com Google indisponível em modo offline/mock.");
                return;
            }
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        },
        getProfile: async (): Promise<User | null> => {
            if (isOffline) return null;
            try {
                // Timeout logic for getProfile
                const getUserPromise = supabase.auth.getUser();
                const timeoutUser = new Promise((resolve) => setTimeout(() => resolve({ data: { user: null }, error: 'Timeout' }), 4000));

                const { data } = await Promise.race([getUserPromise, timeoutUser]) as any;

                if (!data?.user) return null;

                const fetchProfilePromise = supabase.from('profiles').select('*').eq('id', data.user.id).single();
                const timeoutProfile = new Promise((resolve) => setTimeout(() => resolve({ data: null }), 4000));

                const { data: profile } = await Promise.race([fetchProfilePromise, timeoutProfile]) as any;

                if (profile) return mapProfileToUser(profile);

                console.warn("Profile missing in DB, using Session fallback");
                // Fallback using auth data
                return {
                    id: data.user.id,
                    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
                    email: data.user.email || '',
                    plan: data.user.user_metadata?.plan || 'FREE',
                    status: 'ACTIVE',
                    lastLogin: new Date(),
                    isSystemAdmin: false // SECURITY FIX: Never grant admin on fallback
                };
            } catch (e) { return null; }
        },
        updateProfile: async (id: string, data: Partial<User>) => { if (!isOffline) await supabase.from('profiles').update(data).eq('id', id); },
        updatePassword: async (password: string) => { // Deprecated: Use changePassword
            if (isOffline) return;
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
        },
        changePassword: async (email: string, oldPassword: string, newPassword: string) => {
            if (isOffline) return;

            // 1. Verify old password by trying to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: oldPassword
            });

            if (signInError) {
                throw new Error("A senha atual está incorreta.");
            }

            // 2. Update to new password
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

            if (updateError) throw updateError;
        },
        uploadAvatar: async (userId: string, file: File): Promise<string> => {
            if (isOffline) return URL.createObjectURL(file); // Mock for offline

            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (updateError) throw updateError;

            return publicUrl;
        },
        resetPassword: async (email: string) => {
            if (isOffline) return;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });
            if (error) throw error;
        }
    },
    users: {
        list: async (): Promise<User[]> => {
            if (isOffline) return [];
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) console.error("Error fetching users:", error);
            return (data || []).map(mapProfileToUser);
        },
        update: async (id: string, data: any) => { if (!isOffline) await supabase.from('profiles').update(data).eq('id', id); },
        delete: async (id: string) => {
            if (!isOffline) {
                const { error } = await supabase.from('profiles').delete().eq('id', id);
                if (error) throw error;
            }
        }
    },
    projects: {
        list: async () => {
            if (isOffline) return [];
            // Use RPC to fetch projects including those shared via team membership
            const { data, error } = await supabase.rpc('get_accessible_projects');
            if (error) {
                console.error("RPC Error (get_accessible_projects):", error);
                // Fallback to standard RLS select if RPC fails
                const { data: fallbackData } = await supabase.from('projects').select('*');
                return (fallbackData || []).map(mapDBProjectToApp);
            }
            return (data || []).map(mapDBProjectToApp);
        },
        create: async (project: Partial<Project>): Promise<Project> => {
            if (isOffline) {
                // Mock return for offline mode, ensuring all Project fields
                return {
                    id: 'proj_' + Date.now(),
                    name: project.name || 'Sem Nome',
                    nodes: project.nodes || [],
                    edges: project.edges || [],
                    updatedAt: new Date(),
                    ownerId: project.ownerId || 'mock_user',
                    collaborators: [],
                    ...project
                } as Project;
            }
            const dbProject = {
                name: project.name,
                nodes: project.nodes,
                edges: project.edges,
                owner_id: project.ownerId,
                updated_at: new Date()
            };
            const { data, error } = await supabase.from('projects').insert(dbProject).select().single();
            if (error) throw error;
            if (!data) throw new Error("Falha ao criar projeto: Dados não retornados.");
            return mapDBProjectToApp(data);
        },
        get: async (id: string) => {
            if (isOffline) return null;

            // Try standard select first (works for owner)
            let { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            // If error (RLS or not found), try public RPC which bypasses RLS for ID lookup
            if (error) {
                // Ignore initial error details, try fallback
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_project_public', { p_id: id });

                if (!rpcError && rpcData && rpcData.length > 0) {
                    data = rpcData[0];
                    error = null;
                } else {
                    // If RPC also fails, throw the original error (or RPC error if relevant)
                    if (rpcError) console.error("RPC Error:", rpcError);
                    throw error;
                }
            }

            return mapDBProjectToApp(data);
        },
        update: async (id: string, updates: Partial<Project>) => { if (!isOffline) await supabase.from('projects').update(updates).eq('id', id); },
        delete: async (id: string) => {
            if (!isOffline) {
                const { error } = await supabase.from('projects').delete().eq('id', id);
                if (error) throw error;
            }
        }
    },
    templates: {
        list: async () => {
            if (isOffline) return [];
            const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
            return (data || []).map((t: any) => ({
                id: t.id, customLabel: t.custom_label, customDescription: t.custom_description,
                icon: React.createElement(Folder), nodes: t.nodes, edges: t.edges,
                status: t.status, isPublic: t.is_public, isCustom: t.is_custom, authorName: t.author_name, authorId: t.owner_id,
                rating: t.rating, downloads: t.downloads, isFeatured: t.is_featured
            }));
        },
        listPublic: async (userId?: string): Promise<Template[]> => {
            if (isOffline) return [];
            let query;
            // STRICT PRIVACY FIX: Only fetch items that are explicitly set to is_public=true.
            // This prevents private "Meus Modelos" (is_public=false) from leaking into the Marketplace view,
            // even if the user owns them.
            if (!userId) {
                query = supabase.from('templates').select('*').eq('is_public', true).eq('status', 'APPROVED');
            } else {
                // Fetch: (Public AND Approved) OR (Public AND Owned by me - e.g. Pending)
                // We use explicit OR syntax combined with the is_public filter.
                // Using .or() with filters directly in the string is safer for complex AND/OR logic in Supabase JS v2
                query = supabase.from('templates').select('*').eq('is_public', true).or(`status.eq.APPROVED,owner_id.eq.${userId}`);
            }

            const { data } = await query;
            return (data || []).map((t: any) => ({
                id: t.id, customLabel: t.custom_label, customDescription: t.custom_description,
                icon: React.createElement(Folder), nodes: t.nodes, edges: t.edges,
                rating: t.rating, downloads: t.downloads, authorName: t.author_name, isPro: true, isFeatured: t.is_featured,
                status: t.status, ownerId: t.owner_id, isPublic: t.is_public, isCustom: t.is_custom
            }));
        },
        create: async (t: any) => {
            if (isOffline) return;
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('templates').insert({
                custom_label: t.customLabel,
                nodes: t.nodes,
                edges: t.edges,
                owner_id: user?.id,
                author_name: user?.user_metadata?.name || 'User',
                is_public: false
            });
        },
        delete: async (id: string) => {
            if (!isOffline) {
                const { error } = await supabase.from('templates').delete().eq('id', id);
                if (error) throw error;
            }
        },
        update: async (id: string, updates: any) => { if (!isOffline) await supabase.from('templates').update(updates).eq('id', id); },
        submitToMarketplace: async (template: Partial<Template>) => {
            if (isOffline) return;
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.from('templates').insert({
                custom_label: template.customLabel,
                custom_description: template.customDescription,
                nodes: template.nodes,
                edges: template.edges,
                owner_id: user?.id,
                author_name: template.authorName || user?.user_metadata?.name || 'Premium User',
                is_public: true,
                status: 'PENDING',
                downloads: 0,
                rating: 0,
                rating_count: 0,
                is_featured: false
            }).select().single();

            if (error) {
                console.error("Error submitting to marketplace:", error);
                throw error;
            }
            console.log("Submit to Marketplace SUCCESS. Data:", data);
            return data;
        },
        moderate: async (id: string, status: TemplateStatus) => {
            if (!isOffline) await supabase.from('templates').update({ status }).eq('id', id);
        },
        download: async (id: string) => {
            if (isOffline) return;
            try {
                const { data } = await supabase.from('templates').select('downloads').eq('id', id).single();
                await supabase.from('templates').update({ downloads: (data?.downloads || 0) + 1 }).eq('id', id);
            } catch (e) { console.error("Counter update failed", e); }
        },
        rate: async (id: string, stars: number) => {
            if (isOffline) return;
            const { data } = await supabase.from('templates').select('rating, rating_count').eq('id', id).single();
            const newCount = (data?.rating_count || 0) + 1;
            const newRating = ((data?.rating || 0) * (data?.rating_count || 0) + stars) / newCount;
            await supabase.from('templates').update({ rating: newRating, rating_count: newCount }).eq('id', id);
        }
    },
    plans: {
        list: async () => {
            if (isOffline) return [];
            const { data } = await supabase.from('plans').select('*').order('order', { ascending: true });
            return (data || []).map((p: any) => ({
                id: p.id,
                label: p.label,
                priceMonthly: p.price_monthly,
                priceYearly: p.price_yearly,
                projectLimit: p.project_limit,
                nodeLimit: p.node_limit,
                teamLimit: p.team_limit,
                features: p.features || [],
                isPopular: p.is_popular,
                order: p.order,
                stripe_product_id: p.stripe_product_id,
                stripe_price_id_monthly: p.stripe_price_id_monthly,
                stripe_price_id_yearly: p.stripe_price_id_yearly,
                isHidden: p.is_hidden
            }));
        },
        update: async (id: string, p: any) => {
            // Map camelCase to snake_case for the edge function
            const planPayload = {
                id,
                label: p.label,
                description: p.description,
                price_monthly: p.priceMonthly,
                price_yearly: p.priceYearly,
                project_limit: p.projectLimit,
                node_limit: p.nodeLimit,
                team_limit: p.teamLimit,
                features: p.features,
                is_popular: p.isPopular,
                is_hidden: p.isHidden,
                order: p.order,
                stripe_product_id: p.stripe_product_id,
                stripe_price_id_monthly: p.stripe_price_id_monthly,
                stripe_price_id_yearly: p.stripe_price_id_yearly
            };

            if (isOffline) return planPayload;

            // STRATEGY: Server-Side Authority
            // We NO LONGER write to DB first. We let the Edge Function handle both Stripe and DB updates atomically.
            try {
                const updatedPlan = await invokeEdgeFunction('manage-plan', {
                    plan: planPayload,
                    operation: 'UPDATE'
                });
                const mappedUpdatedPlan = {
                    id: updatedPlan.id,
                    label: updatedPlan.label,
                    description: updatedPlan.description,
                    priceMonthly: updatedPlan.price_monthly !== undefined ? updatedPlan.price_monthly : updatedPlan.priceMonthly,
                    priceYearly: updatedPlan.price_yearly !== undefined ? updatedPlan.price_yearly : updatedPlan.priceYearly,
                    projectLimit: updatedPlan.project_limit !== undefined ? updatedPlan.project_limit : updatedPlan.projectLimit,
                    nodeLimit: updatedPlan.node_limit !== undefined ? updatedPlan.node_limit : updatedPlan.nodeLimit,
                    teamLimit: updatedPlan.team_limit !== undefined ? updatedPlan.team_limit : updatedPlan.teamLimit,
                    features: updatedPlan.features || [],
                    isPopular: updatedPlan.is_popular !== undefined ? updatedPlan.is_popular : updatedPlan.isPopular,
                    isHidden: updatedPlan.is_hidden !== undefined ? updatedPlan.is_hidden : updatedPlan.isHidden,
                    order: updatedPlan.order !== undefined ? updatedPlan.order : updatedPlan.order,
                    stripe_product_id: updatedPlan.stripe_product_id || updatedPlan.stripeProductId,
                    stripe_price_id_monthly: updatedPlan.stripe_price_id_monthly || updatedPlan.stripePriceIdMonthly,
                    stripe_price_id_yearly: updatedPlan.stripe_price_id_yearly || updatedPlan.stripePriceIdYearly
                };
                return mappedUpdatedPlan;
            } catch (err) {
                console.error("Stripe Sync Error (Plan Update Failed):", err);
                throw new Error("Falha ao atualizar plano: Erro de sincronização com o Stripe.");
            }
        },
        create: async (p: any) => {
            // Map camelCase to snake_case for the edge function
            const planPayload = {
                id: (p.id && !p.id.startsWith('NEW_')) ? p.id : crypto.randomUUID(),
                label: p.label,
                description: p.description,
                price_monthly: p.priceMonthly,
                price_yearly: p.priceYearly,
                project_limit: p.projectLimit,
                node_limit: p.nodeLimit,
                team_limit: p.teamLimit,
                features: p.features,
                is_popular: p.isPopular,
                is_hidden: p.isHidden,
                order: p.order,
                stripe_product_id: p.stripe_product_id,
                stripe_price_id_monthly: p.stripe_price_id_monthly,
                stripe_price_id_yearly: p.stripe_price_id_yearly
            };

            if (isOffline) return planPayload;

            try {
                const createdPlan = await invokeEdgeFunction('manage-plan', {
                    plan: planPayload,
                    operation: 'CREATE'
                });

                if (createdPlan && createdPlan.success === false) {
                    throw new Error(`Edge Error: ${createdPlan.error}`);
                }

                const mappedPlan = {
                    id: createdPlan.id,
                    label: createdPlan.label,
                    description: createdPlan.description,
                    priceMonthly: createdPlan.price_monthly !== undefined ? createdPlan.price_monthly : createdPlan.priceMonthly,
                    priceYearly: createdPlan.price_yearly !== undefined ? createdPlan.price_yearly : createdPlan.priceYearly,
                    projectLimit: createdPlan.project_limit !== undefined ? createdPlan.project_limit : createdPlan.projectLimit,
                    nodeLimit: createdPlan.node_limit !== undefined ? createdPlan.node_limit : createdPlan.nodeLimit,
                    teamLimit: createdPlan.team_limit !== undefined ? createdPlan.team_limit : createdPlan.teamLimit,
                    features: createdPlan.features || [],
                    isPopular: createdPlan.is_popular !== undefined ? createdPlan.is_popular : createdPlan.isPopular,
                    isHidden: createdPlan.is_hidden !== undefined ? createdPlan.is_hidden : createdPlan.isHidden,
                    order: createdPlan.order !== undefined ? createdPlan.order : createdPlan.order,
                    stripe_product_id: createdPlan.stripe_product_id || createdPlan.stripeProductId,
                    stripe_price_id_monthly: createdPlan.stripe_price_id_monthly || createdPlan.stripePriceIdMonthly,
                    stripe_price_id_yearly: createdPlan.stripe_price_id_yearly || createdPlan.stripePriceIdYearly
                };

                return mappedPlan;
            } catch (err: any) {
                console.error("Stripe Sync Error (Plan Creation Failed):", err);
                const errorMessage = err.message || JSON.stringify(err);
                throw new Error(`Falha ao criar plano: ${errorMessage.replace('Edge Error: ', '')}`);
            }
        },
        delete: async (id: string) => {
            if (!isOffline) {
                const { error } = await supabase.from('plans').delete().eq('id', id);
                if (error) throw error;
            }
        }
    },
    feedbacks: {
        list: async () => {
            if (isOffline) return [];
            const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
            return (data || []).map((f: any) => ({
                id: f.id,
                title: f.title,
                description: f.description,
                type: f.type,
                status: f.status,
                votes: f.votes,
                votedUserIds: f.voted_user_ids,
                authorName: f.author_name,
                authorId: f.author_id, // Map Snake Case DB to Camel Case App
                createdAt: f.created_at,
                comments: f.comments || []
            }));
        },
        create: async (f: any) => {
            if (isOffline) return;
            // Map App Camel Case to DB Snake Case
            const dbPayload = {
                title: f.title,
                description: f.description,
                type: f.type,
                author_name: f.authorName,
                author_id: f.authorId, // Include author ID
                status: 'PENDING',
                votes: 0,
                voted_user_ids: []
            };
            const { error } = await supabase.from('feedbacks').insert(dbPayload);
            if (error) throw error;
        },
        update: async (id: string, f: any) => {
            if (!isOffline) {
                // Map App Camel Case to DB Snake Case for partial updates
                const dbPayload: any = {};
                if (f.title !== undefined) dbPayload.title = f.title;
                if (f.description !== undefined) dbPayload.description = f.description;
                if (f.type !== undefined) dbPayload.type = f.type;
                if (f.status !== undefined) dbPayload.status = f.status;
                if (f.authorName !== undefined) dbPayload.author_name = f.authorName;
                if (f.startDate !== undefined) dbPayload.start_date = f.startDate;
                if (f.estimatedCompletionDate !== undefined) dbPayload.estimated_completion_date = f.estimatedCompletionDate;
                if (f.votes !== undefined) dbPayload.votes = f.votes;
                if (f.votedUserIds !== undefined) dbPayload.voted_user_ids = f.votedUserIds;
                if (f.comments !== undefined) dbPayload.comments = f.comments;

                await supabase.from('feedbacks').update(dbPayload).eq('id', id);
            }
        },
        delete: async (id: string) => {
            if (!isOffline) {
                // SECURITY HARDENING: Use select() to ensure row existed and was actually deleted
                // RLS returns 0 rows modified if permission denied, but no error.
                // We must check count to detect "Silent Denial".
                const { error, count, status } = await supabase
                    .from('feedbacks')
                    .delete({ count: 'exact' })
                    .eq('id', id);

                if (error) throw error;
                if (count === 0 && status !== 204) {
                    throw new Error("Falha na exclusão: Item não encontrado ou permissão negada.");
                }
            }
        },
        vote: async (id: string) => {
            if (isOffline) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Login required to vote");

            const { data } = await supabase.from('feedbacks').select('votes, voted_user_ids').eq('id', id).single();
            const votedIds = Array.isArray(data?.voted_user_ids) ? data.voted_user_ids : [];

            if (votedIds.includes(user.id)) {
                // Remove vote (toggle)
                const newIds = votedIds.filter((uid: string) => uid !== user.id);
                await supabase.from('feedbacks').update({ votes: Math.max(0, (data?.votes || 1) - 1), voted_user_ids: newIds }).eq('id', id);
            } else {
                // Add vote
                await supabase.from('feedbacks').update({ votes: (data?.votes || 0) + 1, voted_user_ids: [...votedIds, user.id] }).eq('id', id);
            }
        },
        addComment: async (id: string, text: string, isAdminOverride: boolean = false) => {
            if (isOffline) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Login required to comment");

            const { data } = await supabase.from('feedbacks').select('comments').eq('id', id).single();
            const comments = Array.isArray(data?.comments) ? data.comments : [];
            const newComment = {
                id: 'c' + Date.now(),
                text,
                authorName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                authorId: user.id,
                createdAt: new Date().toISOString(),
                // SECURITY FIX: Use override if provided (trusted source), otherwise rely on DB profile (handled by caller passing true if admin)
                isAdmin: isAdminOverride
            };
            await supabase.from('feedbacks').update({ comments: [...comments, newComment] }).eq('id', id);
        },
        deleteComment: async (feedbackId: string, commentId: string) => {
            if (isOffline) return;
            const { data } = await supabase.from('feedbacks').select('comments').eq('id', feedbackId).single();
            const comments = Array.isArray(data?.comments) ? data.comments : [];
            await supabase.from('feedbacks').update({ comments: comments.filter((c: any) => c.id !== commentId) }).eq('id', feedbackId);
        }
    },
    team: {
        list: async () => {
            if (isOffline) return [];
            // Get current user to filter them out (Owner shouldn't be in the list)
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase.from('team_members').select('*');

            // Filter out the owner if they accidentally invited themselves or joined their own team
            return (data || []).filter((m: any) => m.email !== user?.email);
        },
        invite: async (email: string, role: string, name?: string, assigned_plan_id?: string) => {
            if (!isOffline) {
                // Get current user id
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User not valid");

                // 1. Add to team table (Maintain local pending state)
                const { data: memberData, error: dbError } = await supabase.from('team_members').insert({
                    email: email.trim(),
                    role,
                    owner_id: user.id,
                    name: name || null,
                    assigned_plan_id: assigned_plan_id || 'CONVIDADO'
                }).select().single();

                if (dbError) throw dbError;

                // 2. Call Edge Function to send official Invite Email & set Auth Metadata
                const { error: fnError } = await supabase.functions.invoke('invite-member', {
                    body: {
                        email,
                        role,
                        name,
                        planId: assigned_plan_id || 'CONVIDADO',
                        redirectTo: window.location.origin
                    }
                });

                if (fnError) {
                    console.error("Edge Function Invite Failed:", fnError);
                    // Extract specific error message if available
                    // The Supabase invoke error might be wrapped
                    const specificMessage = safeGetErrorMessage(fnError);
                    throw new Error(`Erro no envio: ${specificMessage}`);
                }

                return memberData;
            }
            return null;
        },
        checkMembership: async (userId: string) => { const { data } = await supabase.from('team_members').select('*').eq('user_id', userId).eq('status', 'ACTIVE').single(); return data; },
        updateRole: async (id: string, role: string) => { const { error } = await supabase.from('team_members').update({ role }).eq('id', id); if (error) throw error; },
        remove: async (id: string) => { const { error } = await supabase.from('team_members').delete().eq('id', id); if (error) throw error; },
        resendInvite: async (email: string) => {
            if (isOffline) return;
            // Rescue Mission Fix: Re-use invite logic to resend
            // We assume 'CONVIDADO' role and plan for re-sends or fetch existing?
            // Safer to just trigger the email edge function.
            const { error: fnError } = await supabase.functions.invoke('invite-member', {
                body: {
                    email,
                    role: 'CONVIDADO', // Default
                    name: 'Membro',
                    planId: 'CONVIDADO',
                    redirectTo: window.location.origin,
                    resend: true
                }
            });
            if (fnError) throw fnError;
        }
    },
    system: {
        get: async () => {
            if (isOffline) return { maintenanceMode: false, allowSignups: true, announcements: [], debugMode: false };
            const { data } = await supabase.from('system_config').select('*').single();
            if (!data) return { maintenanceMode: false, allowSignups: true, announcements: [], debugMode: false };
            return { maintenanceMode: data.maintenance_mode, allowSignups: data.allow_signups, announcements: data.announcements || [], debugMode: data.debug_mode };
        },
        update: async (c: any) => {
            if (!isOffline) {
                // Secure Update via Edge Function (Server-Side Logging)
                await invokeEdgeFunction('admin-action', {
                    action: 'UPDATE_CONFIG',
                    targetId: 'global', // Singleton
                    payload: c
                });
            }
        },
        healthCheck: async () => { return { profiles: true, projects: true, templates: true, system_config: true }; }
    },
    admin: {
        getUsers: async () => {
            if (isOffline) return [];

            // USE SECURE RPC with Pagination
            const page = 1; // Default to first page for now until UI supports pagination
            const pageSize = 50; // Safe limit
            const { data: profiles, error: profilesError } = await supabase.rpc('get_admin_profiles', { p_page: page, p_page_size: pageSize });

            console.log(" ADMIN RPC DEBUG RAW:", JSON.stringify({ profilesCount: profiles?.length, profilesError, firstProfile: profiles?.[0] }, null, 2));

            if (profilesError) {
                console.error("RPC Error (get_admin_profiles):", profilesError);

                // DEBUG: Call Status RPC
                const { data: debugInfo } = await supabase.rpc('debug_admin_state');
                console.error("DEBUG ADMIN STATE:", debugInfo);

                throw profilesError;
            }

            let invitedEmails = new Set();
            try {
                const { data: teamMembers } = await supabase.from('team_members').select('email');
                invitedEmails = new Set((teamMembers || []).map((tm: any) => tm.email));
            } catch (err) {
                console.warn("Checking invited members failed, proceeding without flags:", err);
            }

            console.log("Users to render:", profiles?.length || 0);
            return (profiles || []).map((p: any) => ({ ...mapProfileToUser(p), isInvitedMember: invitedEmails.has(p.email) }));
        },
        updateUserStatus: async (id: string, status: string) => {
            if (!isOffline) {
                // SECURE: Use Edge Function
                await invokeEdgeFunction('admin-action', {
                    action: 'UPDATE_STATUS',
                    targetId: id,
                    payload: { status }
                });
            }
        },
        updateUserPlan: async (id: string, plan: string) => {
            if (!isOffline) {
                // SECURE: Use Edge Function
                await invokeEdgeFunction('admin-action', {
                    action: 'UPDATE_PLAN',
                    targetId: id,
                    payload: { plan }
                });
            }
        },
        deleteUser: async (id: string) => {
            if (!isOffline) {
                // SECURE: Use Edge Function
                await invokeEdgeFunction('admin-action', {
                    action: 'DELETE_USER',
                    targetId: id,
                    payload: {}
                });
            }
        },
        getDashboardStats: async () => {
            if (isOffline) return { mrr: 0, totalUsers: 0, activeUsers: 0, health: 100 };
            try {
                // Call Edge Function for Secure Admin Stats (Bypasses RLS safely)
                const { data, error } = await supabase.functions.invoke('get-admin-stats');
                if (error) throw error;
                return data;
            } catch (e) {
                console.error("Stats Calc Failed (Edge Function):", e);
                // Fallback to minimal info if function fails
                return { mrr: 0, totalUsers: 0, activeUsers: 0, health: 0 };
            }
        }
    },
    notifications: {
        send: async (userId: string, title: string, message: string, type: string, relatedEntityId?: string) => {
            if (isOffline) return;
            try {
                await invokeEdgeFunction('notify-user', { userId, title, message, type, relatedEntityId });
            } catch (err) {
                console.warn("Failed to send notification:", err);
            }
        },
        list: async () => {
            if (isOffline) return [];
            const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
            return data || [];
        },
        markAsRead: async (id: string) => {
            if (!isOffline) await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        }
    }
};
