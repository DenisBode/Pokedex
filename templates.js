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


function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function capitalizeWords(text) {
    return text
        .split("-")
        .map(word => capitalizeFirstLetter(word))
        .join(" ");
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
            ${getPokemonDetailContentTemplate(pokemon, activeTab, evolutionNames)}
        </article>
    `;
}

function getPokemonDetailImageUrl(pokemon) {
    return pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
}

function getPokemonDialogButtonsTemplate() {
    return `
        <button class="pokemon-detail-close" data-id="close-dialog-button" onclick="closePokemonDialog()">x</button>
        <div class="dialog-nav">
        <button class="dialog-nav-button dialog-nav-prev" data-id="prev-button" onclick="showPreviousPokemon()">‹</button>
        <button class="dialog-nav-button dialog-nav-next" data-id="next-button" onclick="showNextPokemon()">›</button>
        </div>
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
        <button class="detail-tab ${getActiveTabClass(tabName, activeTab)}" onclick="switchDetailTab(${pokemonId}, '${tabName}')">
            ${capitalizeWords(tabName)}
        </button>
    `;
}

function getActiveTabClass(tabName, activeTab) {
    return tabName === activeTab ? "active" : "";
}

function getPokemonDetailContentTemplate(pokemon, activeTab, evolutionNames) {
    if (activeTab === "evolution") {
        return getPokemonEvolutionTemplate(evolutionNames);
    }

    if (activeTab === "moves") {
        return getPokemonMovesTemplate(pokemon);
    }

    return activeTab === "base-stats" ? getPokemonStatsSectionTemplate(pokemon) : getPokemonAboutTemplate(pokemon);
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
            ${getPokemonDetailInfoTemplate("Height", pokemon.height / 10 + " m")}
            ${getPokemonDetailInfoTemplate("Weight", pokemon.weight / 10 + " kg")}
        </div>
    `;
}

function getPokemonAbilitiesSectionTemplate(pokemon) {
    return `
        <section class="pokemon-detail-section">
            <h3>Abilities</h3>
            <p>${getPokemonAbilitiesTemplate(pokemon.abilities)}</p>
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

function getPokemonAbilitiesTemplate(abilities) {
    return abilities
        .map(ability => capitalizeWords(ability.ability.name))
        .join(", ");
}

function getPokemonEvolutionTemplate(evolutionNames) {
    if (evolutionNames.length === 0) {
        return getDetailLoadingTemplate();
    }

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

function getPokemonMovesTemplate(pokemon) {
    return `
        <section class="pokemon-detail-section">
            <h3>Moves</h3>
            <div class="moves-list">${getMoveItemsTemplate(pokemon.moves)}</div>
        </section>
    `;
}

function getMoveItemsTemplate(moves) {
    let movesHtml = "";

    for (let i = 0; i < Math.min(moves.length, 12); i++) {
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
