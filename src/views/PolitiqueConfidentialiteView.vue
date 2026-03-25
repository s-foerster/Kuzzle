<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1>Politique de confidentialité</h1>
      <p class="legal-update">Dernière mise à jour : 25 mars 2026</p>

      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles collectées sur
          <strong>rubihgames.com</strong> est :
        </p>
        <ul>
          <li><strong>Nom :</strong> Foerster Stephen</li>
          <li><strong>Statut :</strong> Micro-entrepreneur</li>
          <li>
            <strong>SIRET :</strong>
            10179128300019
          </li>
          <li>
            <strong>Email :</strong>
            rubih.shop@gmail.com
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>
          Nous collectons les données suivantes selon les fonctionnalités
          utilisées :
        </p>

        <h3>Compte utilisateur (si inscription)</h3>
        <ul>
          <li>Adresse email (via Google OAuth ou inscription directe)</li>
          <li>Nom d'utilisateur choisi (pseudo)</li>
          <li>Photo de profil (optionnelle, fournie par Google)</li>
        </ul>

        <h3>Données de jeu</h3>
        <ul>
          <li>
            Résultats de parties (puzzle complété, temps, nombre de
            vérifications)
          </li>
          <li>Date du puzzle joué</li>
          <li>Type de jeu (Kuzzle, Lumizle)</li>
        </ul>

        <h3>Abonnement premium (si souscription)</h3>
        <ul>
          <li>
            Identifiant client Stripe (référence de paiement, aucune donnée
            bancaire)
          </li>
          <li>Statut et date d'expiration de l'abonnement</li>
        </ul>

        <h3>Données techniques</h3>
        <ul>
          <li>
            Préférences de jeu stockées localement (localStorage, non
            transmises)
          </li>
          <li>Progression de session (état de la grille, undo, timer)</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalités et bases légales</h2>
        <table>
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Authentification et gestion du compte</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Affichage du classement (leaderboard)</td>
              <td>Intérêt légitime</td>
            </tr>
            <tr>
              <td>Gestion de l'abonnement premium (Stripe)</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Statistiques personnelles (streak, meilleurs temps)</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Cookies techniques (fonctionnement du site)</td>
              <td>Intérêt légitime</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Durée de conservation</h2>
        <ul>
          <li>
            Données de compte : jusqu'à suppression du compte ou 3 ans sans
            activité
          </li>
          <li>Résultats de parties : jusqu'à suppression du compte</li>
          <li>Données Stripe : 5 ans (obligations comptables légales)</li>
          <li>
            Préférences localStorage : indéfiniment, jusqu'à effacement du cache
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Destinataires des données</h2>
        <p>
          Vos données sont transmises aux sous-traitants suivants, nécessaires
          au fonctionnement du service :
        </p>

        <h3>Supabase Inc. (authentification et base de données)</h3>
        <ul>
          <li>Siège : 970 Trestle Glen Rd, Oakland, CA 94610, États-Unis</li>
          <li>
            Transfert encadré par les Clauses Contractuelles Types (CCT) de la
            Commission européenne
          </li>
          <li>
            Politique :
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener"
              >supabase.com/privacy</a
            >
          </li>
        </ul>

        <h3>Stripe (paiement)</h3>
        <ul>
          <li>
            Stripe Payments Europe Limited, 1 Grand Canal Street Lower, Dublin,
            Irlande (UE)
          </li>
          <li>
            Politique :
            <a
              href="https://stripe.com/fr/privacy"
              target="_blank"
              rel="noopener"
              >stripe.com/fr/privacy</a
            >
          </li>
        </ul>

        <h3>Koyeb SAS (hébergement)</h3>
        <ul>
          <li>26 rue du Faubourg Saint-Antoine, 75012 Paris, France</li>
          <li>Hébergement des serveurs en Europe</li>
        </ul>

        <p>
          Aucune donnée n'est vendue ni cédée à des tiers à des fins
          commerciales.
        </p>
      </section>

      <section>
        <h2>6. Cookies et stockage local</h2>
        <h3>Cookies strictement nécessaires</h3>
        <p>
          Le site utilise uniquement des cookies techniques indispensables à son
          fonctionnement :
        </p>
        <ul>
          <li>
            <strong>Session Supabase</strong> : maintien de la connexion (JWT,
            durée de session)
          </li>
          <li>
            <strong>Préférences cookies</strong> : mémorisation de votre choix
            sur la bannière cookies
          </li>
        </ul>

        <h3>Stockage local (localStorage)</h3>
        <p>
          Les données de jeu (progression, grille, historique undo, niveaux
          complétés) sont stockées uniquement dans votre navigateur via
          localStorage. Ces données ne sont jamais transmises à des tiers (sauf
          synchronisation Supabase si connecté).
        </p>

        <p>
          Ces cookies et données locales sont nécessaires au bon fonctionnement
          du service. Ils ne nécessitent pas votre consentement préalable
          (directive ePrivacy, article 5§3, exception pour cookies strictement
          nécessaires).
        </p>
      </section>

      <section>
        <h2>7. Vos droits (RGPD)</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD
          — Règlement UE 2016/679), vous disposez des droits suivants :
        </p>
        <ul>
          <li>
            <strong>Droit d'accès</strong> : obtenir une copie de vos données
          </li>
          <li>
            <strong>Droit de rectification</strong> : corriger des données
            inexactes
          </li>
          <li>
            <strong>Droit à l'effacement</strong> : supprimer votre compte et
            vos données
          </li>
          <li>
            <strong>Droit à la portabilité</strong> : recevoir vos données dans
            un format structuré
          </li>
          <li>
            <strong>Droit d'opposition</strong> : vous opposer à certains
            traitements
          </li>
          <li>
            <strong>Droit à la limitation</strong> : limiter le traitement de
            vos données
          </li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à :
          <strong>rubih.shop@gmail.com</strong>
          <br />
          Nous répondrons dans un délai d'un mois.
        </p>
        <p>
          Vous avez également le droit d'introduire une réclamation auprès de la
          <strong>CNIL</strong> (Commission Nationale de l'Informatique et des
          Libertés) :
          <a href="https://www.cnil.fr" target="_blank" rel="noopener"
            >cnil.fr</a
          >
          — 3 Place de Fontenoy, 75007 Paris.
        </p>
      </section>

      <section>
        <h2>8. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles
          appropriées pour protéger vos données contre tout accès non autorisé,
          perte ou divulgation :
        </p>
        <ul>
          <li>Connexion chiffrée HTTPS (TLS)</li>
          <li>Authentification via Supabase (tokens JWT, OAuth 2.0)</li>
          <li>
            Champs sensibles (statut premium, stripe_customer_id) protégés par
            trigger base de données (modification réservée au service interne)
          </li>
          <li>Aucune donnée bancaire stockée (traitement 100% Stripe)</li>
        </ul>
      </section>

      <section>
        <h2>9. Modifications de cette politique</h2>
        <p>
          La présente politique peut être modifiée à tout moment. La date de
          mise à jour est indiquée en haut de la page. En cas de modification
          substantielle, vous serez informé par email ou notification sur le
          site.
        </p>
      </section>

      <div class="legal-footer-nav">
        <RouterLink to="/mentions-legales">Mentions légales</RouterLink>
        <RouterLink to="/cgv">Conditions Générales de Vente</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.legal-page {
  min-height: calc(100vh - 80px);
  background: var(--color-bg);
  padding: 2rem 1rem 4rem;
}

