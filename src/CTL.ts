import { ReachableState } from "./ReachabilityGraph";

class ExistFinallyOperator {

    example:ReachableState[] = [];
    todo:ReachableState[] = [];
    done:ReachableState[] = []

    find(start:ReachableState, 
                   predicate:Predicate<ReachableState>){

        this.todo.push(start);

        while ( !(this.todo.length === 0) ) {

           let  currentState:ReachableState = this.todo.delete(0);

            this.done.push(currentState);

            let foundIt:boolean = predicate.test(currentState);

            if (foundIt) {
                // construct the example path

                return true;
            }

            // go for successors
            for(let next of currentState.successors()) {
                
                if ( ! this.done.includes(next)) {
                   let nextPath:ReachableState[] = [];
                    nextPath.push([currentPath...]);
                    nextPath.push(next);
                    this.todo.push(nextPath);
                    

            }

        }

        return false;


    }


}


// ArrayList<ReachableState> example = new ArrayList<>();

//     ArrayList<ArrayList<ReachableState>> todo = new ArrayList<>();
//     ArrayList<ReachableState> done = new ArrayList<>();

//     boolean find( ReachableState start, 
//                   Predicate<ReachableState> predicate) {

//         ArrayList<ReachableState> firstPath = new ArrayList();
//         firstPath.add(start);
//         todo.add(firstPath);

//         while ( ! todo.isEmpty() ) {

//             ArrayList<ReachableState> currentPath = todo.remove(0);
//             ReachableState currentState = currentPath.get(currentPath.length -1);

//             done.add(currentState);

//             boolean foundIt = predicate.test(currentState);

//             if (foundIt) {
//                 // construct the example path
//                 example = currentPath;

//                 retúrn true;
//             }

//             // go for successors
//             for(ReachableState next of currentState.successors) {
//                 if ( ! done.contains(next)) {
//                    ArrayList<ReachableState> nextPath = new ArrayList();
//                    nextPath.addAll(currentPath);
//                    nextPath.add(next);
//                    todo.add(nextPath);
//                 }

//             }

//         }

//         return false;


//     }


// }