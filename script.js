const BASE_URL = "https://pokeapi.co/api/v2/";

/**
 * Startfunktion der Anwendung.
 * Wird über onload="init()" in der index.html gestartet.
 */
function init() {
    console.log("App gestartet");
    console.log("API Basis-URL:", BASE_URL);

    loadPokemon();
}

/**
 * Lädt ein einzelnes Pokemon von der PokeAPI.
 * Aktuell wird Pokémon mit der ID 1 geladen.
 */
async function loadPokemon() {
    console.log("Lade Pokémon-Daten...");

    let response = await fetch(BASE_URL + "pokemon/1");

    console.log("Antwort vom Server:", response);

    let pokemon = await response.json();

    console.log("Umgewandelte Pokémon-Daten:", pokemon);
    console.log("Geladenes Pokémon:", pokemon.name);
    console.log("Pokémon-ID:", pokemon.id);

    renderPokemonCard(pokemon);
}

/**
 * Rendert eine einzelne Pokemon-Karte in den Pokédex-Container.
 */
function renderPokemonCard(pokemon) {
    console.log("Rendere Pokemon-Karte für:", pokemon.name);

    let pokedex = document.getElementById("pokedex");

    console.log("Gefundener Pokedex-Container:", pokedex);

    pokedex.innerHTML += getPokemonCardTemplate(pokemon);

    console.log("Pokemon-Karte wurde eingefügt");
}

/**
 * Ich nutze diese Funktion erstmal nur als Test.
 * Später öffnet sie die große Pokémon-Ansicht.
 */
function openPokemonDialog(pokemonId) {
    console.log("Clicked Pokémon ID:", pokemonId);
}