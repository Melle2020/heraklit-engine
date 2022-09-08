import { attribute, digraph, Dot, toDot } from 'ts-graphviz';
import fs from 'fs'
import { CliRenderer } from "@diagrams-ts/graphviz-cli-renderer";
import { readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';
import BindingsList from './BindingsList';

const g = digraph('G');
const data = fs.readFileSync('./data/G2.hera', 'utf8')

//Class system

const symbolTable: Map<string, Symbol> = new Map();

class Symbol {
  name!: string
  _type!: string
  value: Map<string, Symbol> = new Map()
}

export { Symbol, Transition , Association}


class Transition extends Symbol {
  inFlows: Flow[] = []
  outFlows: Flow[] = []
  equations: Map<string, definition> = new Map()
  valueAssociation: Map<string,Association> = new Map()
}

class Flow extends Symbol {
  list: string[] = []
}

class Association extends Symbol  {
  params!: Params
  result!: Result
}

class definition {
  params!: Params
  result!: Result
}

class Params {
  list: string[] = []
}

class Result {
  list: string[] = []
}

class ValuePlace extends Symbol {
  list: string[] = []
}
class TypeValue extends Symbol {
  declaration: Map<string, string[]> = new Map()
}






const lines = data.toString().replace(/\r\n/g, '\n').split('\n');



setSymboleTableByReading(lines)
addValueToSymbolTable(lines)
getValueByKey(lines)
graphCreated(symbolTable)
const bindingsList = new BindingsList()
readFnAssociation()
// findFnAssociation()
// initializedEntry(symbolTable, g)
checkAllTransition(symbolTable)
// writeHeraklitSymbolTable(symbolTable, g)
// runOnTransition(g,symbolTable)

//Set all symbol in symbol table
function setSymboleTableByReading(lines: any) {
  for (const line of lines) {
    const tokensRegExp = /([\w-]+|\(|\)|\,)/g
    const tokenList = line.match(tokensRegExp)
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    const params = line.substring(openBracePos + 1, closeBracePos)
    const words: any[] = params.split(',')
    const name = words[0].trim()
    if (relName === 'Place') {
      symbolTable.set(name, {
        name: name,
        _type: relName,
        value: new Map()
      })
    }
    else if (relName === 'Transition') {
      const transition = new Transition()
      transition.name = name
      transition._type = relName
      symbolTable.set(name, transition)
    }
  }
}

//set value in symbol table
function addValueToSymbolTable(lines: any) {
  let typeValue = new TypeValue()
  for (const line of lines) {
    const tokensRegExp = /([\w-]+|\(|\)|\,|\=)/g
    const tokenList = line.match(tokensRegExp)
    if (line === '') {
      continue;
    }
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    if (relName === 'Place' || relName === 'Transition') {
      continue;
    }
    const params = line.substring(openBracePos + 1, closeBracePos)
    if (relName === 'Flow') {
      const srcName = tokenList[2]
      const trgName = tokenList[4]
      const srcSymbol = symbolTable.get(srcName) as Symbol
      const tgtSymbol = symbolTable.get(trgName) as Symbol
      if (srcSymbol?._type === 'Transition') {
        //Outgoing flow
        const myTrans = srcSymbol as Transition
        const flow = new Flow()
        flow._type = 'Flow'
        flow.value.set('src', srcSymbol)
        flow.value.set('tgt', tgtSymbol)
        for (let i = 6; i < tokenList.length; i = i + 2) {
          flow.list.push(tokenList[i])
        }
        myTrans.outFlows.push(flow)
      }
      else {
        //Incomming flow
        const myTrans = tgtSymbol as Transition
        const flow = new Flow();
        flow._type = 'Flow'
        flow.value.set('src', srcSymbol)
        flow.value.set('tgt', tgtSymbol)
        for (let i = 6; i < tokenList.length; i = i + 2) {
          flow.list.push(tokenList[i])
        }
        myTrans.inFlows.push(flow)
      }

    }
    else if (relName === 'Equation') {
      const key = tokenList[2]
      const keySymbol = symbolTable.get(key) as Transition
      if (keySymbol?._type === "Transition") {
        let i = 5
        let params = new Params()
        let result = new Result()
        while (tokenList[i] != '=') {
          result.list.push(tokenList[i])
          i = i + 2
        }
        let j = i
        i = i + 3
        while (tokenList[i] != ')') {
          params.list.push(tokenList[i])
          i = i + 2;
        }
        keySymbol.equations.set(tokenList[j + 1], {
          params: params,
          result: result
         }
        )
      }
      else {}
    }
    else {
      for (let t of symbolTable.keys()) {
        let symbol = symbolTable.get(t) as Transition
        if (symbol?._type === 'Transition') {
          symbol as Transition
          if (!symbol?.equations.get(relName) && !symbolTable.get(relName)) {
            typeValue.declaration.set(relName, tokenList[2])
          }
        }
      }
      console.log(symbolTable)
    }
  }
  if (typeValue) {
    symbolTable.set('declaration', typeValue)
  }
  console.log(symbolTable)
}

function getValueByKey(lines: any) {
  for (const line of lines) {
    const tokensRegExp = /([\w-]+|\(|\)|\,)/g
    const tokenList = line.match(tokensRegExp)
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    const params = line.substring(openBracePos + 1, closeBracePos)
    const words: any[] = params.split(',')
    const name = words[0].trim()
    if (relName === 'Place' || relName === 'Transition' || relName === 'Equation' || relName === 'Flow' || relName === '') {
      continue;
    }
    let valueSymbol = symbolTable.get(relName)
    let i = 2
    const val = new ValuePlace()
    if (valueSymbol?._type === 'Place') {
      while (tokenList[i] != ')') {
        val.list.push(tokenList[i])
        i++
      }
      symbolTable.get(valueSymbol.name)?.value.set(name, val)
    } else {
      // if ( !valueSymbol) {
      //  let  typeSymbol = new typeValue() as Symbol
      //   console.log(valueSymbol)
      //   symbolTable.set(relname,{

      //   })


      // }


    }

    // console.log(symbolTable)
  }
  console.log(symbolTable)
}

function findFnAssociation(){
  for ( const s of symbolTable.keys()){
    let symbol = symbolTable.get(s) as Transition
    if ( symbol._type === 'Transition') {
      for ( const line of lines ) {
        const tokensRegExp = /([\w-]+|\(|\)|\,|\=)/g
        const tokenList:any = line.match(tokensRegExp)
        const openBracePos = line.indexOf('(');
        const closeBracePos = line.indexOf(')');
        const relName = line.substring(0, openBracePos);
        const params = line.substring(openBracePos + 1, closeBracePos)
        const words: any[] = params.split(',')
        const name = words[0].trim()
        console.log(tokenList)
        if ( !symbol.equations.get(relName) ) {
          console.log(tokenList)
          continue; 
        }
        let i = 1
        let paramsFn = new Params()
        let resultFn  = new Result()
        while ( tokenList[i] != '(' ) {
          resultFn.list.push(tokenList[i])
          i = i + 2
        }
         let j = i
          j = j + 3
        while (tokenList[i] != tokenList.length-1) {
          paramsFn.list.push(tokenList[i])
          i = i + 2;
        }
        // symbol.valueAssociation.set(name, {
        //   params: paramsFn,
        //   result: resultFn
        //  }
        // )
        console.log(tokenList)
      }
    }
  }
  
}

function readFnAssociation(){

  for ( let line of lines){
    const tokensRegExp = /([\w-]+|\(|\)|\,)|\=/g
    const tokenList  = line.match(tokensRegExp) || []
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    const params = line.substring(openBracePos + 1, closeBracePos)
    const words: any[] = params.split(',')
    const name = words[0].trim()

    if( relName === 'Place' || relName === 'Transition' || relName === 'Flow' || relName === 'Equation' ){
      continue;
    }
    let length = tokenList.length
    if( length >= 6 && tokenList[1] === '(' && tokenList[3]  === ')'  && tokenList[4] === '=' ){
      let fn = symbolTable.get(relName)
      if(!fn){
        
        fn = new Symbol()
        fn.name = relName
        fn._type = 'Function'
        symbolTable.set(relName,fn)

      }
      let association =  new Association()
      let paramsFn = new Params()
      let resultFn = new Result()

      paramsFn.list.push(tokenList[2])
      resultFn.list.push(tokenList[5])
      association.params = paramsFn
      association.result = resultFn
      fn.value.set(tokenList[2],association)
    }

  }


}


function graphCreated(symbolTable: any) {
  for ( let elt of symbolTable.keys() ) {
    const value = symbolTable.get(elt);
    if (value._type === 'Transition') {
      const node = g.createNode(elt, {
        [attribute.shape]: "box",
      })
    } else if (value._type === 'Place') {
      let key = ''
      for (let v of value.value.values()) {
        key += '(' + v.list.join('') + ') '
      }
      const node = g.createNode(elt, {
        [attribute.label]: key
      })
    }
  }
  for ( let elt of symbolTable.keys() ) {
    const value = symbolTable.get(elt);
    if ( value._type === 'Transition' ) {
      let i = 1
      for ( let item of value.inFlows ) {
        const src = item.value.get('src').value.keys()
        const srcVal = "{" + item.list.join(",") + "}"
        const node = g.createEdge([item.value.get('src').name, elt], {
          [attribute.label]: srcVal
        })
        i++;
      }
      for ( let item of value.outFlows ) {
        const tgt = item.value.get('tgt').value.keys()
        const tgtVal = "{" + item.list.join(",") + "}"
        const node = g.createEdge([elt, item.value.get('tgt').name], {
          [attribute.label]: tgtVal
        })
        i++;
      }
    }
  }
  graphToImagePng(g, 'Gen')

}


// function initializedEntry(symbolTable: any, g: any) {
//   for (let elt of symbolTable.keys()) {

//     const value = symbolTable.get(elt);
//     if (value._type === 'Transition') {
//       //get all edges of graph
//       let gEdge = g.edges
//       //find all entry flows
//       for (let item of value.inFlows) {
//         const src = item.value.get('src').name
//         // const srcVal="{"+item.var.join(",")+"}"
//         // check all edge
//         let i = 0
//         for (let val of gEdge) {
//           if (src === val.targets[0].id) {

//             const place = symbolTable.get(src)

//             let key = ''
//             if (place._type === 'Place') {
//               // key =  place.value.keys().join(", ")
//               for (let k of place.value.keys()) {
//                 key += k + ' '
//               }

//               // const placevalue = place.value.get(key).list
//               // gEdge[i].targets[0].port = gEdge[i].targets[0].id
//               // gEdge[i].targets[0].id = gEdge[i].targets[0].id.replace(val.targets[0].id, "(" + placevalue.join("") + ")")


//             }


//           }
//           i++
//         }

//       }


//       for (let item of value.outFlows) {
//         const tgt = item.value.get('tgt').name

//         // check all edge
//         let i = 0
//         for (let val of gEdge) {
//           if (tgt === val.targets[1].id) {

//             const place = symbolTable.get(tgt)

//             let key = ''

//             if (place._type === 'Place') {

//               for (let k of place.value.keys()) {
//                 key = k
//               }
//               // const placevalue = place.value.get(key).list
//               // gEdge[i].targets[1].port = gEdge[i].targets[1].id
//               // gEdge[i].targets[1].id = gEdge[i].targets[1].id.replace(val.targets[1].id, "")


//             }


//           }
//           i++
//         }
//       }

//     }

//   }

//   graphToImagePng(g, 'InitVal')



// }

//run transition
function checkAllTransition(symbolTable: any) {

  for (let s of symbolTable.keys()) {

    const eSymbol = symbolTable.get(s)
    if (eSymbol._type === 'Transition') {
      let trans: Transition;
      trans = eSymbol as Transition

      for (let flow of trans.inFlows) {
        let place = flow.value.get('src') as Symbol
        let varList = flow.list
        let valueList = []
        for (let v of place?.value.values()) {
          let vp = v as ValuePlace
          valueList.push(vp.list)

        }
        bindingsList.expand(varList, valueList)

      }

      for (let flow of trans.outFlows) {
        let place = flow.value.get('tgt') as Symbol
        let varList = flow.list
        bindingsList.expandOut(varList, symbolTable, trans)

      }
    }

  }
  bindingsList.printBindingList()



}

async function writeHeraklitSymbolTable(symbolTable: any, g: any) {

  let data = ""
  for (let trans of g.nodes) {
    //Adding all place
    for (let e of g.edges) {

      if (e.targets[0].id === trans.id) {

        data = data + 'Place( ' + e.targets[1].port + ' )' + '\n'
      }
      else if (e.targets[1].id === trans.id) {
        data = data + 'Place( ' + e.targets[0].port + ' )' + '\n'

      }

    }

    data = data + 'Transition( ' + trans.id + ' )' + '\n'
    for (let e of g.edges) {



      data = data + 'Flow( ' + (e.targets[0].port || e.targets[0].id) + ', ' + (e.targets[1].port || e.targets[1].id) + ')' + '\n'



    }

  }
  writeOnFile(data, 'G3.hera')


  // data=data+'Transition( '+trans.id+ ' )'+'\n'


}



async function writeOnFile(data: string, file: string) {
  try {
    await fsPromises.writeFile(join(__dirname, file), data, {
      flag: 'w',
    });

    const contents = await fsPromises.readFile(
      join(__dirname, file),
      'utf-8',
    );
    console.log(contents);  

    return contents;
  } catch (err) {
    console.log(err);
    return 'Something went wrong';
  }

}

// console.log(g)



function graphToImagePng(g: any, imageName: string) {
  const dot = toDot(g);
  console.log(dot);

  const render = CliRenderer({ outputFile: "./outPut/" + imageName + ".png", format: "png" });
  -+(async () => {
    try {
      await render(
        dot
      );
    } catch (error) {
      console.log(error);
    }
  })();
}
