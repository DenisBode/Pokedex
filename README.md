# Pokedex

Ein kleines Pokedex-Projekt, das Pokemon-Daten aus der PokeAPI laedt und als responsive Kartenuebersicht darstellt. Per Klick auf eine Karte oeffnet sich eine Detailansicht mit Bild, Typen, Basisdaten, Faehigkeiten und Stat-Balken.

## Verwendete Technologien

- HTML
- CSS
- JavaScript
- PokeAPI: https://pokeapi.co/

## Funktionen

- Laedt beim Start 20 Pokemon
- Weitere Pokemon koennen ueber den `Load more` Button geladen werden
- Sichtbarer Loading-Button mit Spinner waehrend neue Pokemon geladen werden
- Filterung nach Pokemon-Typen
- Suche nach Pokemon-Namen ab 3 Zeichen
- Clear-Button direkt in der Suchleiste
- Detailansicht als Overlay
- Navigation in der Detailansicht mit Previous/Next
- Moderne Stat-Balken, die mit den hoechsten bisher geladenen Stat-Werten verglichen werden
- Responsive Layout bis 320px Breite
- Favicon und Header-Logo

## Extras

- Detailbilder werden vorgeladen, damit sie beim Oeffnen schneller sichtbar sind
- Stat-Balken vergleichen jeden Wert mit dem hoechsten bisher geladenen Wert
- Type-Filter koennen miteinander kombiniert werden
- Suchfeld kann direkt ueber den Button im Input geleert werden
- Das Overlay kann ueber den Close-Button, Escape oder Klick neben die Karte geschlossen werden

## Installation

Es werden keine zusaetzlichen Pakete benoetigt.

1. Repository klonen oder Projektordner herunterladen
2. `index.html` im Browser oeffnen

Alternativ kann das Projekt mit einem lokalen Live-Server gestartet werden, zum Beispiel ueber die Live Server Extension in VS Code.

## Projektstruktur

```text
.
|-- assets/
|   `-- pokeball.svg
|-- styles/
|   |-- pokemon-card.css
|   |-- pokemon-types.css
|   |-- responsive.css
|   |-- standard.css
|   `-- type-filter.css
|-- index.html
|-- script.js
|-- style.css
`-- templates.js
```

## Hinweise

Die Daten kommen direkt aus der PokeAPI. Bereits geladene Pokemon werden lokal im JavaScript zwischengespeichert, damit Filter, Suche und Detailansicht nicht unnoetig neue Requests ausloesen.

Die maximale Stat-Anzeige basiert auf den Pokemon, die bisher geladen wurden. Wenn weitere Pokemon geladen werden, werden die Max-Werte automatisch erweitert.
