/**
 * Ich baue hier das HTML für eine einzelne Pokemon-Karte.
 * Die Karte ist ein Button, weil sie später anklickbar sein soll.
 */
function getPokemonCardTemplate(pokemon) {
    return `
        <button class="pokemon-card" data-id="card" onclick="openPokemonDialog(${pokemon.id})">
            <h2>${capitalizeFirstLetter(pokemon.name)}</h2>

            <img 
                data-id="card-image"
                src="${pokemon.sprites.front_default}" 
                alt="${pokemon.name}"
            >

            <p>#${pokemon.id}</p>
        </button>
    `;
}


/**
 * Ich mache hier nur den ersten Buchstaben groß.
 * Die PokeAPI liefert Namen klein, zum Beispiel "bulbasaur".
 */
function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}