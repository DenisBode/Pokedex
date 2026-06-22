function getPokemonCardTemplate(pokemon) {
    return `
        <div class="pokemon-card">
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Nr. ${pokemon.id}</p>
        </div>
    `;
}