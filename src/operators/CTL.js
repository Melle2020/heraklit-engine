"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExistFinallyOperator {
    constructor() {
        this.example = [];
        this.todo = [];
        this.done = [];
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
    }
    find(start, predicate) {
        this.todo.push(start);
        while (!(this.todo.length === 0)) {
            let currentState = this.todo.delete(0);
            this.done.push(currentState);
            let foundIt = predicate.test(currentState);
            if (foundIt) {
                // construct the example path
                return true;
            }
            // go for successors
            for (let next of currentState.successors()) {
                if (!this.done.includes(next)) {
                    let nextPath = [];
                    nextPath.push([currentPath, ...]);
                    nextPath.push(next);
                    this.todo.push(nextPath);
                }
            }
            return false;
        }
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
