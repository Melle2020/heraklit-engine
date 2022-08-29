import { attribute, digraph, Dot, toDot  } from 'ts-graphviz';
import fs from 'fs'
import {CliRenderer} from "@diagrams-ts/graphviz-cli-renderer";
import { readFileSync, writeFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';

const g = digraph('G');
const data = fs.readFileSync('./data/G2.hera', 'utf8')

//Class system

const symbolTable: Map<string, Symbol> = new Map();

class Symbol {
  name!: string
  _type!: string
  value: Map<string, Symbol> = new Map()
}

class Transition extends Symbol{
  inFlows: Symbol[] = [] 
  outFlows:Symbol[] = []
  equations: Map<string,definition> = new Map()
}

class definition{
  params!:Params
  result!: Result
}

class Params{
  list:string[]=[]
}

class Result{
  list:string[]=[]
}

class Flow extends Symbol{
  var:string[]=[];
}

class ValuePlace extends Symbol{
  list:string[]=[]
}
class oderValue extends Symbol{
  name!: string;
  _type!:string
  list!:string[]

}




const lines = data.toString().replace(/\r\n/g, '\n').split('\n');



setSymboleTableByReading (lines)
addValueToSymbolTable(lines)
getValueByKey(lines)
graphCreated(symbolTable)
initializedEntry(symbolTable,g)
checkAllTransition(g,symbolTable)
writeHeraklitSymbolTable(symbolTable,g)
// runOnTransition(g,symbolTable)

//Set all symbol in symbol table
function setSymboleTableByReading (lines:any) {
    for (const line of lines) {

        const tokensRegExp = /([\w-]+|\(|\)|\,)/g
        const tokenList = line.match(tokensRegExp)
        // console.log("token list: " + JSON.stringify(tokenList))
    
        const openBracePos = line.indexOf('(');
        const closeBracePos = line.indexOf(')');
        const relName = line.substring(0, openBracePos);
    
        const params = line.substring(openBracePos + 1, closeBracePos)
        const words:any[] = params.split(',')
    
        const name = words[0].trim()
        
        if (relName === 'Place') {
            symbolTable.set(name, {
              name:name,
              _type:relName,
              value: new Map()
            })
            // console.log(JSON.stringify(symbolTable.get(name)))
        }
        else if (relName === 'Transition') {

          const transition = new Transition()
          transition.name=name
          transition._type=relName
          symbolTable.set(name, transition)
            // console.log(JSON.stringify(symbolTable.get(name)))
        }

        
        // console.log(symbolTable)
    }  
}

//set value in symbol table
function addValueToSymbolTable(lines:any){

  for (const line of lines) {

    const tokensRegExp = /([\w-]+|\(|\)|\,|\=)/g
    const tokenList = line.match(tokensRegExp)
    // console.log("token list: " + JSON.stringify(tokenList))
    if(line===''){
      continue;
    }
    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);
    if (relName === 'Place' || relName === 'Transition') {
      continue;
    }

    const params = line.substring(openBracePos + 1, closeBracePos)
    
    if(relName==='Flow'){
    const srcName = tokenList[2]
      const trgName = tokenList[4]
      const srcSymbol = symbolTable.get(srcName) as Symbol
      const tgtSymbol = symbolTable.get(trgName) as Symbol


      if( srcSymbol?._type==='Transition'){
        //Outgoing flow
      const myTrans = srcSymbol as Transition
      const flow = new Flow()
      flow._type='Flow'
      flow.value.set('src',srcSymbol)
      flow.value.set('tgt',tgtSymbol)

      for (let i = 6; i<tokenList.length;i=i+2){
        flow.var.push(tokenList[i])
        // console.log('added var '+ tokenList[i])   
      }
      myTrans.outFlows.push(flow)
        console.log("Here")
      }
      else{
        //Incomming flow
        const myTrans = tgtSymbol as Transition
        const flow =  new Flow();
        flow._type='Flow'
        flow.value.set('src',srcSymbol)
        flow.value.set('tgt',tgtSymbol)
        for (let i = 6; i<tokenList.length;i=i+2){
          flow.var.push(tokenList[i])
          // console.log('added var '+ tokenList[i])   
        }
        myTrans.inFlows.push(flow)
        console.log("Here")
      }


      console.log("Here")
    }
    else if( relName==='Equation'){
      const key=tokenList[2]
      const keySymbol= symbolTable.get(key) as Transition

      if(keySymbol?._type==="Transition"){
      //  const myTrans = new Transition()
       let i=5
       let params = new Params()
       let result = new Result()

       while( tokenList[i]!='='){
        result.list.push(tokenList[i])
        i=i+2
      }
      let j=i

      i=i+3
       while (tokenList[i]!=')') {
        params.list.push(tokenList[i])
        i=i+2;
            
      }
        keySymbol.equations.set(tokenList[j+1],{
          params:params,
          result:result

        }

        )
        // console.log( keySymbol.equations.get(tokenList[i+2]))
      }
      else{

      }
      
      
      
      // console.log(symbolTable)
    }

}

}

