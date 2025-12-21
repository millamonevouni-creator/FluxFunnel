
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
    avatarUrl: profile.avatar_url,
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

// Helper for calling Edge Functions
const invokeEdgeFunction = async (functionName: string, body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json'
    };

    // Local development fallback or production URL
    // Note: Supabase JS client has functions.invoke but manually fetching is sometimes more reliable for debugging specific URLs
    const { data, error } = await supabase.functions.invoke(functionName, {
        body: body,
        headers: headers
    });

    if (error) throw error;
    return data;
}

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

            // Timeout wrapper for signInWithPassword
            const loginPromise = supabase.auth.signInWithPassword({ email, password: password || '123456' });
            const timeoutLogin = new Promise((resolve) => setTimeout(() => resolve({ data: { user: null, session: null }, error: { message: 'Timeout login' } }), 6000));

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
                    plan: 'FREE', // Default fallback
                    status: 'ACTIVE',
                    lastLogin: new Date(),
                    isSystemAdmin: email === 'millamon.evouni@gmail.com' // Emergency admin access
                };
                return { user: fallbackUser, token: data.session?.access_token || '' };
            }

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
                    plan: 'FREE',
                    status: 'ACTIVE',
                    lastLogin: new Date(),
                    isSystemAdmin: data.user.email === 'millamon.evouni@gmail.com'
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
                status: t.status, isPublic: t.is_public, isCustom: t.is_custom, authorName: t.author_name, authorId: t.owner_id,
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
        delete: async (id: string) => { if (!isOffline) await supabase.from('templates').delete().eq('id', id); },
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
                stripe_price_id_yearly: p.stripe_price_id_yearly
            }));
        },
        update: async (id: string, p: any) => {
            if (isOffline) { await supabase.from('plans').update(p).eq('id', id); return; }
            // Invoke Edge Function to handle Sync
            const { data, error } = await supabase.functions.invoke('manage-plan', {
                body: { plan: { ...p, id }, operation: 'UPDATE' }
            });
            if (error) throw error;
            return data;
        },
        create: async (p: any) => {
            if (isOffline) { await supabase.from('plans').insert(p); return; }
            const { data, error } = await supabase.functions.invoke('manage-plan', {
                body: { plan: p, operation: 'CREATE' }
            });
            if (error) throw error;
            return data;
        },
        delete: async (id: string) => { if (!isOffline) await supabase.from('plans').delete().eq('id', id); }
    },
    feedbacks: {
        list: async () => { if (isOffline) return []; const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false }); return data || []; },
        create: async (f: any) => { if (!isOffline) await supabase.from('feedbacks').insert({ ...f, votes: 0, voted_user_ids: [], status: 'PENDING' }); },
        update: async (id: string, f: any) => { if (!isOffline) await supabase.from('feedbacks').update(f).eq('id', id); },
        delete: async (id: string) => { if (!isOffline) await supabase.from('feedbacks').delete().eq('id', id); },
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
        addComment: async (id: string, text: string) => {
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
                isAdmin: user.email === 'millamon.evouni@gmail.com' // Simplistic check, ideally use role from profile
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
        list: async () => { if (isOffline) return []; const { data } = await supabase.from('team_members').select('*'); return data || []; },
        invite: async (email: string, role: string) => {
            if (!isOffline) {
                // Get current user id
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User not valid");

                // 1. Add to team table
                const { data: memberData, error: dbError } = await supabase.from('team_members').insert({
                    email,
                    role,
                    owner_id: user.id
                }).select().single();

                if (dbError) throw dbError;

                // 2. Send Magic Link
                try {
                    const { error: authError } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            emailRedirectTo: window.location.origin
                        }
                    });

                    if (authError) {
                        throw authError; // Trigger catch block
                    }
                } catch (inviteError: any) {
                    // Rollback: Remove the user if invite failed
                    console.error("Invite failed, rolling back DB entry...", inviteError);
                    if (memberData?.id) {
                        await supabase.from('team_members').delete().eq('id', memberData.id);
                    }
                    throw new Error("Falha ao enviar e-mail. Convite cancelado.");
                }
            }
        },
        updateRole: async (id: string, role: string) => { if (!isOffline) await supabase.from('team_members').update({ role }).eq('id', id); },
        remove: async (id: string) => { if (!isOffline) await supabase.from('team_members').delete().eq('id', id); },
        resendInvite: async (email: string) => {
            if (isOffline) return;
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });
            if (error) throw error;
        }
    },
    system: {
        get: async () => {
            if (isOffline) return { maintenanceMode: false, allowSignups: true, announcements: [], debugMode: false };
            const { data } = await supabase.from('system_config').select('*').single();
            if (!data) return { maintenanceMode: false, allowSignups: true, announcements: [], debugMode: false };

            return {
                maintenanceMode: data.maintenance_mode,
                allowSignups: data.allow_signups,
                announcements: data.announcements || [],
                debugMode: data.debug_mode
            };
        },
        update: async (c: any) => { if (!isOffline) await supabase.from('system_config').upsert(c); },
        healthCheck: async () => {
            return { profiles: true, projects: true, templates: true, system_config: true };
        }
    },
    admin: {
        getUsers: async () => {
            if (isOffline) return [];

            // 1. Fetch profiles
            const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
            if (profilesError) throw profilesError;

            // 2. Fetch all team members emails to identify who is invited
            const { data: teamMembers, error: teamError } = await supabase.from('team_members').select('email');
            if (teamError) console.error("Error fetching team members for admin view", teamError);

            const invitedEmails = new Set((teamMembers || []).map((tm: any) => tm.email));

            // 3. Map to User objects
            return (profiles || []).map((p: any) => ({
                ...mapProfileToUser(p),
                isInvitedMember: invitedEmails.has(p.email)
            }));
        },
        updateUserStatus: async (id: string, status: string) => {
            if (!isOffline) await supabase.from('profiles').update({ status }).eq('id', id);
        },
        updateUserPlan: async (id: string, plan: string) => {
            if (!isOffline) await supabase.from('profiles').update({ plan }).eq('id', id);
        },
        deleteUser: async (id: string) => {
            if (!isOffline) await supabase.from('profiles').delete().eq('id', id);
        }
    }
};
