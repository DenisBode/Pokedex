const BASE_URL = "https://pokeapi.co/api/v2/";

let currentOffset = 0;
let pokemonLimit = 20;
let loadedPokemon = [];
let selectedTypes = [];


/**
 * Startet die App.
 * Wird über onload="init()" in der index.html aufgerufen.
 */
function init() {
    console.log("App gestartet");

    loadPokemonTypes();
    loadPokemonList();
}


/**
 * Lädt eine Liste mit Pokemon.
 */
async function loadPokemonList() {
    console.log("Lädt Pokémon ab Offset:", currentOffset);

    let response = await fetch(getPokemonListUrl());
    let data = await response.json();

    console.log("Geladene Pokémon-Liste:", data.results);

    loadPokemonDetails(data.results);
}


/**
 * Baut die URL für die Pokemon-Liste.
 */
function getPokemonListUrl() {
    return BASE_URL + `pokemon?limit=${pokemonLimit}&offset=${currentOffset}`;
}


/**
 * Lädt die Detaildaten zu jedem Pokemon aus der Liste.
 */
async function loadPokemonDetails(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        await loadSinglePokemon(pokemonList[i].url);
    }

    currentOffset += pokemonLimit;
}


/**
 * Lädt ein einzelnes Pokemon mit allen Details.
 */
async function loadSinglePokemon(url) {
    let response = await fetch(url);
    let pokemon = await response.json();

    loadedPokemon.push(pokemon);

    console.log("Geladenes Pokémon:", pokemon.name);

    renderPokemonCard(pokemon);
}


/**
 * Rendert eine einzelne Pokemon-Karte.
 */
function renderPokemonCard(pokemon) {
    let pokedex = document.getElementById("pokedex");

    pokedex.innerHTML += getPokemonCardTemplate(pokemon);
}


/**
 * Rendert mehrere Pokemon-Karten neu.
 */
function renderPokemonCards(pokemonList) {
    let pokedex = document.getElementById("pokedex");

    pokedex.innerHTML = "";

    for (let i = 0; i < pokemonList.length; i++) {
        renderPokemonCard(pokemonList[i]);
    }
}


/**
 * Lädt alle Pokémon-Typen für den Filter.
 */
async function loadPokemonTypes() {
    let response = await fetch(BASE_URL + "type");
    let data = await response.json();
    let types = getValidTypes(data.results);

    console.log("Verfügbare Typen:", types);

    renderTypeFilter(types);
}


/**
 * Entfernt Typen, die wir nicht brauchen.
 */
function getValidTypes(types) {
    return types.filter(type =>
        type.name !== "unknown" && type.name !== "shadow"
    );
}


/**
 * Rendert die Filter-Buttons.
 */
function renderTypeFilter(types) {
    let typeFilter = document.getElementById("typeFilter");

    typeFilter.innerHTML = "";

    for (let i = 0; i < types.length; i++) {
        typeFilter.innerHTML += getTypeFilterButtonTemplate(types[i].name);
    }
}


/**
 * Aktiviert oder deaktiviert einen Typ-Filter.
 */
function toggleTypeFilter(typeName) {
    if (selectedTypes.includes(typeName)) {
        removeSelectedType(typeName);
    } else {
        selectedTypes.push(typeName);
    }

    updateTypeFilter();
}


/**
 * Entfernt einen aktiven Typ aus dem Filter.
 */
function removeSelectedType(typeName) {
    selectedTypes = selectedTypes.filter(type => type !== typeName);
}


/**
 * Aktualisiert Filter-Buttons und Pokémon-Anzeige.
 */
function updateTypeFilter() {
    updateTypeButtonStyles();
    renderFilteredPokemon();

    console.log("Aktive Typen:", selectedTypes);
}


/**
 * Rendert nur passende Pokemon.
 */
function renderFilteredPokemon() {
    if (selectedTypes.length === 0) {
        renderPokemonCards(loadedPokemon);
        return;
    }

    let filteredPokemon = loadedPokemon.filter(hasSelectedType);
    renderPokemonCards(filteredPokemon);
}


/**
 * Prüft, ob ein Pokémon einen aktiven Typ besitzt.
 */
function hasSelectedType(pokemon) {
    let pokemonTypes = getPokemonTypeNames(pokemon);

    return selectedTypes.some(type =>
        pokemonTypes.includes(type)
    );
}


/**
 * Holt alle Typ-Namen eines Pokemon.
 */
function getPokemonTypeNames(pokemon) {
    return pokemon.types.map(typeSlot => typeSlot.type.name);
}


/**
 * Aktualisiert alle Filter-Button-Styles.
 */
function updateTypeButtonStyles() {
    let buttons = document.querySelectorAll(".type-filter-button");

    for (let i = 0; i < buttons.length; i++) {
        updateSingleTypeButton(buttons[i]);
    }
}


/**
 * Setzt active auf einen einzelnen Button.
 */
function updateSingleTypeButton(button) {
    let typeName = button.dataset.type;

    button.classList.toggle("active", selectedTypes.includes(typeName));
}


/**
 * Platzhalter für die spätere große Ansicht.
 */
function openPokemonDialog(pokemonId) {
    console.log("Clicked Pokémon ID:", pokemonId);
}