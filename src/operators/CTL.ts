import { ReachableState } from "../ReachabilityGraph";

export class ExistFinallyOperator {

    example:ReachableState[] = [];
    todo:ReachableState[][] = [];
    done:ReachableState[] = []

    find(start:ReachableState,predicate:Function){
        let firstPath = []
        firstPath.push(start)
        this.todo.push(firstPath)
        // this.todo.push(start);
        while(this.todo.length > 0) {
            let currentPath:ReachableState[] = this.todo.shift()||[]
            let currentState:ReachableState= currentPath[currentPath.length-1]
            this.done.push(currentState)
            if(predicate(currentState)) {
              // construct the example path
              this.example = currentPath
              return true
            }
            // go for successors
            for(let next of currentState.outGoingTransition) {
                if ( ! this.done.includes(next.target)) {
                   let nextPath = [...currentPath]
                   console.log(nextPath)
                    nextPath.push(next.target);
                    this.todo.push(nextPath);
                }
            }
        return false;
    }
}

}