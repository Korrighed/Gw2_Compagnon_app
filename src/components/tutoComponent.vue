<template>
  <div class="tutorial-container glassmorphism text-center">
    <h1 class="my-2">Bienvenue sur l'application compagnon Guild Wars 2 !</h1>

    <p>Affichez votre inventaire et banque à tout moment</p>

    <img src="../assets/Logo.webp" alt="logo Guild Wars 2" class="my-1" />

    <div class="instructions m-0">
      <p>
        Rendez-vous sur
        <a href="https://account.arena.net/applications"
          >l'onget application du site arenat-net.</a
        >
      </p>
      <p>
        Créez une clé avec les autorisations : inventaire, personnages,
        porte-monnaie.
      </p>
      <p>Utilisez cette clé dans l'espace dédié en haut du site.</p>
      <p>
        Tri par combinaison d'attribut et rareté. Le tri n'a lieu que dans un
        inventaire à la fois.
      </p>
    </div>
  </div>
</template>

<script setup></script>
<style>
.tutorial-container {
  font-size: 1.3rem;
}

.tutorial-container img {
  max-width: 100%;
  height: auto;
}

/* Mobile */
@media (max-width: 768px) {
  .tutorial-container img {
    width: 150px; /* ou 40% selon préférence */
  }
}

/* Desktop */
@media (min-width: 769px) {
  .tutorial-container img {
    width: 250px;
  }
}
</style>
