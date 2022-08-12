
import fs from 'fs'

const data = fs.readFileSync('data/graph.hera', 'utf8')

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
        g.edge(words[0], words[1])
    }
    console.log(words[0])

}