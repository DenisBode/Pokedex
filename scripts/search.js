function updateSearchButton() {
    let searchLength = getSearchInputValue().length;
    document.getElementById("searchButton").disabled = searchLength > 0 && searchLength < 3;
}

function searchPokemon() {
    let searchValue = getSearchInputValue();
    if (searchValue.length > 0 && searchValue.length < 3) return;
    currentSearch = searchValue;
    renderCurrentPokemon();
}

function handleSearchInput() {
    updateSearchButton();
    if (getSearchInputValue() === "") searchPokemon();
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

function matchesSearch(pokemon) {
    return pokemon.name.includes(currentSearch);
}
