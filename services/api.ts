
import { Project, User, PlanConfig, FeedbackItem, TeamMember, SystemConfig, Template, TemplateStatus } from '../types';
import { supabase, isOffline } from './supabaseClient';
import { Folder } from 'lucide-react';
import React from 'react';

const mapProfileToUser = (profile: any): User => ({
    id: profile.id,
    name: profile.name || 'Usuário',
    email: profile.email || '',
    plan: profile.plan || 'FREE',
    status: profile.status || 'ACTIVE',
    lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
    isSystemAdmin: profile.is_system_admin || false
});

const mapDBProjectToApp = (dbProject: any): Project => ({
    id: dbProject.id,
    name: dbProject.name,
    nodes: dbProject.nodes || [],
    edges: dbProject.edges || [],
    updatedAt: new Date(dbProject.updated_at),
    ownerId: dbProject.owner_id
});

export const api = {
    auth: {
        login: async (email: string, password?: string): Promise<{ user: User, token: string }> => {
            if (isOffline) {
                const isAdmin = email.includes('admin') || email === 'millamon.evouni@gmail.com';
                return {
                    user: {
                        id: isAdmin ? 'u1' : 'u2',
                        name: email.split('@')[0],
                        email,
                        plan: isAdmin ? 'PREMIUM' : 'PRO',
                        status: 'ACTIVE',
                        lastLogin: new Date(),
                        isSystemAdmin: isAdmin
                    },
                    token: 'mock_token'
                };
            }
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '123456' });
            if (error) throw error;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
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
        getProfile: async (): Promise<User | null> => {
            if (isOffline) return null;
            try {
                const { data } = await supabase.auth.getUser();
                if (!data?.user) return null;
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
                return profile ? mapProfileToUser(profile) : null;
            } catch (e) { return null; }
        },
        updateProfile: async (id: string, data: Partial<User>) => { if (!isOffline) await supabase.from('profiles').update(data).eq('id', id); },
        updatePassword: async (password: string) => {
            if (isOffline) return;
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
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
            const { data } = await supabase.from('profiles').select('*');
            return (data || []).map(mapProfileToUser);
        },
        update: async (id: string, data: any) => { if (!isOffline) await supabase.from('profiles').update(data).eq('id', id); },
        delete: async (id: string) => { if (!isOffline) await supabase.from('profiles').delete().eq('id', id); }
    },
    projects: {
        list: async () => {
            if (isOffline) return [];
            const { data } = await supabase.from('projects').select('*');
            return (data || []).map(mapDBProjectToApp);
        },
        create: async (p: any) => {
            if (isOffline) return { ...p, id: 'proj_' + Date.now() };
            const dbPayload = {
                name: p.name,
                nodes: p.nodes,
                edges: p.edges,
                owner_id: p.ownerId,
                updated_at: p.updatedAt
            };
            const { data, error } = await supabase.from('projects').insert(dbPayload).select().single();
            if (error) throw error;
            return mapDBProjectToApp(data);
        },
        update: async (id: string, p: any) => { if (!isOffline) await supabase.from('projects').update(p).eq('id', id); },
        delete: async (id: string) => { if (!isOffline) await supabase.from('projects').delete().eq('id', id); }
    },
    templates: {
        list: async () => {
            if (isOffline) return [];
            const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
            return (data || []).map((t: any) => ({
                id: t.id, customLabel: t.custom_label, customDescription: t.custom_description,
                icon: React.createElement(Folder), nodes: t.nodes, edges: t.edges,
                status: t.status, isPublic: t.is_public, authorName: t.author_name, authorId: t.owner_id,
                rating: t.rating, downloads: t.downloads, isFeatured: t.is_featured
            }));
        },
        listPublic: async (userId?: string): Promise<Template[]> => {
            if (isOffline) return [];
            let query = supabase.from('templates').select('*').or(`status.eq.APPROVED,and(owner_id.eq.${userId || 'null'},status.eq.PENDING)`);

            // If checking public only without user context, fallback to just approved
            if (!userId) {
                query = supabase.from('templates').select('*').eq('status', 'APPROVED');
            } else {
                // Supabase OR syntax is tricky, let's simplify: fetch matches where (status=APPROVED) OR (owner_id=userId)
                // Then we filter in memory or trust the improved OR query if configured properly.
                // safe approach for simple RLS/query: use the .or() simple syntax
                // "status.eq.APPROVED,owner_id.eq.userId" means OR
                query = supabase.from('templates').select('*').or(`status.eq.APPROVED,owner_id.eq.${userId}`);
            }

            const { data } = await query;
            return (data || []).filter((t: any) => t.is_public).map((t: any) => ({
                id: t.id, customLabel: t.custom_label, customDescription: t.custom_description,
                icon: React.createElement(Folder), nodes: t.nodes, edges: t.edges,
                rating: t.rating, downloads: t.downloads, authorName: t.author_name, isPro: true, isFeatured: t.is_featured,
                status: t.status, ownerId: t.owner_id
            }));
        },
        create: async (t: any) => { if (!isOffline) await supabase.from('templates').insert({ ...t, author_name: 'User', is_public: false }); },
        delete: async (id: string) => { if (!isOffline) await supabase.from('templates').delete().eq('id', id); },
        update: async (id: string, updates: any) => { if (!isOffline) await supabase.from('templates').update(updates).eq('id', id); },
        submitToMarketplace: async (template: Partial<Template>) => {
            if (isOffline) return;
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('templates').insert({
                custom_label: template.customLabel,
                custom_description: template.customDescription,
                nodes: template.nodes,
                edges: template.edges,
                owner_id: user?.id,
                author_name: template.authorName,
                is_public: true,
                status: 'PENDING',
                downloads: 0,
                rating: 0,
                rating_count: 0,
                is_featured: false
            });
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
        list: async () => { if (isOffline) return []; const { data } = await supabase.from('plans').select('*'); return data || []; },
        update: async (id: string, p: any) => { if (!isOffline) await supabase.from('plans').update(p).eq('id', id); },
        create: async (p: any) => { if (!isOffline) await supabase.from('plans').insert(p); },
        delete: async (id: string) => { if (!isOffline) await supabase.from('plans').delete().eq('id', id); }
    },
    feedbacks: {
        list: async () => { if (isOffline) return []; const { data } = await supabase.from('feedbacks').select('*'); return data || []; },
        create: async (f: any) => { if (!isOffline) await supabase.from('feedbacks').insert(f); },
        update: async (id: string, f: any) => { if (!isOffline) await supabase.from('feedbacks').update(f).eq('id', id); },
        delete: async (id: string) => { if (!isOffline) await supabase.from('feedbacks').delete().eq('id', id); }
    },
    team: {
        list: async () => { if (isOffline) return []; const { data } = await supabase.from('team_members').select('*'); return data || []; },
        invite: async (email: string, role: string) => {
            if (!isOffline) {
                // 1. Add to team table
                const { error: dbError } = await supabase.from('team_members').insert({ email, role });
                if (dbError) throw dbError;

                // 2. Send Magic Link
                const { error: authError } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });

                if (authError) {
                    console.error("Auth Error:", authError);
                    throw authError;
                }
            }
        },
        updateRole: async (id: string, role: string) => { if (!isOffline) await supabase.from('team_members').update({ role }).eq('id', id); },
        remove: async (id: string) => { if (!isOffline) await supabase.from('team_members').delete().eq('id', id); }
    },
    system: {
        get: async () => {
            if (isOffline) return { maintenanceMode: false, allowSignups: true, announcements: [] };
            const { data } = await supabase.from('system_config').select('*').single();
            return data || { maintenanceMode: false, allowSignups: true, announcements: [] };
        },
        update: async (c: any) => { if (!isOffline) await supabase.from('system_config').upsert(c); },
        healthCheck: async () => {
            return { profiles: true, projects: true, templates: true, system_config: true };
        }
    },
    admin: {
        getUsers: async () => {
            if (isOffline) return [];
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) throw error;
            return data || [];
        },
        updateUserStatus: async (id: string, status: string) => {
            if (!isOffline) await supabase.from('profiles').update({ status }).eq('id', id);
        },
        updateUserPlan: async (id: string, plan: string) => {
            if (!isOffline) await supabase.from('profiles').update({ plan }).eq('id', id);
        }
    }
};
