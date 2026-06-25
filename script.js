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
let activeDetailTab = "about";
let evolutionCache = {};
/**
 * Starts the app.
 * Called by onload="init()" in index.html.
 */
function init() {
    console.log("App started");
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
 * Loads the next list of Pokemon.
 */
async function loadPokemonList() {
    if (isLoading) {
        return;
    }
    isLoading = true;
    setLoadMoreButton(true);
    console.log("Loading Pokemon from offset:", currentOffset);
    let response = await fetch(getPokemonListUrl());
    let data = await response.json();
    console.log("Loaded Pokemon list:", data.results);
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
    button.innerHTML = getLoadingButtonContent(isDisabled);
}
function getLoadingButtonContent(isLoading) {
    if (!isLoading) {
        return "Load more";
    }
    return `<span class="button-loader"></span>Loading...`;
}
function updateSearchButton() {
    let searchLength = getSearchInputValue().length;
    document.getElementById("searchButton").disabled = searchLength > 0 && searchLength < 3;
}
/**
 * Builds the URL for the Pokemon list.
 */
function getPokemonListUrl() {
    return BASE_URL + `pokemon?limit=${pokemonLimit}&offset=${currentOffset}`;
}
/**
 * Loads the detail data for each Pokemon in the list.
 */
async function loadPokemonDetails(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        await loadSinglePokemon(pokemonList[i].url);
    }
    currentOffset += pokemonLimit;
    renderCurrentPokemon();
}
/**
 * Loads one Pokemon with all needed details.
 */
async function loadSinglePokemon(url) {
    let response = await fetch(url);
    let pokemon = await response.json();
    loadedPokemon.push(pokemon);
    updateMaxStatsCacheFromApi(pokemon);
    preloadPokemonImage(pokemon);
    console.log("Loaded Pokemon:", pokemon.name);
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
 * Renders one Pokemon card.
 */
function renderPokemonCard(pokemon) {
    let pokedex = document.getElementById("pokedex");
    pokedex.innerHTML += getPokemonCardTemplate(pokemon);
}
/**
 * Renders all visible Pokemon cards again.
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
 * Loads all Pokemon types for the filter.
 */
async function loadPokemonTypes() {
    let response = await fetch(BASE_URL + "type");
    let data = await response.json();
    let types = getValidTypes(data.results);
    console.log("Available types:", types);
    renderTypeFilter(types);
}
/**
 * Removes types that should not be shown.
 */
function getValidTypes(types) {
    return types.filter(type =>
        type.name !== "unknown" && type.name !== "shadow"
    );
}
/**
 * Renders the filter buttons.
 */
function renderTypeFilter(types) {
    let typeFilter = document.getElementById("typeFilter");
    typeFilter.innerHTML = "";
    for (let i = 0; i < types.length; i++) {
        typeFilter.innerHTML += getTypeFilterButtonTemplate(types[i].name);
    }
}
/**
 * Toggles one type filter.
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
 * Removes one active type from the filter.
 */
function removeSelectedType(typeName) {
    selectedTypes = selectedTypes.filter(type => type !== typeName);
}
/**
 * Updates filter buttons and the Pokemon list.
 */
function updateTypeFilter() {
    updateTypeButtonStyles();
    renderCurrentPokemon();
    console.log("Active types:", selectedTypes);
}
/**
 * Renders only matching Pokemon.
 */
function renderFilteredPokemon() {
    renderCurrentPokemon();
}
function renderCurrentPokemon() {
    renderPokemonCards(getVisiblePokemon());
    updateLoadMoreButtonVisibility();
}
function updateLoadMoreButtonVisibility() {
    document.querySelector(".load-more-wrapper").hidden = hasActiveFilter();
}
function hasActiveFilter() {
    return currentSearch !== "" || selectedTypes.length > 0;
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
 * Checks if a Pokemon has one selected type.
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
 * Gets all type names from one Pokemon.
 */
function getPokemonTypeNames(pokemon) {
    return pokemon.types.map(typeSlot => typeSlot.type.name);
}
/**
 * Updates all filter button styles.
 */
function updateTypeButtonStyles() {
    let buttons = document.querySelectorAll(".type-filter-button");
    for (let i = 0; i < buttons.length; i++) {
        updateSingleTypeButton(buttons[i]);
    }
}
/**
 * Sets the active state on one button.
 */
function updateSingleTypeButton(button) {
    let typeName = button.dataset.type;
    button.classList.toggle("active", selectedTypes.includes(typeName));
}
/**
 * Opens the large Pokemon detail view.
 */
function openPokemonDialog(pokemonId) {
    let pokemon = getPokemonById(pokemonId);
    let dialog = document.getElementById("pokemonDialog");
    activeDetailTab = "about";
    currentDialogIndex = getDialogPokemonIndex(pokemonId);
    renderPokemonDialog(pokemon);
    document.body.classList.add("dialog-open");
    dialog.showModal();
}
function renderPokemonDialog(pokemon, evolutionNames = []) {
    document.getElementById("pokemonDialog").innerHTML =
        getPokemonDetailCardTemplate(pokemon, activeDetailTab, evolutionNames);
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
async function switchDetailTab(pokemonId, tabName) {
    let pokemon = getPokemonById(pokemonId);
    activeDetailTab = tabName;
    renderPokemonDialog(pokemon);
    if (tabName === "evolution") {
        await renderEvolutionTab(pokemon);
    }
}
async function renderEvolutionTab(pokemon) {
    let evolutionNames = await getPokemonEvolutionNames(pokemon);
    renderPokemonDialog(pokemon, evolutionNames);
}
async function getPokemonEvolutionNames(pokemon) {
    if (evolutionCache[pokemon.id]) {
        return evolutionCache[pokemon.id];
    }
    evolutionCache[pokemon.id] = await fetchEvolutionNames(pokemon);
    return evolutionCache[pokemon.id];
}
async function fetchEvolutionNames(pokemon) {
    let species = await fetchJson(pokemon.species.url);
    let evolution = await fetchJson(species.evolution_chain.url);
    return getEvolutionChainNames(evolution.chain);
}
async function fetchJson(url) {
    let response = await fetch(url);
    return await response.json();
}
function getEvolutionChainNames(chain) {
    let names = [capitalizeWords(chain.species.name)];
    for (let i = 0; i < chain.evolves_to.length; i++) {
        names = names.concat(getEvolutionChainNames(chain.evolves_to[i]));
    }
    return names;
}
function showNextPokemon() {
    showPokemonByStep(1);
}
function showPreviousPokemon() {
    showPokemonByStep(-1);
}
function showPokemonByStep(step) {
    let pokemonList = getVisiblePokemon();
    activeDetailTab = "about";
    currentDialogIndex = (currentDialogIndex + step + pokemonList.length) % pokemonList.length;
    renderPokemonDialog(pokemonList[currentDialogIndex]);
}
