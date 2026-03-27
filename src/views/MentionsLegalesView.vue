<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1>Mentions légales</h1>
      <p class="legal-update">Dernière mise à jour : 25 mars 2026</p>

      <section>
        <h2>1. Éditeur du site</h2>
        <p>Le site <strong>rubihgames.com</strong> est édité par :</p>
        <ul>
          <li><strong>Nom :</strong> Foerster Stephen</li>
          <li><strong>Statut :</strong> Micro-entrepreneur</li>
          <li>
            <strong>SIRET :</strong>
            10179128300019
          </li>
          <li>
            <strong>Adresse :</strong>
            90 Grand Rue, 68890 Réguisheim, France
          </li>
          <li>
            <strong>Email :</strong>
            rubih.shop@gmail.com
          </li>
        </ul>
        <p class="notice">
          TVA non applicable - art. 293B du CGI (franchise en base de TVA)
        </p>
      </section>

      <section>
        <h2>2. Directeur de la publication</h2>
        <p>Le directeur de la publication est Foerster Stephen.</p>
      </section>

      <section>
        <h2>3. Hébergement</h2>
        <p>Le site est hébergé par :</p>
        <ul>
          <li><strong>Société :</strong> Koyeb SAS</li>
          <li>
            <strong>Adresse :</strong> 26 rue du Faubourg Saint-Antoine, 75012
            Paris, France
          </li>
          <li><strong>Site web :</strong> koyeb.com</li>
        </ul>
      </section>

      <section>
        <h2>4. Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu du site (textes, graphismes, logo, images, sons,
          vidéos, etc.) est la propriété exclusive de l'éditeur ou de ses
          partenaires et est protégé par les lois françaises et internationales
          relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou
          adaptation de tout ou partie des éléments du site, quel que soit le
          moyen ou le procédé utilisé, est interdite, sauf autorisation écrite
          préalable de l'éditeur.
        </p>
      </section>

      <section>
        <h2>5. Données personnelles</h2>
        <p>
          Les informations concernant la collecte et le traitement des données
          personnelles sont détaillées dans notre
          <RouterLink to="/politique-confidentialite"
            >Politique de confidentialité</RouterLink
          >.
        </p>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>
          Le site utilise des cookies techniques nécessaires à son bon
          fonctionnement (authentification, préférences de jeu). Pour en savoir
          plus, consultez notre
          <RouterLink to="/politique-confidentialite"
            >Politique de confidentialité</RouterLink
          >.
        </p>
      </section>

      <section>
        <h2>7. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers des sites tiers. L'éditeur
          n'exerce aucun contrôle sur ces sites et décline toute responsabilité
          quant à leur contenu.
        </p>
      </section>

      <section>
        <h2>8. Droit applicable</h2>
        <p>
          Le présent site est soumis au droit français. En cas de litige, les
          tribunaux français seront seuls compétents.
        </p>
      </section>

      <div class="legal-footer-nav">
        <RouterLink to="/cgv">Conditions Générales de Vente</RouterLink>
        <RouterLink to="/politique-confidentialite"
          >Politique de confidentialité</RouterLink
        >
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

.notice {
  display: inline-block;
  background: var(--color-primary-bg);
  color: var(--color-primary-dark);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-sm);
  margin-top: 0.4rem;
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
}
</style>
