"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Association = exports.Transition = exports.Symbol = void 0;
const ts_graphviz_1 = require("ts-graphviz");
const fs_1 = __importDefault(require("fs"));
const graphviz_cli_renderer_1 = require("@diagrams-ts/graphviz-cli-renderer");
const fs_2 = require("fs");
const path_1 = require("path");
const BindingsList_1 = __importDefault(require("./BindingsList"));
const lodash_1 = __importDefault(require("lodash"));
const ReachabilityGraph_1 = require("./ReachabilityGraph");
const data = fs_1.default.readFileSync('../data/G2.hera', 'utf8');
const dg = (0, ts_graphviz_1.digraph)('G');
//Class system
const symbolTable = new Map();
class Symbol {
    constructor() {
        this.value = new Map();
    }
}
exports.Symbol = Symbol;
class Transition extends Symbol {
    constructor() {
        super(...arguments);
        this.inFlows = [];
        this.outFlows = [];
        this.equations = new Map();
        this.valueAssociation = new Map();
    }
}
exports.Transition = Transition;
class Flow extends Symbol {
    constructor() {
        super(...arguments);
        this.list = [];
    }
}
class Association extends Symbol {
}
exports.Association = Association;
class definition {
}
class Params {
    constructor() {
        this.list = [];
    }
}
class Result {
    constructor() {
        this.list = [];
    }
}
class ValuePlace extends Symbol {
    constructor() {
        super(...arguments);
        this.list = [];
    }
}
class TypeValue extends Symbol {
    constructor() {
        super(...arguments);
        this.declaration = new Map();
    }
}
const lines = data.toString().replace(/\r\n/g, '\n').split('\n');
setSymboleTableByReading(lines);
addValueToSymbolTable(lines);
getValueByKey(lines);
graphCreated(symbolTable);
readFnAssociation();
computeAllState(symbolTable);
//Set all symbol transition and palce in symbol table
function setSymboleTableByReading(lines) {
    for (const line of lines) {
        const tokensRegExp = /([\w-]+|\(|\)|\,)/g;
        const tokenList = line.match(tokensRegExp);
        const openBracePos = line.indexOf('(');
        const closeBracePos = line.indexOf(')');
        const relName = line.substring(0, openBracePos);
        const params = line.substring(openBracePos + 1, closeBracePos);
        const words = params.split(',');
        const name = words[0].trim();
        if (relName === 'Place') {
            symbolTable.set(name, {
                name: name,
                _type: relName,
                value: new Map()
            });
        }
        else if (relName === 'Transition') {
            const transition = new Transition();
            transition.name = name;
            transition._type = relName;
            symbolTable.set(name, transition);
        }
    }
}
//set value in symbol table by using flow . equation ,
function addValueToSymbolTable(lines) {
    let typeValue = new TypeValue();
    for (const line of lines) {
        const tokensRegExp = /([\w-]+|\(|\)|\,|\=)/g;
        const tokenList = line.match(tokensRegExp);
        if (line === '') {
            continue;
        }
        const openBracePos = line.indexOf('(');
        const closeBracePos = line.indexOf(')');
        const relName = line.substring(0, openBracePos);
        if (relName === 'Place' || relName === 'Transition') {
            continue;
        }
        const params = line.substring(openBracePos + 1, closeBracePos);
        if (relName === 'Flow') {
            const srcName = tokenList[2];
            const trgName = tokenList[4];
            const srcSymbol = symbolTable.get(srcName);
            const tgtSymbol = symbolTable.get(trgName);
            if ((srcSymbol === null || srcSymbol === void 0 ? void 0 : srcSymbol._type) === 'Transition') {
                //Outgoing flow
                const myTrans = srcSymbol;
                const flow = new Flow();
                flow._type = 'Flow';
                flow.value.set('src', srcSymbol);
                flow.value.set('tgt', tgtSymbol);
                for (let i = 6; i < tokenList.length; i = i + 2) {
                    flow.list.push(tokenList[i]);
                }
                myTrans.outFlows.push(flow);
            }
            else {
                //Incomming flow
                const myTrans = tgtSymbol;
                const flow = new Flow();
                flow._type = 'Flow';
                flow.value.set('src', srcSymbol);
                flow.value.set('tgt', tgtSymbol);
                for (let i = 6; i < tokenList.length; i = i + 2) {
                    flow.list.push(tokenList[i]);
                }
                myTrans.inFlows.push(flow);
            }
        }
        else if (relName === 'Equation') {
            const key = tokenList[2];
            const keySymbol = symbolTable.get(key);
            if ((keySymbol === null || keySymbol === void 0 ? void 0 : keySymbol._type) === "Transition") {
                let i = 5;
                let params = new Params();
                let result = new Result();
                while (tokenList[i] != '=') {
                    result.list.push(tokenList[i]);
                    i = i + 2;
                }
                let j = i;
                i = i + 3;
                while (tokenList[i] != ')') {
                    params.list.push(tokenList[i]);
                    i = i + 2;
                }
                keySymbol.equations.set(tokenList[j + 1], {
                    params: params,
                    result: result
                });
            }
            else { }
        }
        else {
            for (let t of symbolTable.keys()) {
                let symbol = symbolTable.get(t);
                if ((symbol === null || symbol === void 0 ? void 0 : symbol._type) === 'Transition') {
                    symbol;
                    if (!(symbol === null || symbol === void 0 ? void 0 : symbol.equations.get(relName)) && !symbolTable.get(relName)) {
                        typeValue.declaration.set(relName, tokenList[2]);
                    }
                }
            }
            console.log(symbolTable);
        }
    }
    if (typeValue) {
        symbolTable.set('declaration', typeValue);
    }
    console.log(symbolTable);
}
function getValueByKey(lines) {
    var _a;
    for (const line of lines) {
        const tokensRegExp = /([\w-]+|\(|\)|\,)/g;
        const tokenList = line.match(tokensRegExp);
        const openBracePos = line.indexOf('(');
        const closeBracePos = line.indexOf(')');
        const relName = line.substring(0, openBracePos);
        const params = line.substring(openBracePos + 1, closeBracePos);
        const words = params.split(',');
        const name = words[0].trim();
        if (relName === 'Place' || relName === 'Transition' || relName === 'Equation' || relName === 'Flow' || relName === '') {
            continue;
        }
        let valueSymbol = symbolTable.get(relName);
        let i = 2;
        const val = new ValuePlace();
        if ((valueSymbol === null || valueSymbol === void 0 ? void 0 : valueSymbol._type) === 'Place') {
            while (tokenList[i] != ')') {
                val.list.push(tokenList[i]);
                i++;
            }
            (_a = symbolTable.get(valueSymbol.name)) === null || _a === void 0 ? void 0 : _a.value.set(name, val);
        }
        else {
            // if ( !valueSymbol) {
            //  let  typeSymbol = new typeValue() as Symbol
            //   console.log(valueSymbol)
            //   symbolTable.set(relname,{
            //   })
            // }
        }
        // console.log(symbolTable)
    }
    console.log(symbolTable);
}
function readFnAssociation() {
    for (let line of lines) {
        const tokensRegExp = /([\w-]+|\(|\)|\,)|\=/g;
        const tokenList = line.match(tokensRegExp) || [];
        const openBracePos = line.indexOf('(');
        const closeBracePos = line.indexOf(')');
        const relName = line.substring(0, openBracePos);
        const params = line.substring(openBracePos + 1, closeBracePos);
        const words = params.split(',');
        const name = words[0].trim();
        if (relName === 'Place' || relName === 'Transition' || relName === 'Flow' || relName === 'Equation') {
            continue;
        }
        let length = tokenList.length;
        if (length >= 6 && tokenList[1] === '(' && tokenList[3] === ')' && tokenList[4] === '=') {
            let fn = symbolTable.get(relName);
            if (!fn) {
                fn = new Symbol();
                fn.name = relName;
                fn._type = 'Function';
                symbolTable.set(relName, fn);
            }
            let association = new Association();
            let paramsFn = new Params();
            let resultFn = new Result();
            paramsFn.list.push(tokenList[2]);
            resultFn.list.push(tokenList[5]);
            association.params = paramsFn;
            association.result = resultFn;
            fn.value.set(tokenList[2], association);
        }
    }
}
function graphCreated(symbolTable) {
    for (let elt of symbolTable.keys()) {
        const value = symbolTable.get(elt);
        if (value._type === 'Transition') {
            const node = dg.createNode(elt, {
                [ts_graphviz_1.attribute.shape]: "box",
            });
        }
        else if (value._type === 'Place') {
            let key = '';
            for (let v of value.value.values()) {
                key += '(' + v.list.join('') + ') ';
            }
            const node = dg.createNode(elt, {
                [ts_graphviz_1.attribute.label]: key
            });
        }
    }
    for (let elt of symbolTable.keys()) {
        const value = symbolTable.get(elt);
        if (value._type === 'Transition') {
            let i = 1;
            for (let item of value.inFlows) {
                const src = item.value.get('src').value.keys();
                const srcVal = "{" + item.list.join(",") + "}";
                const node = dg.createEdge([item.value.get('src').name, elt], {
                    [ts_graphviz_1.attribute.label]: srcVal
                });
                i++;
            }
            for (let item of value.outFlows) {
                const tgt = item.value.get('tgt').value.keys();
                const tgtVal = "{" + item.list.join(",") + "}";
                const node = dg.createEdge([elt, item.value.get('tgt').name], {
                    [ts_graphviz_1.attribute.label]: tgtVal
                });
                i++;
            }
        }
    }
    graphToImagePng(dg, 'Gen');
}
function computeAllState(startState) {
    // Create Reachability graph
    let rg = new ReachabilityGraph_1.ReachabilityGraph();
    let key = generatingHeraklitString(startState);
    // Add start state to Reachability graph
    let rc = new ReachabilityGraph_1.ReachableState();
    rc.name = "startState";
    rc.symbolTable = startState;
    rg.stateMap.set(key, rc);
    generatingGraphState(rc, rg, key, 0);
    // add  start state to todoList 
    let todoList = [];
    todoList.push(rc);
    let i = 0;
    // for each todoList entry expand one step
    while (todoList.length > 0) {
        let currentState = todoList[0];
        todoList.splice(0, 1);
        expandOneState(rg, todoList, currentState);
    }
    //show all state in image
    let gr = (0, ts_graphviz_1.digraph)('RG');
    for (let [key, elt] of rg.stateMap) {
        let s = elt;
        let node = gr.createNode(s.name, {
            [ts_graphviz_1.attribute.URL]: "./rs" + i + ".svg",
        });
        for (let t of s.outGoingTransition) {
            let target = t.target;
            let edge = gr.createEdge([s.name, target.name]);
        }
        // generatingGraphState(elt,rg, key,i)
        // i++
    }
    graphToImagePng(gr, 'reachabilityGraph');
}
function expandOneState(g, todoList, state) {
    //for each transition 
    for (let s of state.symbolTable.keys()) {
        const eSymbol = state.symbolTable.get(s);
        if (eSymbol._type === 'Transition') {
            let transitionBindings = new BindingsList_1.default();
            let trans;
            trans = eSymbol;
            for (let flow of trans.inFlows) {
                let place = flow.value.get('src');
                let varList = flow.list;
                let valueList = [];
                for (let v of place === null || place === void 0 ? void 0 : place.value.values()) {
                    let vp = v;
                    valueList.push(vp.list);
                }
                transitionBindings.expand(varList, valueList);
            }
            for (let flow of trans.outFlows) {
                let place = flow.value.get('tgt');
                let varList = flow.list;
                transitionBindings.expandOut(varList, symbolTable, trans);
            }
            //for each binding
            for (let b of transitionBindings.bindings) {
                doOneBinding(g, todoList, state, b, trans);
            }
        }
    }
}
function doOneBinding(g, todoList, state, currentBinding, transition) {
    let cloneState = lodash_1.default.cloneDeep(state.symbolTable);
    //Execute the binding
    let cloneTransition = undefined;
    for (let symbol of cloneState.values()) {
        if (symbol.name === transition.name) {
            cloneTransition = symbol;
            break;
        }
    }
    if (!cloneTransition) {
        return;
    }
    if (cloneTransition.name === 'vendor-packs-item') {
        console.log('vendor-packs-item');
    }
    for (let item of cloneTransition.inFlows) {
        let place = item.value.get('src');
        let tab = [];
        for (let v of item.list) {
            tab.push(currentBinding.get(v));
        }
        for (let obj of tab) {
            place.value.delete(obj);
        }
    }
    for (let item of cloneTransition.outFlows) {
        let vP = item.value.get('tgt');
        let newOutput = new ValuePlace();
        let tab = [];
        for (let v of item.list) {
            let valCurr = currentBinding.get(v);
            newOutput.list.push(valCurr);
            newOutput.list.push(',');
        }
        let list;
        list = newOutput.list;
        newOutput.list.splice(-1, 1);
        vP.value.set(newOutput.list[0], newOutput);
    }
    //is it a new state?
    let newKey = generatingHeraklitString(cloneState);
    let existingState = g.stateMap.get(newKey);
    //If yes add it to the Reachability graph,add to the todoList, add transition edge (old state to new state )
    // if yes store into disk as image(png ,svg,..) and heraklit notation
    let rs = new ReachabilityGraph_1.ReachableState();
    rs.name = "rs" + g.stateMap.size;
    rs.symbolTable = cloneState;
    if (!existingState) {
        g.stateMap.set(newKey, rs);
        todoList.push(rs);
        let rgt = new ReachabilityGraph_1.RGTransition();
        rgt.name = transition.name;
        rgt.target = rs;
        state.outGoingTransition.push(rgt);
        //generate graph
        generatingGraphState(state, g, newKey, g.stateMap.size);
    }
    else {
        // else add this transition into a old state 
        let rgt = new ReachabilityGraph_1.RGTransition();
        rgt.name = transition.name;
        rgt.target = existingState;
        state.outGoingTransition.push(rgt);
    }
}
function generatingHeraklitString(state) {
    var _a, _b, _c, _d;
    let predicate = [];
    for (let symbol of state.values()) {
        if (symbol._type === "Place") {
            let line = `Place( ${symbol.name} )`;
            predicate.push(line);
            for (let s of symbol.value.values()) {
                let vp = s;
                line = `${symbol.name}( ${vp.list.join('')} )`;
                predicate.push(line);
            }
        }
        else if (symbol._type === "Transition") {
            let line = `Transition( ${symbol.name} )`;
            predicate.push(line);
            let transition = symbol;
            if (transition.inFlows.length) {
                for (let flow of transition.inFlows) {
                    let line = `${(_a = flow.value.get('src')) === null || _a === void 0 ? void 0 : _a.name}, ${(_b = flow.value.get('tgt')) === null || _b === void 0 ? void 0 : _b.name}, `;
                    if (flow.list.length >= 0) {
                        for (let variable of flow.list) {
                            line += `${variable}, `;
                        }
                    }
                    line = `Flow ( ${line})`;
                    predicate.push(line);
                }
            }
            if (transition.outFlows.length) {
                for (let flow of transition.outFlows) {
                    let line = `${(_c = flow.value.get('tgt')) === null || _c === void 0 ? void 0 : _c.name}, ${(_d = flow.value.get('src')) === null || _d === void 0 ? void 0 : _d.name}, `;
                    if (flow.list.length >= 0) {
                        for (let variable of flow.list) {
                            line += `${variable}, `;
                        }
                    }
                    line = `Flow ( ${line})`;
                    predicate.push(line);
                }
            }
            if (transition.equations) {
                for (let [k, v] of transition.equations) {
                    let lineR = "";
                    let lineV = "";
                    if (v.result.list.length >= 0) {
                        //check all result
                        for (let r of v.result.list) {
                            lineR += `${r}, `;
                        }
                        lineR = `( ${lineR} )`;
                        //check all param
                        for (let p of v.params.list) {
                            lineV += `${p}, `;
                        }
                        lineV = `f( ${lineV} )`;
                    }
                    let line = `Equation( ${transition.name}, ${lineR} = ${lineV}  )`;
                    predicate.push(line);
                }
            }
        }
    }
    predicate = predicate.sort();
    let fullText = predicate.join('\n');
    return fullText;
}
function generatingGraphState(state, rg, key, i) {
    var _a, _b, _c, _d, _e, _f;
    let dg = (0, ts_graphviz_1.digraph)('G');
    for (let elt of state.symbolTable.values()) {
        // const value = symbolTable.get(elt);
        if (elt._type === 'Transition') {
            const node = dg.createNode(elt.name, {
                [ts_graphviz_1.attribute.shape]: "box",
            });
        }
        else if (elt._type === 'Place') {
            let key = '';
            for (let v of elt.value.values()) {
                let vp = v;
                key += '(' + vp.list.join('') + ') ';
            }
            const node = dg.createNode(elt.name, {
                [ts_graphviz_1.attribute.label]: key
            });
        }
    }
    for (let elt of state.symbolTable.values()) {
        if (elt._type === 'Transition') {
            let transition = elt;
            for (let item of transition.inFlows) {
                const src = (_a = item.value.get('src')) === null || _a === void 0 ? void 0 : _a.value.keys();
                const srcVal = "{" + item.list.join(",") + "}";
                const placeN = (_c = (_b = item.value) === null || _b === void 0 ? void 0 : _b.get('src')) === null || _c === void 0 ? void 0 : _c.name;
                const node = dg.createEdge([placeN, transition.name], {
                    [ts_graphviz_1.attribute.label]: srcVal
                });
            }
            for (let item of transition.outFlows) {
                const tgt = (_d = item.value.get('tgt')) === null || _d === void 0 ? void 0 : _d.value.keys();
                const tgtVal = "{" + item.list.join(",") + "}";
                const placeN = (_f = (_e = item.value) === null || _e === void 0 ? void 0 : _e.get('tgt')) === null || _f === void 0 ? void 0 : _f.name;
                const node = dg.createEdge([transition.name, placeN], {
                    [ts_graphviz_1.attribute.label]: tgtVal
                });
            }
        }
    }
    graphToImagePng(dg, "rs" + i);
}
// function createGraphByStep(){
//   for ( let [elt , val] of symbolTable ){
//     if ( val._type === 'Transition' ){
//       runTransition(val as Transition)
//     }
//   }
// }
// DoOneTransitionVariable()
// function DoOneTransitionVariable(){
//   for ( let [elt , val ] of symbolTable ){
//     const transition = val as Transition
//     if ( val._type === 'Transition' ){
//        for ( let flow of transition.inFlows){
//         bindInputVariable(flow)
//        }
//     }
//   }
// }
// function bindInputVariable(flow:Flow){
//   let place = flow.value.get('src') as ValuePlace
//   const tab:any[] = flow.list
//   console.log(tab)
// }
// function runTransition(transition:Transition){
//   let i=1
//   let newSymbolTable:Map<string,Symbol>=new Map(symbolTable)
//   for ( let elt of bindingsList?.bindings ){
//     const g = digraph('G'+i);
//     const node = g.createNode(transition.name,{
//       [attribute.shape]: "box",
//     })
//     for ( let item of transition.inFlows ){
//       let place = item.value.get('src') as ValuePlace
//       let tab:any[]=[]
//       for ( let v of item.list ){
//         tab.push(elt.get(v))
//       }  
//       let value = '('+tab.join(',')+')'
//       if (tab){
//         // const node2 = g.createNode(value)
//         for ( let obj of tab ){
//          // newSymbolTable.get(place.name)?.value.delete
//           place.value.delete(obj)
//         }
//         let tab2:any[]=[]
//         for ( let objP of place.value.keys()){
//           tab2.push(objP)
//         }
//         let value2 = '('+tab2.join(',')+')'
//         const edge = g.createEdge([value2,transition.name],)
//       } 
//     }
//       for ( let item of transition.outFlows){
//         let flow = item.value.get('tgt') as Flow
//         let place = symbolTable.get(flow.name)
//         let tab:any[]=[]
//         for ( let v of item.list ){
//           tab.push(elt.get(v))
//         }  
//         let value = '('+tab.join(',')+')'
//         if ( value){
//           const node3 = g.createNode(value)
//           const edge = g.createEdge([transition.name,value])
//         }
//         console.log(flow)
//       }
//     i++;  
//     graphToImagePng(g,'test'+i)
//   }
// }
// function generatingReachabilityGraph(rg:ReachabilityGraph){
//   let dg = digraph('RG')
//   let i = 0
//   for(let elt of rg.stateMap.values()) {
//     let currentState:string = 'S0'
//     i++
//     let currentOutgoingTransition:RGTransition[] = existSuccessors(elt)
//     // for(let currentOutgoingTransition of elt.outGoingTransition){ 
//     const edge = dg.createEdge([currentState,"s"+i])
//     i++;
//     while(currentOutgoingTransition){
//       let j = 0
//     }
//     break;
//   }  
//   graphToImagePng(dg,"reachabilityGraph")
// }
// function existSuccessors(rs:ReachableState){
//     if(rs.outGoingTransition.length > 0){
//       return rs.outGoingTransition;
//     }else{
//       return [];
//     }
// }
async function writeOnFile(data, file) {
    try {
        await fs_2.promises.writeFile((0, path_1.join)(__dirname, file), data, {
            flag: 'w',
        });
        const contents = await fs_2.promises.readFile((0, path_1.join)(__dirname, file), 'utf-8');
        console.log(contents);
        return contents;
    }
    catch (err) {
        console.log(err);
        return 'Something went wrong';
    }
}
//convert dot file to png
function graphToImagePng(g, imageName) {
    const dot = (0, ts_graphviz_1.toDot)(g);
    const render = (0, graphviz_cli_renderer_1.CliRenderer)({ outputFile: "./output/" + imageName + ".svg", format: "svg" });
    (async () => {
        try {
            await render(dot);
        }
        catch (error) {
            console.log(error);
        }
    })();
}
