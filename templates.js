function getPokemonCardTemplate(pokemon) {
    let mainType = pokemon.types[0].type.name;
    return `
        <button class="pokemon-card type-${mainType}" data-id="card" onclick="openPokemonDialog(${pokemon.id})">
            <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
            ${getPokemonCardImageTemplate(pokemon)}
            ${getPokemonCardTypesTemplate(pokemon)}
        </button>
    `;
}

function getPokemonCardImageTemplate(pokemon) {
    return `
        <img data-id="card-image" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    `;
}

function getPokemonCardTypesTemplate(pokemon) {
    return `
        <div class="pokemon-types">
            ${getPokemonTypesTemplate(pokemon.types)}
        </div>
    `;
}

function getPokemonTypesTemplate(types) {
    let typesHtml = "";
    for (let i = 0; i < types.length; i++) {
        typesHtml += getPokemonTypeTemplate(types[i].type.name);
    }
    return typesHtml;
}

function getPokemonTypeTemplate(typeName) {
    return `
        <span class="pokemon-type-badge type-${typeName}">
            ${capitalizeFirstLetter(typeName)}
        </span>
    `;
}

function getTypeFilterButtonTemplate(typeName) {
    return `
        <button 
            class="type-filter-button type-${typeName}" 
            data-type="${typeName}"
            onclick="toggleTypeFilter('${typeName}')"
        >
            ${capitalizeFirstLetter(typeName)}
        </button>
    `;
}

function getNotFoundTemplate() {
    return `
        <p class="not-found" data-id="not-found">
            No matching Pokémon found.
        </p>
    `;
}

function getPokemonDetailCardTemplate(pokemon, activeTab = "about", evolutionNames = []) {
    let mainType = pokemon.types[0].type.name;
    return `
        <article class="pokemon-detail-card type-${mainType}" data-id="overlay-pokemon-name">
            ${getPokemonDialogButtonsTemplate()}
            ${getPokemonDetailHeaderTemplate(pokemon)}
            ${getPokemonDetailImageTemplate(pokemon)}
            ${getPokemonDetailTabsTemplate(pokemon, activeTab)}
            <div data-id="tab-content">
                ${getPokemonDetailContentTemplate(pokemon, activeTab, evolutionNames)}
            </div>
        </article>
    `;
}

function getPokemonDialogButtonsTemplate() {
    return `
        ${getPokemonCloseButtonTemplate()}
        ${getPokemonDialogNavTemplate()}
    `;
}

function getPokemonCloseButtonTemplate() {
    return `
        <button class="pokemon-detail-close" data-id="close-dialog-button" onclick="closePokemonDialog()">x</button>
    `;
}

function getPokemonDialogNavTemplate() {
    return `
        <div class="dialog-nav">
            ${getPokemonDialogNavButtonTemplate("prev", "showPreviousPokemon()", "Prev")}
            ${getPokemonDialogNavButtonTemplate("next", "showNextPokemon()", "Next")}
        </div>
    `;
}

function getPokemonDialogNavButtonTemplate(direction, action, label) {
    return `
        <button class="dialog-nav-button dialog-nav-${direction}" data-id="${direction}-button" onclick="${action}">${label}</button>
    `;
}

function getPokemonDetailHeaderTemplate(pokemon) {
    return `
        <div class="pokemon-detail-header">
            <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
            <div class="pokemon-types">${getPokemonTypesTemplate(pokemon.types)}</div>
        </div>
    `;
}

function getPokemonDetailImageTemplate(pokemon) {
    return `
        <img class="pokemon-detail-image" data-id="dialog-image" src="${getPokemonDetailImageUrl(pokemon)}" alt="${pokemon.name}" loading="eager">
    `;
}

function getPokemonDetailTabsTemplate(pokemon, activeTab) {
    return `
        <div class="detail-tabs">
            ${getDetailTabButtonTemplate(pokemon.id, "about", activeTab)}
            ${getDetailTabButtonTemplate(pokemon.id, "base-stats", activeTab)}
            ${getDetailTabButtonTemplate(pokemon.id, "evolution", activeTab)}
            ${getDetailTabButtonTemplate(pokemon.id, "moves", activeTab)}
        </div>
    `;
}

