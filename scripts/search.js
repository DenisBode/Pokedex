// Disables the search button while input is between 1 and 2 characters
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

// Also triggers search when the field is cleared (empty string)
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
    u