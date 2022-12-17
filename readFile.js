"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const graphviz_cli_renderer_1 = require("@diagrams-ts/graphviz-cli-renderer");
const g = (0, ts_graphviz_1.digraph)('G');
const data = fs_1.default.readFileSync('./data/system2.hera', 'utf8');
const symbolTable = new Map();
const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
for (const line of lines) {
    const tokensRegExp = /([\w-]+|\(|\)|\,)/g;
    const tokenList = line.match(tokensRegExp);
    // console.log("token list: " + JSON.stringify(tokenList))
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    // console.log(relName)
    const params = line.substring(openBracePos + 1, closeBracePos);
    const words = params.split(',');
    const name = words[0].trim();
    if (relName === 'Place') {
        symbolTable.set(name, {
            _id: name,
            _type: 'Place',
            values: []
        });
    }
    else if (relName === 'Transition') {
        symbolTable.set(name, {
            _id: name,
            _type: 'Transition',
            inFlows: [],
            outFlows: []
        });
    }
}
// second run, add flows
for (const line of lines) {
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    // console.log(relName)
    const params = line.substring(openBracePos + 1, closeBracePos);
    const words = params.split(',');
    if (relName === 'Flow') {
        const srcName = words[0].trim();
        const tgtName = words[1].trim();
        const srcObj = symbolTable.get(srcName);
        const tgtObj = symbolTable.get(tgtName);
        if (srcObj['_type'] === "Place") {
            if (words.length === 3) {
                tgtObj["inFlows"].push(srcName + "*" + words[2]);
            }
            else {
                tgtObj["inFlows"].push(srcName + "*" + words[2] + "*" + words[3]);
            }
        }
        else if (srcObj["_type"] === "Transition") {
            if (words.length === 3) {
                srcObj["outFlows"].push(tgtName + "*" + words[2]);
            }
            else {
                srcObj["outFlows"].push(tgtName + "*" + words[2] + "*" + words[3]);
            }
        }
    }
}
// third run, add values
for (const line of lines) {
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos).trim();
    const place = symbolTable.get(relName);
    // console.log(place)
    if (place && place['_type'] === 'Place') {
        // found a value for the place
        const params = line.substring(openBracePos + 1, closeBracePos);
        const words = params.split(',');
        for (const word of words) {
            place["values"].push(word);
        }
    }
    const params = line.substring(openBracePos + 1, closeBracePos);
    const words = params.split(',');
}
// draw(symbolTable, "G1.svg"){
// }
// executeOneTransion(symbolTable)
// writeHeraklit(symbolTable, "G2.hera")
// draw(symbolTable, "G2.svg")
//reander graph on png
const render = (0, graphviz_cli_renderer_1.CliRenderer)({ outputFile: "./outPut/render18.png", format: "png" });
// Begin to create graph
const subgraphA = g.createSubgraph('A');
for (let elt of symbolTable.keys()) {
    const value = symbolTable.get(elt);
    if (value._type === 'Transition') {
        const node = g.createNode(elt, {
            [ts_graphviz_1.attribute.shape]: "box",
        });
    }
    else {
        //  const node=g.createNode(elt,{[attribute.label]: " test"})
    }
}
for (let elt of symbolTable.keys()) {
    console.log(elt);
    console.log("Value" + JSON.stringify(symbolTable.get(elt)));
    const value = symbolTable.get(elt);
    if (value._type === 'Transition') {
        let i = 1;
        for (let item of value.inFlows) {
            const words = item.split('*');
            if (words.length === 2) {
                const node = g.createEdge(["" + i + "", elt], {
                    [ts_graphviz_1.attribute.label]: words[1]
                });
            }
            else {
                const node = g.createEdge(["" + i + "", elt], {
                    [ts_graphviz_1.attribute.label]: "(" + words[1] + ", " + words[2] + ")"
                });
            }
            i++;
        }
        for (let item of value.outFlows) {
            const words = item.split('*');
            // const node=g.createEdge([elt,item])
            if (words.length === 2) {
                const node = g.createEdge([elt, "" + i + ""], {
                    [ts_graphviz_1.attribute.label]: words[1]
                });
            }
            else {
                const node = g.createEdge([elt, "" + i + ""], {
                    [ts_graphviz_1.attribute.label]: "(" + words[1] + " ," + words[2] + ")"
                });
            }
            i++;
        }
    }
}
const dot = (0, ts_graphviz_1.toDot)(g);
console.log(dot);
(async () => {
    try {
        await render(dot);
    }
    catch (error) {
        console.log(error);
    }
})();
