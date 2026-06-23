const BASE_URL = "https://pokeapi.co/api/v2/";

let currentOffset = 0;
let pokemonLimit = 20;

/**
 * Startfunktion der Anwendung.
 * Wird über onload="init()" in der index.html gestartet.
 */
function init() {
    console.log("App gestartet");

    loadPokemonList();
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

async function loadPokemonList() {
    console.log("Lädt Pokemon von ", currentOffset);


    let response = await fetch(getPokemonListUrl());
    let data = await response.json();

    console.log(data.results);

    loadPokemonDetails(data.results);

}

function getPokemonListUrl() {
    return BASE_URL + `pokemon?limit=${pokemonLimit}&offset=${currentOffset}`;
}

async function loadPokemonDetails(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        await loadSinglePokemon(pokemonList[i].url);
    }

    currentOffset += pokemonLimit;
}

async function loadSinglePokemon(url) {
    let response = await fetch(url);
    let pokemon = await response.json();

    console.log("Loaded Pokémon:", pokemon.name);

    renderPokemonCard(pokemon);
}

function renderPokemonCard(pokemon) {
    let pokedex = document.getElementById("pokedex");
    pokedex.innerHTML += getPokemonCardTemplate(pokemon);
}

function openPokemonDialog(pokemonId) {
    console.log("Clicked Pokémon ID:", pokemonId);
}