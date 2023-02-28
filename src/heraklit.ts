import { attribute,digraph,toDot } from 'ts-graphviz';
import fs from "fs"
import { CliRenderer } from "@diagrams-ts/graphviz-cli-renderer";
import {promises as fsPromises } from 'fs';
import { join } from 'path';
import BindingsList from './BindingsList';
import _ from "lodash";
import { ReachabilityGraph, ReachableState, RGTransition } from './ReachabilityGraph';
import { ExistFinallyOperator } from './operators/CTL'



const data = fs.readFileSync('src/data/G2.hera', 'utf8')
const dg = digraph('G')

//Class system
const symbolTable: Map<string, Symbol> = new Map();
export class Symbol {
  name!: string
  _type!: string
  value: Map<string, Symbol> = new Map()
}


 export class Transition extends Symbol {
  inFlows: Flow[] = []
  outFlows: Flow[] = []
  equations: Map<string, definition> = new Map()
  valueAssociation: Map<string,Association> = new Map()
}

class Flow extends Symbol {
  list: string[] = []
}

export class Association extends Symbol  {
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
readFnAssociation()
computeAllState(symbolTable)

//Set all symbol transition and place in symbol table
function setSymboleTableByReading(lines: any) {
  for ( const line of lines ) {
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

//set value in symbol table by using flow . equation ,
function addValueToSymbolTable(lines: any) {
  let typeValue = new TypeValue()
  for ( const line of lines ) {
    const tokensRegExp = /([\w-]+|\(|\)|\,|\=)/g
    const tokenList = line.match(tokensRegExp)
    if (line === '') {
      continue;
    }
    const openBracePos = line.indexOf('(');
    const relName = line.substring(0, openBracePos);
    if (relName === 'Place' || relName === 'Transition') {
      continue;
    }
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
  if ( typeValue ) {
    symbolTable.set('declaration', typeValue)
  }
}

function getValueByKey(lines: any) {
  for ( const line of lines ) {
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

    }
  }
  console.log(symbolTable)
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
      const node = dg.createNode(elt, {
        [attribute.shape]: "box",
      })
    } else if (value._type === 'Place') {
      let key = ''
      for (let v of value.value.values()) {
        key += '(' + v.list.join('') + ') '
      }
      const node = dg.createNode(elt, {
        [attribute.label]: key
      })
    }
  }
  for ( let elt of symbolTable.keys() ) {
    const value = symbolTable.get(elt);
    if ( value._type === 'Transition' ) {
      let i = 1
      for ( let item of value.inFlows ) {
        const srcVal = "{" + item.list.join(",") + "}"
        const node = dg.createEdge([item.value.get('src').name, elt], {
          [attribute.label]: srcVal
        })
        i++;
      }
      for ( let item of value.outFlows ) {
        const tgtVal = "{" + item.list.join(",") + "}"
        const node = dg.createEdge([elt, item.value.get('tgt').name], {
          [attribute.label]: tgtVal
        })
        i++;
      }
    }
  }
  graphToImagePng(dg, 'Gen')

}



function computeAllState(startState:Map<string, Symbol>){
  
  // Create Reachability graph
  let rg:ReachabilityGraph = new ReachabilityGraph()
  let key = generatingHeraklitString(startState)

  // Add start state to Reachability graph
  let rc: ReachableState = new ReachableState()
  rc.name = "startState"
  rc.symbolTable = startState
  rg.stateMap.set(key,rc)
  generatingGraphState(rc,rg, key,0)

  // add  start state to todoList 
  let todoList: ReachableState[] = []
  todoList.push(rc)
  let i=0
  // for each todoList entry expand one step
  while(todoList.length > 0){
    let currentState = todoList[0]
    todoList.splice(0,1)
    expandOneState(rg,todoList,currentState)
  }
  //show all state in image
  let gr = digraph('RG') 
 for(let [key,elt] of rg.stateMap){
    let s = elt as ReachableState
    let node = gr.createNode(s.name,{
      [attribute.URL]: "./"+s.name+".svg",
    }) 
    for(let t of s.outGoingTransition){
      let target =  t.target
      let edge = gr.createEdge([s.name,target.name],{
        [attribute.label]: t.name
      }) 
    }
 } 
 OperatorExec(rg)
 graphToImagePng(gr,'reachabilityGraph')
}

function expandOneState(g:ReachabilityGraph,todoList:ReachableState[],state:ReachableState){

  //for each transition 
  for(let s of state.symbolTable.keys()) {
    const eSymbol = state.symbolTable.get(s) as Symbol
    if(eSymbol._type === 'Transition') {
      let transitionBindings = new BindingsList()
      let trans: Transition;
      trans = eSymbol as Transition

      for(let flow of trans.inFlows) {
        let place = flow.value.get('src') as Symbol
        let varList = flow.list
        let valueList = []
        for (let v of place?.value.values()) {
          let vp = v as ValuePlace
          valueList.push(vp.list)
        }
        transitionBindings.expand(varList, valueList)
      }
      for (let flow of trans.outFlows) {
        let varList = flow.list
        transitionBindings.expandOut(varList, symbolTable, trans)
      }
      //for each binding
      for( let b of transitionBindings.bindings){
        doOneBinding(g,todoList,state,b,trans)
      }
    }   
  }
}

function doOneBinding(g:ReachabilityGraph,todoList:ReachableState[],state:ReachableState,currentBinding:Map<string,string>,transition:Transition){

  let cloneState = _.cloneDeep(state.symbolTable)
  console.log(cloneState)
  //Execute the binding
  let cloneTransition:Transition|undefined = undefined
  for(let symbol of cloneState.values()){
    if(symbol.name === transition.name){
       cloneTransition = symbol as Transition
       break;
    }
  }
  if(!cloneTransition ) {
    return
  }
  for(let item of cloneTransition.inFlows){
    let place = item.value.get('src') as ValuePlace
    let tab:any[]=[]
    for(let v of item.list){
      tab.push(currentBinding.get(v))
    }  
    for(let obj of tab){
      place.value.delete(obj)
    }
     
  }
  for(let item of cloneTransition.outFlows){
    let vP = item.value.get('tgt') as ValuePlace
    let newOutput = new ValuePlace()
    for ( let v of item.list ){
      let valCurr = currentBinding.get(v) as string
      newOutput.list.push(valCurr)   
      newOutput.list.push(','  )
    }
    newOutput.list.splice(-1,1) 
    vP.value.set(newOutput.list[0],newOutput)  
  }

  //is it a new state?
  let newKey = generatingHeraklitString(cloneState)
  let existingState = g.stateMap.get(newKey)

  //If yes add it to the Reachability graph,add to the todoList, add transition edge (old state to new state )
  // if yes store into disk as image(png ,svg,..) and heraklit notation
  let rs:ReachableState = new ReachableState()
  rs.name = "rs"+g.stateMap.size
  rs.symbolTable = cloneState
  if(!existingState){
    g.stateMap.set(newKey,rs)
    todoList.push(rs)
    let rgt:RGTransition = new RGTransition ()
    rgt.name = transition.name
    rgt.target = rs
    state.outGoingTransition.push(rgt)
    //generate graph
    generatingGraphState(state,g,newKey,g.stateMap.size)

  }
  else{
     // else add this transition into a old state 
    let rgt:RGTransition = new RGTransition ()
    rgt.name = transition.name
    rgt.target = existingState

    state.outGoingTransition.push(rgt)
  }  
}

function generatingHeraklitString(state:Map<string,Symbol>){
  let predicate:string[]=[]
  for(let symbol of state.values()){
    if( symbol._type === "Place"){
      let line = `Place( ${symbol.name} )`
      predicate.push(line)
      for(let s of symbol.value.values()){
        let vp = s as ValuePlace
        line = `${symbol.name}( ${vp.list.join('')} )`
        predicate.push(line)
      }
    }
    else if(symbol._type === "Transition"){
      let line = `Transition( ${symbol.name} )`
      predicate.push(line)
      let transition = symbol as Transition
      if(transition.inFlows.length){        
        for(let flow of transition.inFlows){
          let line = `${flow.value.get('src')?.name}, ${flow.value.get('tgt')?.name}, `
          if(flow.list.length >= 0){
              for(let variable of flow.list){
                line+=`${variable}, `
              }
          }
          line =`Flow ( ${line})`
          predicate.push(line)       

        }
      }
      if(transition.outFlows.length){
        for(let flow of transition.outFlows){
          let line = `${flow.value.get('tgt')?.name}, ${flow.value.get('src')?.name}, `
          if(flow.list.length >= 0){
              for(let variable of flow.list){
                line+=`${variable}, `
              }
          }
          line =`Flow ( ${line})`
          predicate.push(line)       

        }
      }
      if(transition.equations){
        for(let [k , v] of transition.equations){ 
          let lineR = ""
          let lineV = ""
          if(v.result.list.length >= 0){
            //check all result
            for(let r of v.result.list ){
              lineR += `${r}, `
            }
            lineR = `( ${lineR} )`      
            //check all param
            for(let p of v.params.list ){
              lineV += `${p}, `
            }
            lineV = `f( ${lineV} )`      
          }
        let line = `Equation( ${transition.name}, ${lineR} = ${lineV}  )`
        predicate.push(line)
        }
        

      }

    }
  }

  predicate = predicate.sort()

  let fullText = predicate.join('\n')
  return fullText
}

function generatingGraphState(state:ReachableState,rg:ReachabilityGraph , key:string,i:number){
  let dg = digraph('G')
  for(let elt of state.symbolTable.values()) {
    // const value = symbolTable.get(elt);
    if(elt._type === 'Transition') {
      const node = dg.createNode(elt.name, {
        [attribute.shape]: "box",
      })
    } else if(elt._type === 'Place') {
      let key = ''
      for(let v of elt.value.values()) {
        let vp = v as ValuePlace
        key += '(' + vp.list.join('') + ') '
      }
      const node = dg.createNode(elt.name, {
        [attribute.label]: key
      })
    }
  }
  for ( let elt of state.symbolTable.values() ) {
    if ( elt._type === 'Transition' ) {
      let transition = elt as Transition
      for ( let item of transition.inFlows ) {
        const srcVal = "{" + item.list.join(",") + "}"
        const placeN:string = item.value?.get('src')?.name as string
        const node = dg.createEdge([ placeN, transition.name], {
          [attribute.label]: srcVal
        })
      }
      for ( let item of transition.outFlows ) {
        const tgt = item.value.get('tgt')?.value.keys()
        const tgtVal = "{" + item.list.join(",") + "}"
        const placeN:string = item.value?.get('tgt')?.name as string
        const node = dg.createEdge([transition.name, placeN], {
          [attribute.label]: tgtVal
        })
      }
    }
  }
  graphToImagePng(dg,state.name)

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

//convert dot file to png
function graphToImagePng(g: any, imageName: string) {
  const dot = toDot(g);

  const render = CliRenderer({ outputFile: "src\\output\\" + imageName + ".svg", format: "svg" });
  (async () => {
    try {
      await render(
        dot
      );
    } catch (error) {
      console.log(error);
    }
  })();
}

function V1ShoesPredicate(state:ReachableState){
  let places=[]; 
  
  for(let elt of state.symbolTable.values()){
        if(elt._type === 'Place'){
               places.push(elt)
        }
  }
  for(const place of places) {
    for(const item of place.value.values()){
     let values  = item as ValuePlace
    }
    
    // if(place.value.f(arr => (arr, ['V1', 'shoes'])) !== -1) {
    //   return true
    // }
  }
  return false
}

function OperatorExec(rg:ReachabilityGraph){
    // init state
    console.log(rg)
    let systemState!:ReachableState
    for(let g of rg.stateMap){
      if(g[1].name='startState'){
        systemState = g[1] as ReachableState
        break;
      }
    }
    const ef = new ExistFinallyOperator()
    if(ef.find(systemState, V1ShoesPredicate)) {
      console.log("FOUND PATH:")
      let path = ""
      for(const state of ef.example) {
        path += state.name + " -> "
      }
      path += "/"
      console.log(path)
      }
      else{
      console.log("NOT FOUND")
    }
}