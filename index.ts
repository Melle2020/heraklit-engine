import { attribute, digraph, toDot  } from 'ts-graphviz';
import fs from 'fs'
import {CliRenderer} from "@diagrams-ts/graphviz-cli-renderer";

const g = digraph('G');
const data = fs.readFileSync('logicLanguage.txt', 'utf8')

const symbolTable = new Map();


const lines = data.toString().replace(/\r\n/g,'\n').split('\n');
for (const line of lines) {

    const tokensRegExp = /([\w-]+|\(|\)|\,)/g
    const tokenList = line.match(tokensRegExp)
    console.log("token list: " + JSON.stringify(tokenList))

    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    console.log(relName)

    const params = line.substring(openBracePos + 1, closeBracePos)
    const words = params.split(',')

    const name = words[0].trim()
    if (relName === 'Place') {
        symbolTable.set(name, {
            _id: name,
            _type: 'Place',
            values: []
        })
    }
    else if (relName === 'Transition') {
        symbolTable.set(name, {
            _id: name,
            _type: 'Transition',
            inFlows: [],
            outFlows: []
        })
    }
}

// second run, add flows
for (const line of lines) {
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    console.log(relName)

    const params = line.substring(openBracePos + 1, closeBracePos)
    const words = params.split(',')

    if (relName === 'Flow') {
        const srcName = words[0].trim()
        const tgtName = words[1].trim()
        const srcObj = symbolTable.get(srcName);
        const tgtObj = symbolTable.get(tgtName);

        if (srcObj['_type'] === "Place") {
            tgtObj["inFlows"].push(srcName);
        } else if (srcObj["_type"] === "Transition") {
            srcObj["outFlows"].push(tgtName);
        }

    }

}

// third run, add values
for (const line of lines) {
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos).trim();

    const place = symbolTable.get(relName);
    console.log(place)
    if ( place && place['_type'] === 'Place') {
        // found a value for the place
        const params = line.substring(openBracePos + 1, closeBracePos)
        const words = params.split(',')
        for (const word of words) {
            place["values"].push(word)
        }
    }



    const params = line.substring(openBracePos + 1, closeBracePos)
    const words = params.split(',')


}


const render = CliRenderer({ outputFile: "./render.png", format: "png" });
const subgraphA = g.createSubgraph('A');
const nodeA1 = subgraphA.createNode('A_node1',{
    [attribute.shape]: "box",
  });
const nodeA2 = subgraphA.createNode('A_node2');
subgraphA.createEdge([nodeA1, nodeA2]);

const subgraphB = g.createSubgraph('B');
const nodeB1 = subgraphB.createNode('B_node1');
const nodeB2 = subgraphB.createNode('B_node2');
subgraphA.createEdge([nodeB1, nodeB2]);

const node1 = g.createNode('node1');
const node2 = g.createNode('node2');
g.createEdge([node1, node2]);
const dot = toDot(g);
console.log(dot);


(async () => {
    try {
      await render(
        dot
      );
    } catch (error) {
      console.log(error);
    }
  })();
