
type output = {
    p: number;
    str: string;
}

class ExpansionRule {
    pToOutput: output[];  // [[p() assignment, output string], ...]

    constructor(probs: output[]) {
        // probs: [[p(), output string], ...]
        this.pToOutput = [];
        var total = 0.;
        for (let i = 0; i < probs.length; i++) {
            total += probs[i].p;
            this.pToOutput.push({p: total, str: probs[i].str})
        }

        if (total > 1.) {
            console.log('ExpansionRule: total probability > 1.0')
        }
    }

    getOutput(): string {
        const rand = Math.random();
        for (let i = 0; i < this.pToOutput.length; i++) {
            if (rand <= this.pToOutput[i].p) {
                return this.pToOutput[i].str;
            }
        }
        return 'ERROR: probabilities are off?';
    }
}

export default ExpansionRule