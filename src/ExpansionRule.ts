

class ExpansionRule {
    pToOutput: number[][];  // [[p() assignment, output string], ...]

    constructor(probs: number[][]) {
        // probs: [[p(), output string], ...]
        this.pToOutput = [];
        var total = 0.;
        for (let i = 0; i < probs.length; i++) {
            total += probs[i][0];
            this.pToOutput.push([total, probs[i][1]])
        }

        if (total > 1.) {
            console.log('ExpansionRule: total probability > 1.0')
        }
    }

    getOutput() {
        const rand = Math.random();
        for (let i = 0; i < this.pToOutput.length; i++) {
            if (rand <= this.pToOutput[i][0]) {
                return this.pToOutput[i][1]
            }
        }
        return 'ERROR: probabilities are off?';
    }
}

export default ExpansionRule