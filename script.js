const BASE_URL = "https://pokeapi.co/api/v2/";

let currentOffset = 0;
let pokemonLimit = 20;
let loadedPokemon = [];
let selectedTypes = [];
let currentSearch = "";
let currentDialogIndex = 0;
let isLoading = false;
// Stores the highest stat values found in fetched API data.
let maxStatsCache = {};


/**
 * Startet die App.
 * Wird über onload="init()" in der index.html aufgerufen.
 */
function init() {
    console.log("App gestartet");

    initButtons();
    loadPokemonTypes();
    loadPokemonList();
}

function initButtons() {
    let dialog = document.getElementById("pokemonDialog");

    document.getElementById("loadMoreButton").onclick = loadMorePokemon;
    document.getElementById("searchButton").onclick = searchPokemon;
    document.getElementById("clearSearchButton").onclick = clearSearchInput;
    document.getElementById("searchInput").oninput = handleSearchInput;
    dialog.onclick = closeDialogOnBackdrop;
    dialog.onclose = handleDialogClose;
    updateSearchButton();
}


/**
 * Lädt eine Liste mit Pokemon.
 */
async function loadPokemonList() {
    if (isLoading) {
        return;
    }

    isLoading = true;
    setLoadMoreButton(true);

    console.log("Lädt Pokémon ab Offset:", currentOffset);

    let response = await fetch(getPokemonListUrl());
    let data = await response.json();

    console.log("Geladene Pokémon-Liste:", data.results);

    await loadPokemonDetails(data.results);
    setLoadMoreButton(false);
    isLoading = false;
}

async function loadMorePokemon() {
    await loadPokemonList();
}

function setLoadMoreButton(isDisabled) {
    let button = document.getElementById("loadMoreButton");

    button.disabled = isDisabled;
    button.textContent = isDisabled ? "Loading..." : "Load more";
}

function updateSearchButton() {
    let searchLength = getSearchInputValue().length;
    document.getElementById("searchButton").disabled = searchLength > 0 && searchLength < 3;
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
    renderCurrentPokemon();
}


/**
 * Lädt ein einzelnes Pokemon mit allen Details.
 */
async function loadSinglePokemon(url) {
    let response = await fetch(url);
    let pokemon = await response.json();

    loadedPokemon.push(pokemon);
    updateMaxStatsCacheFromApi(pokemon);
    preloadPokemonImage(pokemon);

    console.log("Geladenes Pokémon:", pokemon.name);
}

function preloadPokemonImage(pokemon) {
    let image = new Image();

    image.src = getPokemonDetailImageUrl(pokemon);
}

function updateMaxStatsCacheFromApi(pokemon) {
    for (let i = 0; i < pokemon.stats.length; i++) {
        cacheMaxStat(pokemon.stats[i]);
    }
}

function cacheMaxStat(stat) {
    let statName = stat.stat.name;
    let currentMax = maxStatsCache[statName] || 0;

    maxStatsCache[statName] = Math.max(currentMax, stat.base_stat);
}

function getCachedMaxStat(statName) {
    return maxStatsCache[statName] || 1;
}

function getStatBarPercent(stat) {
    return Math.min(stat.base_stat / getCachedMaxStat(stat.stat.name) * 100, 100);
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

    if (pokemonList.length === 0) {
        pokedex.innerHTML = getNotFoundTemplate();
        return;
    }

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
    renderCurrentPokemon();

    console.log("Aktive Typen:", selectedTypes);
}


/**
 * Rendert nur passende Pokemon.
 */
function renderFilteredPokemon() {
    renderCurrentPokemon();
}

function renderCurrentPokemon() {
    renderPokemonCards(getVisiblePokemon());
}

function searchPokemon() {
    let searchValue = getSearchInputValue();

    if (searchValue.length > 0 && searchValue.length < 3) {
        return;
    }

    currentSearch = searchValue;
    renderCurrentPokemon();
}

function handleSearchInput() {
    updateSearchButton();

    if (getSearchInputValue() === "") {
        searchPokemon();
    }
}

function getSearchInputValue() {
    return document.getElementById("searchInput").value.toLowerCase().trim();
}

function clearSearchInput() {
    document.getElementById("searchInput").value = "";
    currentSearch = "";
    updateSearchButton();
    renderCurrentPokemon();
}

function getVisiblePokemon() {
    return loadedPokemon.filter(hasSelectedType).filter(matchesSearch);
}


/**
 * Prüft, ob ein Pokémon einen aktiven Typ besitzt.
 */
function hasSelectedType(pokemon) {
    if (selectedTypes.length === 0) {
        return true;
    }

    let pokemonTypes = getPokemonTypeNames(pokemon);

    return selectedTypes.some(type =>
        pokemonTypes.includes(type)
    );
}

function matchesSearch(pokemon) {
    return pokemon.name.includes(currentSearch);
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
    let pokemon = getPokemonById(pokemonId);
    let dialog = document.getElementById("pokemonDialog");

    currentDialogIndex = getDialogPokemonIndex(pokemonId);
    dialog.innerHTML = getPokemonDetailCardTemplate(pokemon);
    document.body.classList.add("dialog-open");
    dialog.showModal();
}

function getDialogPokemonIndex(pokemonId) {
    return getVisiblePokemon().findIndex(pokemon => pokemon.id === pokemonId);
}

function getPokemonById(pokemonId) {
    return loadedPokemon.find(pokemon => pokemon.id === pokemonId);
}

function closePokemonDialog() {
    document.getElementById("pokemonDialog").close();
}

function handleDialogClose() {
    document.body.classList.remove("dialog-open");
}

function closeDialogOnBackdrop(event) {
    if (event.target.id === "pokemonDialog") {
        closePokemonDialog();
    }
}

function showNextPokemon() {
    showPokemonByStep(1);
}

function showPreviousPokemon() {
    showPokemonByStep(-1);
}

function showPokemonByStep(step) {
    let pokemonList = getVisiblePokemon();

    currentDialogIndex = (currentDialogIndex + step + pokemonList.length) % pokemonList.length;
    document.getElementById("pokemonDialog").innerHTML = getPokemonDetailCardTemplate(pokemonList[currentDialogIndex]);
}
