const BASE_URL = "https://pokeapi.co/api/v2/";
let currentOffset = 0;
let pokemonLimit = 20;
let loadedPokemon = [];
let selectedTypes = [];
let currentSearch = "";
let currentDialogIndex = 0;
let isLoading = false;
let maxStatsCache = {};
let activeDetailTab = "about";
let evolutionCache = {};
let typeFilterUrls = [];

function init() {
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

async function loadPokemonList() {
    if (isLoading) return;
    isLoading = true;
    setLoadMoreButton(true);
    try {
        let response = await fetch(getPokemonListUrl());
        let data = await response.json();
        await loadPokemonDetails(data.results);
    } catch (error) {
        renderError("Failed to load Pokémon. Please try again.");
    } finally {
        setLoadMoreButton(false);
        isLoading = false;
    }
}

// Routes to loadMoreTypeFilterPokemon when a type filter is active
async function loadMorePokemon() {
    if (selectedTypes.length > 0) return loadMoreTypeFilterPokemon();
    return loadPokemonList();
}

function setLoadMoreButton(loading) {
    let button = document.getElementById("loadMoreButton");
    button.disabled = loading || isLoadMoreExhausted();
    button.innerHTML = getLoadingButtonContent(loading);
}

function getLoadingButtonContent(loading) {
    if (!loading) return "Load more";
    return `<span class="button-loader"></span>Loading...`;
}

function getPokemonListUrl() {
    return BASE_URL + `pokemon?limit=${pokemonLimit}&offset=${currentOffset}`;
}

// Loads details sequentially, advances offset, then re-renders
async function loadPokemonDetails(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        await loadSinglePokemon(pokemonList[i].url);
    }
    currentOffset += pokemonLimit;
    renderCurrentPokemon();
}

async function loadSinglePokemon(url) {
    try {
        let response = await fetch(url);
        let pokemon = await response.json();
        loadedPokemon.push(pokemon);
        updateMaxStatsCacheFromApi(pokemon);
        preloadPokemonImage(pokemon);
    } catch (error) {
        renderError("A Pokémon could not be loaded.");
    }
}

function preloadPokemonImage(pokemon) {
    let image = new Image();
    image.src = getPokemonDetailImageUrl(pokemon);
}

// Updates maxStatsCache for every stat of a Pokémon — used to scale stat bars
function updateMaxStatsCacheFromApi(pokemon) {
    for (let i = 0; i < pokemon.stats.length; i++) {
        cacheMaxStat(pokemon.stats[i]);
    }
}

// Tracks the running maximum per stat name across all loaded Pokémon
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

function renderError(message) {
    document.getElementById("pokedex").innerHTML = `<p class="not-found">${message}</p>`;
}

function renderPokemonCard(pokemon) {
    let pokedex = document.getElementById("pokedex");
    pokedex.innerHTML += getPokemonCardTemplate(pokemon);
}

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

function renderCurrentPokemon() {
    renderPokemonCards(getVisiblePokemon());
    updateLoadMoreState();
}

function updateLoadMoreState() {
    document.querySelector(".load-more-wrapper").hidden = false;
    document.getElementById("loadMoreButton").disabled = isLoadMoreExhausted();
}

// Returns true when no further loading would change the visible result
function isLoadMoreExhausted() {
    if (currentSearch !== "") return getVisiblePokemon().length < pokemonLimit;
    if (selectedTypes.length === 0) return false;
    return typeFilterUrls.every(url => isPokemonLoaded(getIdFromUrl(url)));
}

function getVisiblePokemon() {
    return loadedPokemon.filter(hasSelectedType).filter(matchesSearch);
}

function openPokemonDialog(pokemonId) {
    let pokemon = getPokemonById(pokemonId);
    let dialog = document.getElementById("pokemonDialog");
    activeDetailTab = "about";
    currentDialogIndex = getDialogPokemonIndex(pokemonId);
    renderPokemonDialog(pokemon);
    document.body.classList.add("dialog-open");
    dialog.showModal();
}

function getActiveTabClass(tabName, activeTab) {
    return tabName === activeTab ? "active" : "";
}

// Routes to the correct tab template; shows loading state for evolution until names are fetched
function getPokemonDetailContentTemplate(pokemon, activeTab, evolutionNames) {
    if (activeTab === "evolution") {
        return evolutionNames.length === 0
            ? getDetailLoadingTemplate()
            : getPokemonEvolutionTemplate(evolutionNames);
    }
    if (activeTab === "moves") return getPokemonMovesTemplate(pokemon);
    return activeTab === "base-stats"
        ? getPokemonStatsSectionTemplate(pokemon)
        : getPokemonAboutTemplate(pokemon);
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
    if (event.target.id === "pokemonDialog") closePokemonDialog();
}

// Updates active tab state, then lazily fetches evolution data if that tab is selected
async function switchDetailTab(pokemonId, tabName) {
    let pokemon = getPokemonById(pokemonId);
    activeDetailTab = tabName;
    updateTabButtonStyles(tabName);
    updateTabContent(pokemon);
    if (tabName === "evolution") await renderEvolutionTab(pokemon);
}

function updateTabButtonStyles(tabName) {
    let buttons = document.querySelectorAll("[data-tab]");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("active", buttons[i].dataset.tab === tabName);
    }
}

function updateTabContent(pokemon, evolutionNames = []) {
    document.querySelector("[data-id='tab-content']").innerHTML =
        getPokemonDetailContentTemplate(pokemon, activeDetailTab, evolutionNames);
}

// Fetches evolution names and passes them to updateTabContent
async function renderEvolutionTab(pokemon) {
    let evolutionNames = await getPokemonEvolutionNames(pokemon);
    updateTabContent(pokemon, evolutionNames);
}

// Returns cached evolution names or fetches and caches them
async function getPokemonEvolutionNames(pokemon) {
    if (evolutionCache[pokemon.id]) return evolutionCache[pokemon.id];
    evolutionCache[pokemon.id] = await fetchEvolutionNames(pokemon);
    return evolutionCache[pokemon.id];
}

// Chains species fetch → evolution chain fetch → name extraction
async function fetchEvolutionNames(pokemon) {
    let species = await fetchJson(pokemon.species.url);
    let evolution = await fetchJson(species.evolution_chain.url);
    return getEvolutionChainNames(evolution.chain);
}

async function fetchJson(url) {
    let response = await fetch(url);
    return await response.json();
}

// Recursively walks the evolution chain tree and collects stage names
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

// Advances dialog by step, wraps around at both ends of the visible list
function showPokemonByStep(step) {
    let pokemonList = getVisiblePokemon();
    activeDetailTab = "about";
    currentDialogIndex = (currentDialogIndex + step + pokemonList.length) % pokemonList.length;
    renderPokemonDialog(pokemonList[currentDialogIndex]);
}
