async function loadPokemonTypes() {
    let response = await fetch(BASE_URL + "type");
    let data = await response.json();
    let types = getValidTypes(data.results);
    renderTypeFilter(types);
}

// Removes non-standard types and sorts alphabetically
function getValidTypes(types) {
    return types
        .filter(type => type.name !== "unknown" && type.name !== "shadow")
        .sort((a, b) => a.name.localeCompare(b.name));
}

function renderTypeFilter(types) {
    let typeFilter = document.getElementById("typeFilter");
    typeFilter.innerHTML = "";
    for (let i = 0; i < types.length; i++) {
        typeFilter.innerHTML += getTypeFilterButtonTemplate(types[i].name);
    }
}

function toggleTypeFilter(typeName) {
    if (selectedTypes.includes(typeName)) {
        removeSelectedType(typeName);
    } else {
        selectedTypes.push(typeName);
    }
    updateTypeFilter();
}

function removeSelectedType(typeName) {
    selectedTypes = selectedTypes.filter(type => type !== typeName);
}

// Syncs button styles, then loads filtered Pokemon or resets to full list
async function updateTypeFilter() {
    updateTypeButtonStyles();
    if (selectedTypes.length > 0) {
        await loadPokemonForSelectedTypes();
    } else {
        typeFilterUrls = [];
        renderCurrentPokemon();
    }
}

// Fetches all matching URLs first, then loads the initial batch
async function loadPokemonForSelectedTypes() {
    if (isLoading) return;
    isLoading = true;
    try {
        typeFilterUrls = await getAllUrlsForSelectedTypes();
        await loadTypeFilterBatch();
    } finally {
        isLoading = false;
    }
}

// Skips already-loaded Pokemon and fetches only the next unloaded batch (up to pokemonLimit)
async function loadTypeFilterBatch() {
    let missing = typeFilterUrls.filter(url => !isPokemonLoaded(getIdFromUrl(url)));
    await Promise.allSettled(missing.slice(0, pokemonLimit).map(loadSinglePokemon));
    renderCurrentPokemon();
}

// Wraps loadTypeFilterBatch with loading state for the Load More button
async function loadMoreTypeFilterPokemon() {
    if (isLoading) return;
    isLoading = true;
    setLoadMoreButton(true);
    try {
        await loadTypeFilterBatch();
    } finally {
        setLoadMoreButton(false);
        isLoading = false;
    }
}

// Fetches URLs for all selected types in parallel, then merges and deduplicates
async function getAllUrlsForSelectedTypes() {
    let urlSets = await Promise.all(selectedTypes.map(fetchTypeUrls));
    let allUrls = urlSets.flat();
    return [...new Set(allUrls)];
}

async function fetchTypeUrls(typeName) {
    let response = await fetch(BASE_URL + "type/" + typeName);
    let data = await response.json();
    return data.pokemon.map(entry => entry.pokemon.url);
}

function isPokemonLoaded(id) {
    return loadedPokemon.some(p => p.id === id);
}

function getIdFromUrl(url) {
    let parts = url.split("/").filter(Boolean);
    return parseInt(parts[parts.length - 1]);
}

function updateTypeButtonStyles() {
    let buttons = document.querySelectorAll(".type-filter-button");
    for (let i = 0; i < buttons.length; i++) {
        updateSingleTypeButton(buttons[i]);
    }
}

function updateSingleTypeButton(button) {
    let typeName = button.dataset.type;
    button.classList.toggle("active", selectedTypes.includes(typeName));
}

function hasSelectedType(pokemon) {
    if (selectedTypes.length === 0) return true;
    let pokemonTypes = getPokemonTypeNames(pokemon);
    return selectedTypes.some(type => pokemonTypes.includes(type));
}

function getPokemonTypeNames(pokemon) {
    return pokemon.types.map(typeSlot => typeSlot.type.name);
}
