import { Association, Symbol, Transition } from "./heraklit"

class RGTransition{
    name!:string
    target!: ReacheableState
    }

class ReacheableState{
    symbolTable : Map<string,Symbol> = new Map()
    outGoingTransition: RGTransition[]=[]
}

class ReacheabilityGraph{
   stateMap:Map<string,ReacheableState> = new Map()

 
}
export  { ReacheabilityGraph , ReacheableState , RGTransition}