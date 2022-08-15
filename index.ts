import { attribute, digraph, toDot  } from 'ts-graphviz';
import fs from 'fs'
const g = digraph('G');
const data = fs.readFileSync('logicLanguage.txt', 'utf8')

const lines = data.toString().replace(/\r\n/g,'\n').split('\n');
for (const line of lines) {
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    console.log(relName)

    const params = line.substring(openBracePos + 1, closeBracePos)
    const words = params.split(',')

    if (relName === 'Place') {
        g.node(words[0])
    }
    else if (relName === 'Transition') {
        g.node(words[0], {[attribute.shape]: 'box'})
    }
    else if (relName === 'Flow')
    {
        g.edge([words[0],words[1]])
    }
    console.log(words[0])

}




const subgraphA = g.createSubgraph('A');
const nodeA1 = subgraphA.createNode('A_node1');
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

