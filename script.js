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
    let response = await fetch(getPokemonListUrl());
    let data = await response.json();
    await loadPokemonDetails(data.results);
    setLoadMoreButton(false);
    isLoading = false;
}

async function loadMorePokemon() {
    if (selectedTypes.length > 0) return loadMoreTypeFilterPokemon();
    return loadPokemonList();
}

function setLoadMoreButton(isDisabled) {
    let button = document.getElementById("loadMoreButton");
    button.disabled = isDisabled;
    button.innerHTML = getLoadingButtonContent(isDisabled);
}

function getLoadingButtonContent(isLoading) {
    if (!isLoading) return "Load more";
    return `<span class="button-loader"></span>Loading...`;
}

function getPokemonListUrl() {
    return BASE_URL + `pokemon?limit=${pokemonLimit}&offset=${currentOffset}`;
}

async function loadPokemonDetails(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        await loadSinglePokemon(pokemonList[i].url);
    }
    currentOffset += pokemonLimit;
    renderCurrentPokemon();
}

async function loadSinglePokemon(url) {
    let response = await fetch(url);
    let pokemon = await response.json();
    loadedPokemon.push(pokemon);
    updateMaxStatsCacheFromApi(pokemon);
    preloadPokemonImage(pokemon);
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
    updateLoadMoreButtonVisibility();
}

function updateLoadMoreButtonVisibility() {
    document.querySelector(".load-more-wrapper").hidden = shouldHideLoadMore();
}

function shouldHideLoadMore() {
    if (currentSearch !== "") return true;
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

async function renderEvolutionTab(pokemon) {
    let evolutionNames = await getPokemonEvolutionNames(pokemon);
    updateTabContent(pokemon, evolutionNames);
}

async function getPokemonEvolutionNames(pokemon) {
    if (evolutionCache[pokemon.id]) return evolutionCache[pokemon.id];
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
