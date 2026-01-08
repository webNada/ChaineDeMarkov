export class MarkovEngine {

    constructor() {
        this.current = 1;
        this.steps = 20;
        this.speed = 500;
        this.running = false;

        // CORRECTION : Ces transitions correspondent exactement aux spécifications :
        // Bidirectionnelles (↔): 1↔2, 2↔4, 3↔4, 4↔6, 5↔4
        // Unidirectionnelles (→): 5→1, 6→1
        // REMOVED: 1→3 (ballon→cache-cache), 3→5 (cache-cache→balançoire)
        this.transitions = {
            1: [2, 5, 6],       // 1 ↔ 2, 1 ← 5, 1 ← 6
            2: [1, 4],          // 1 ↔ 2, 2 ↔ 4
            3: [4],             // 3 ↔ 4
            4: [2, 3, 5, 6],    // 2 ↔ 4, 3 ↔ 4, 5 ↔ 4, 4 ↔ 6
            5: [4, 1],          // 5 ↔ 4, 5 → 1
            6: [4, 1]           // 6 ↔ 4, 6 → 1
        };
    }

    setSteps(n) { this.steps = n; }
    setSpeed(v) { this.speed = v; }

    setVisitCallback(cb) { this._visitCb = cb; }
    setStepCallback(cb) { this._stepCb = cb; }

    stop() { this.running = false; }

    async start(moveFn) {
        if (this.running) return;
        this.running = true;

        let remaining = this.steps;
        if (this._stepCb) this._stepCb(remaining);

        if (typeof moveFn === 'function') {
            await moveFn(this.current, 0);
        }

        for (let i = 0; i < this.steps; i++) {
            if (!this.running) break;

            await new Promise(res => setTimeout(res, this.speed));
            if (!this.running) break;

            const choices = this.transitions[this.current] || [];
            if (!choices.length) break;

            this.current = choices[Math.floor(Math.random() * choices.length)];
            if (!this.running) break;

            if (typeof moveFn === 'function') {
                await moveFn(this.current, this.speed);
            }

            if (!this.running) break;

            if (this._visitCb) this._visitCb(this.current);

            remaining = Math.max(remaining - 1, 0);
            if (this._stepCb) this._stepCb(remaining);
        }

        this.running = false;
    }
}