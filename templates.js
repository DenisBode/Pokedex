function getPokemonCardTemplate(pokemon) {
    let mainType = pokemon.types[0].type.name;

    return `
        <button class="pokemon-card type-${mainType}" data-id="card" onclick="openPokemonDialog(${pokemon.id})">
            <h2>${capitalizeFirstLetter(pokemon.name)}</h2>

            <img 
                data-id="card-image"
                src="${pokemon.sprites.front_default}" 
                alt="${pokemon.name}"
            >

            <div class="pokemon-types">
                ${getPokemonTypesTemplate(pokemon.types)}
            </div>

            <p>#${pokemon.id}</p>
        </button>
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