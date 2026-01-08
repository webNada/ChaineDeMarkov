export const nodes = {
    1: { label: "🎈", name: "Ballon", x: 350, y: 40 },
    2: { label: "🏖️", name: "Sable", x: 550, y: 40 },
    3: { label: "🌳", name: "Cache-cache", x: 350, y: 180 },
    4: { label: "🛝", name: "Toboggan", x: 550, y: 180 },
    // Emoji changé pour la balançoire (plus cohérent)
    5: { label: "🪑", name: "Balançoire", x: 350, y: 320 },
    6: { label: "🚂", name: "Trains", x: 550, y: 320 }
};

// Directed transitions (edges) pour correspondre exactement aux spécifications :
// Bidirectionnelles (↔): 1↔2, 2↔4, 3↔4, 4↔6, 5↔4
// Unidirectionnelles (→): 5→1, 6→1
// REMOVED: 1→3 (ballon→cache-cache), 3→5 (cache-cache→balançoire)
export const edges = {
    1: [2, 5, 6],      // 1 ↔ 2, 1 ← 5, 1 ← 6
    2: [1, 4],         // 1 ↔ 2, 2 ↔ 4
    3: [4],            // 3 ↔ 4
    4: [2, 3, 5, 6],   // 2 ↔ 4, 3 ↔ 4, 5 ↔ 4, 4 ↔ 6
    5: [4, 1],         // 5 ↔ 4, 5 → 1
    6: [4, 1]          // 6 ↔ 4, 6 → 1
};

export function renderNodes(parent) {
    Object.entries(nodes).forEach(([id, obj]) => {
        const div = document.createElement("div");
        div.className = "game-node";
        div.setAttribute('data-id', id);
        div.style.left = obj.x + "px";
        div.style.top = obj.y + "px";
        div.textContent = obj.label;
        parent.appendChild(div);
    });
}