function getDetailTabButtonTemplate(pokemonId, tabName, activeTab) {
    return `
        <button class="detail-tab ${getActiveTabClass(tabName, activeTab)}" data-tab="${tabName}" onclick="switchDetailTab(${pokemonId}, '${tabName}')">
            ${capitalizeWords(tabName)}
        </button>
    `;
}

function getPokemonAboutTemplate(pokemon) {
    return `
        ${getPokemonDetailFactsTemplate(pokemon)}
        ${getPokemonAbilitiesSectionTemplate(pokemon)}
    `;
}

function getPokemonDetailFactsTemplate(pokemon) {
    return `
        <div class="pokemon-detail-info">
            ${getPokemonDetailInfoTemplate("Height", formatHeight(pokemon))}
            ${getPokemonDetailInfoTemplate("Weight", formatWeight(pokemon))}
        </div>
    `;
}

function getPokemonAbilitiesSectionTemplate(pokemon) {
    return `
        <section class="pokemon-detail-section">
            <h3>Abilities</h3>
            <p>${formatAbilities(pokemon.abilities)}</p>
        </section>
    `;
}

function getPokemonStatsSectionTemplate(pokemon) {
    return `
        <section class="pokemon-detail-section">
            <h3>Base stats</h3>
            ${getPokemonStatsTemplate(pokemon.stats)}
        </section>
    `;
}

function getPokemonDetailInfoTemplate(label, value) {
    return `
        <div>
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `;
}


function getPokemonEvolutionTemplate(evolutionNames) {
    return `
        <section class="pokemon-detail-section">
            <h3>Evolution</h3>
            <div class="evolution-chain">${getEvolutionItemsTemplate(evolutionNames)}</div>
        </section>
    `;
}

function getDetailLoadingTemplate() {
    return `
        <section class="pokemon-detail-section detail-loading">
            <span class="button-loader"></span>
            <p>Loading evolution...</p>
        </section>
    `;
}

function getEvolutionItemsTemplate(evolutionNames) {
    let evolutionHtml = "";
    for (let i = 0; i < evolutionNames.length; i++) {
        evolutionHtml += getEvolutionItemTemplate(evolutionNames[i], i);
    }
    return evolutionHtml;
}

function getEvolutionItemTemplate(name, index) {
    return `
        <div class="evolution-item">
            <span>Stage ${index + 1}</span>
            <strong>${name}</strong>
        </div>
    `;
}

function getPokemonMovesTemplate(moves) {
    return `
        <section class="pokemon-detail-section">
            <h3>Moves</h3>
            <div class="moves-list">${getMoveItemsTemplate(moves)}</div>
        </section>
    `;
}

function getMoveItemsTemplate(moves) {
    let movesHtml = "";
    for (let i = 0; i < moves.length; i++) {
        movesHtml += getMoveItemTemplate(moves[i], i);
    }
    return movesHtml;
}

function getMoveItemTemplate(moveSlot, index) {
    return `
        <div class="move-item">
            <span>#${index + 1}</span>
            <strong>${capitalizeWords(moveSlot.move.name)}</strong>
        </div>
    `;
}

function getPokemonStatsTemplate(stats) {
    let statsHtml = "";
    for (let i = 0; i < stats.length; i++) {
        statsHtml += getPokemonStatTemplate(stats[i]);
    }
    return statsHtml;
}

function getPokemonStatTemplate(stat) {
    return `
        <div class="pokemon-stat">
            ${getPokemonStatBarTemplate(stat)}
            <div class="pokemon-stat-header">
                <span>${capitalizeWords(stat.stat.name)}</span>
                <strong>${stat.base_stat} / ${getCachedMaxStat(stat.stat.name)}</strong>
            </div>
        </div>
    `;
}

function getPokemonStatBarTemplate(stat) {
    return `
        <div class="pokemon-stat-fill" style="width: ${getStatBarPercent(stat)}%"></div>
    `;
}
