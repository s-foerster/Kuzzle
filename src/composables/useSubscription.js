/**
 * useSubscription.js — Composable Vue pour le paiement Stripe
 *
 * Expose :
 *   startCheckout()  → redirige vers Stripe Checkout
 *   openPortal()     → redirige vers Stripe Customer Portal
 */

import { ref } from 'vue';
import { supabase } from '../lib/supabase.js';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Récupère le JWT de la session Supabase courante.
 * @returns {Promise<string|null>} Access token ou null si non connecté.
 */
async function getAccessToken() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
}

/**
 * Appelle une route API protégée par JWT et retourne le body JSON.
 * @param {string} endpoint  - Chemin relatif, ex. '/api/stripe/create-checkout-session'
 * @param {string} method    - Méthode HTTP
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
async function callStripeApi(endpoint, method = 'POST') {
    const token = await getAccessToken();
    if (!token) {
        return { success: false, error: 'Vous devez être connecté.' };
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    let body;
    try {
        body = await res.json();
    } catch {
        body = {};
    }

    if (!res.ok) {
        return { success: false, error: body.error || `Erreur ${res.status}` };
    }

    return body;
}

/**
 * Composable principal.
 *
 * Usage dans un composant Vue :
 *   const { startCheckout, openPortal, loading, error } = useSubscription();
 */
export function useSubscription() {
    const loading = ref(false);
    const error = ref('');

    /**
     * Lance le flux d'achat du Pass Premium.
     * Redirige vers Stripe Checkout si l'API répond avec une URL.
     */
    async function startCheckout() {
        loading.value = true;
        error.value = '';

        try {
            const data = await callStripeApi('/api/stripe/create-checkout-session');

            if (!data.success || !data.url) {
                // Cas "déjà premium" : pas une vraie erreur utilisateur
                if (data.error === 'Déjà premium') {
                    error.value = 'Vous bénéficiez déjà du Pass Premium ! 🎉';
                } else {
                    error.value = data.error || 'Impossible de lancer le paiement. Réessayez.';
                }
                return;
            }

            // Redirection vers la page Stripe Checkout
            window.location.href = data.url;

        } catch (err) {
            error.value = 'Erreur réseau. Vérifiez votre connexion et réessayez.';
            console.error('[useSubscription] startCheckout:', err);
        } finally {
            loading.value = false;
        }
    }

    /**
     * Ouvre le Stripe Customer Portal (gestion du paiement, reçu, etc.).
     * Redirige vers le portail Stripe si l'API répond avec une URL.
     */
    async function openPortal() {
        loading.value = true;
        error.value = '';

        try {
            const data = await callStripeApi('/api/stripe/portal');

            if (!data.success || !data.url) {
                error.value = data.error || 'Impossible d\'ouvrir le portail. Réessayez.';
                return;
            }

            window.location.href = data.url;

        } catch (err) {
            error.value = 'Erreur réseau. Vérifiez votre connexion et réessayez.';
            console.error('[useSubscription] openPortal:', err);
        } finally {
            loading.value = false;
        }
    }

    return { startCheckout, openPortal, loading, error };
}
