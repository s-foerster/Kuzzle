/**
 * stripe.js — Chargement lazy de Stripe.js
 *
 * On charge Stripe.js uniquement quand c'est nécessaire (pas au démarrage de l'app),
 * et on conserve la promesse pour éviter de charger le script plusieurs fois.
 */

let stripePromise = null;

/**
 * Retourne la promesse du singleton Stripe.
 * Charge stripe.js depuis le CDN officiel si nécessaire.
 */
export function getStripe() {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
        console.warn('[stripe.js] VITE_STRIPE_PUBLISHABLE_KEY non définie — paiements désactivés');
        return Promise.resolve(null);
    }

    if (!stripePromise) {
        stripePromise = loadStripeScript().then(() => window.Stripe(publishableKey));
    }

    return stripePromise;
}

/**
 * Injecte le script Stripe.js dans le DOM s'il n'est pas encore présent.
 * Stripe recommande de charger depuis js.stripe.com/v3/ (pas bundlé en local).
 */
function loadStripeScript() {
    return new Promise((resolve, reject) => {
        // Déjà chargé ?
        if (window.Stripe) {
            resolve();
            return;
        }

        const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
        if (existing) {
            existing.addEventListener('load', resolve);
            existing.addEventListener('error', reject);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('[stripe.js] Impossible de charger Stripe.js'));
        document.head.appendChild(script);
    });
}
