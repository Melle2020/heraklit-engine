import { Symbol } from "./heraklit"

class RGTransition{
    name!:string
    target!: ReachableState
    }

class ReachableState{
    symbolTable : Map<string,Symbol> = new Map()
    outGoingTransition: RGTransition[]=[]
    name: string = ''
}

class ReachabilityGraph{
   stateMap:Map<string,ReachableState> = new Map()

 
}
export  { ReachabilityGraph , ReachableState , RGTransition}