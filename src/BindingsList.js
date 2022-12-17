"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BindingsList {
    constructor() {
        this.bindings = [];
    }
    expand(varName, valueList) {
        if (this.bindings.length === 0) {
            for (const v of valueList) {
                const newMap = new Map();
                for (let i = 0; i < varName.length; i++) {
                    let vn = varName[i];
                    let vi = v[2 * i];
                    if (vi === ',') {
                        console.log('Error');
                    }
                    newMap.set(vn, vi);
                }
                // newMap.set(varName,v)
                this.bindings.push(newMap);
            }
        }
        else {
            const oldList = this.bindings;
            this.bindings = [];
            for (const oldMap of oldList) {
                for (const v of valueList) {
                    const newMap = new Map(oldMap);
                    for (let i = 0; i < varName.length; i++) {
                        let vn = varName[i];
                        let vi = v[2 * i];
                        newMap.set(vn, vi);
                    }
                    // newMap.set(varName,v)
                    this.bindings.push(newMap);
                }
            }
        }
    }
    expandOut(varName, symbolTable, transition) {
        for (let oldMap of this.bindings) {
            for (let vn of varName) {
                if (oldMap.get(vn)) {
                    continue;
                }
                for (let fn of transition.equations.keys()) {
                    let eq = transition.equations.get(fn);
                    if ((eq === null || eq === void 0 ? void 0 : eq.result.list[0]) === vn) {
                        let fnDef = symbolTable.get(fn);
                        if (!fnDef) {
                            continue;
                        }
                        let paramVar = eq.params.list[0];
                        let paramValue = oldMap.get(paramVar) || '';
                        let ass = fnDef.value.get(paramValue);
                        if (!ass) {
                            continue;
                        }
                        try {
                            let resultValue = ass.result.list[0];
                            console.log(resultValue);
                            oldMap.set(vn, resultValue);
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                }
                console.log('t');
            }
        }
    }
    printBindingList() {
        for (let elt of this.bindings) {
            let line = '';
            for (let k of elt.keys()) {
                line += k + ' ' + elt.get(k) + ',' + '';
            }
            console.log(line);
        }
    }
}
exports.default = BindingsList;