function getValueByKey(lines:any){

  for (const line of lines) {

    const tokensRegExp = /([\w-]+|\(|\)|\,)/g
    const tokenList = line.match(tokensRegExp)
    // console.log("token list: " + JSON.stringify(tokenList))

    const openBracePos = line.indexOf('(');
    const closeBracePos = line.indexOf(')');
    const relName = line.substring(0, openBracePos);

    const params = line.substring(openBracePos + 1, closeBracePos)
    const words:any[] = params.split(',')

    const name = words[0].trim()
    
    if (relName === 'Place'|| relName==='Transition'|| relName==='Equation' || relName==='Flow'||relName==='') {
        continue;
        // console.log(JSON.stringify(symbolTable.get(name)))
    }

    const valueSymbol=symbolTable.get(relName)
    let i=2
    const val=new ValuePlace()
    

   
   

    if(valueSymbol?._type==='Place'){
      while(tokenList[i]!=')'){
        val.list.push(tokenList[i])
        i++
      }
      symbolTable.get(valueSymbol.name)?.value.set(name,val)
    }else{
  //     symbolTable.set('oder',{
  //       name!: ,
  // _type!:,
  // list!:

  //     })
    }

    // console.log(symbolTable)
}

}

function graphCreated(symbolTable:any){

  for(let elt of symbolTable.keys()){
    const value=symbolTable.get(elt);
    if(value._type==='Transition'){
        const node=g.createNode(elt,{
                [attribute.shape]: "box",
              })
    } else{
           
        
        //  const node=g.createNode(elt,{[attribute.label]: " test"})

    }
    
}
  for(let elt of symbolTable.keys()){
    // console.log(elt);
    // console.log("Value"+JSON.stringify(symbolTable.get(elt)))
    const value=symbolTable.get(elt);
    if(value._type==='Transition'){
        let i=1
        for(let item of value.inFlows){
            
            const src = item.value.get('src').value.keys()
            const srcVal="{"+item.var.join(",")+"}"
             
                const node=g.createEdge([item.value.get('src').name,elt],{
                    [attribute.label]: srcVal
    
                })

             i++;
            
        }
        for(let item of value.outFlows){
          const tgt = item.value.get('tgt').value.keys()
            const tgtVal="{"+item.var.join(",")+"}"
          
          // i
              
              const node=g.createEdge([elt,item.value.get('tgt').name],{
                [attribute.label]: tgtVal

              })
    
           i++;
      }
      
        
    } 
}
graphToImagePng(g,'Gen')

}