.legal-container {
  max-width: 760px;
  margin: 0 auto;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 2.5rem 3rem;
  box-shadow: var(--shadow-sm);
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 0.4rem;
}

.legal-update {
  font-size: 0.85rem;
  color: var(--color-text-soft);
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1.5rem;
}

section:last-of-type {
  border-bottom: none;
}

h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 1rem 0 0.5rem;
}

p {
  color: var(--color-text-soft);
  line-height: 1.7;
  margin-bottom: 0.6rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0.6rem;
}

ul li {
  color: var(--color-text-soft);
  line-height: 1.8;
  padding-left: 1rem;
}

ul li::before {
  content: "·";
  color: var(--color-primary);
  font-weight: 700;
  margin-right: 0.5rem;
  margin-left: -1rem;
}

a {
  color: var(--color-primary);
  text-decoration: underline;
}

/* Tableau finalités */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0 0.5rem;
  font-size: 0.9rem;
}

th {
  background: var(--color-primary-bg);
  color: var(--color-primary-dark);
  font-weight: 700;
  text-align: left;
  padding: 0.6rem 0.85rem;
  border-bottom: 2px solid var(--color-border);
}

td {
  color: var(--color-text-soft);
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.5;
}

tr:last-child td {
  border-bottom: none;
}

tr:nth-child(odd) td {
  background: var(--color-bg);
}

.legal-footer-nav {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.legal-footer-nav a {
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .legal-container {
    padding: 1.5rem 1.25rem;
  }
  h1 {
    font-size: 1.6rem;
  }
  table {
    font-size: 0.8rem;
  }
  th,
  td {
    padding: 0.5rem 0.55rem;
  }
}
</style>