function initializedEntry(symbolTable:any,g:any){
  for(let elt of symbolTable.keys()){

    const value=symbolTable.get(elt);
    if(value._type==='Transition'){
//get all edges of graph
      let gEdge=g.edges
      //find all entry flows
      for(let item of value.inFlows){
        const src = item.value.get('src').name
        // const srcVal="{"+item.var.join(",")+"}"
        // check all edge
        let i=0
        for(let val of gEdge){
          if(src===val.targets[0].id){

            const place = symbolTable.get(src)

            let key =''
            if(place._type==='Place'){

              for(let k of place.value.keys()){
              key=k
            }

            const placevalue=place.value.get(key).list
            gEdge[i].targets[0].port= gEdge[i].targets[0].id
            gEdge[i].targets[0].id= gEdge[i].targets[0].id.replace(val.targets[0].id,"("+placevalue.join("")+")")
            

            
            gEdge

            }
          

          }
          i++
        }

      }


      for(let item of value.outFlows){
        const tgt = item.value.get('tgt').name

        // check all edge
        let i=0
        for(let val of gEdge){
          if(tgt===val.targets[1].id){

            const place = symbolTable.get(tgt)

            let key =''

            if(place._type==='Place'){

              for(let k of place.value.keys()){
              key=k
            }
            const placevalue=place.value.get(key).list
            gEdge[i].targets[1].port= gEdge[i].targets[1].id
            gEdge[i].targets[1].id= gEdge[i].targets[1].id.replace(val.targets[1].id,"")
            


            
            gEdge

            }
          

          }
          i++
        }
      }
      
    }

  }

  graphToImagePng(g,'InitVal')



}


function checkAllTransition(g:any,symbolTable:any){

const trans = g.nodes
let gEdge=g.edges
let j=1
for(let t of trans){

  const eSymbol=symbolTable.get(t.id)
  console.log(eSymbol)

  for(let elt of eSymbol.outFlows){
    const tgt = elt.value.get('tgt').name
    let i=0
      
   for(let e of gEdge){
    let place = symbolTable.get(e.targets[0].port)
    if(tgt===e.targets[1].port && t.id=== e.targets[0].id){

        place=symbolTable.get(tgt)

            let key =''
            if(place._type==='Place'){

              for(let k of place.value.keys()){
              key=k
            }

            const placevalue=place.value.get(key).list
            
            // gEdge[i].targets[1].id= "("+placevalue.join("")+")"
            gEdge[i].attributes.attrs.set("label","("+placevalue.join("")+")")
            i++
            
           }
   
    // const tgtVal="{"+elt.var.join(",")+"}"

   }else if(place && gEdge[i].targets[0].id && place._type==="Place"){
    gEdge[i].attributes.attrs.set("label",gEdge[i].targets[0].id)

    // gEdge[i].targets[0].id= ""
      
     
   
    i++

}else{
  if(i===gEdge.length){
    break;
  }
  i++
}
   console.log(g)

  }
          

    
  }
  graphToImagePng(g,'RunTransition'+j)
j++;

}



}

async function writeHeraklitSymbolTable(symbolTable:any,g:any){

  let data=""
  for(let trans of g.nodes ){
  //Adding all place
    for(let e of g.edges){
      
      if(e.targets[0].id===trans.id ){
       
        data=data+'Place( '+e.targets[1].port+ ' )'+'\n'
      }
      else if(e.targets[1].id===trans.id){
        data=data+'Place( '+e.targets[0].port+ ' )'+'\n'

      }

      }

      data=data+'Transition( '+trans.id+ ' )'+'\n'
      for(let e of g.edges){
      
        
         
          data=data+'Flow( '+(e.targets[0].port||e.targets[0].id)+', ' +(e.targets[1].port||e.targets[1].id)+')'+'\n'
        
       
  
        }

    }
    writeOnFile(data,'G3.hera')


      // data=data+'Transition( '+trans.id+ ' )'+'\n'

    
}



async function writeOnFile(data:string,file:string){
  try {
    await fsPromises.writeFile(join(__dirname, file), data, {
      flag: 'w',
    });

    const contents = await fsPromises.readFile(
      join(__dirname, file),
      'utf-8',
    );
    console.log(contents); // 👉️ "One Two Three Four"

    return contents;
  } catch (err) {
    console.log(err);
    return 'Something went wrong';
  }

}

// console.log(g)



function graphToImagePng(g:any,imageName:string){
  const dot = toDot(g);
  console.log(dot);
  
  const render = CliRenderer({ outputFile: "./outPut/"+imageName+".png", format: "png" });
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
