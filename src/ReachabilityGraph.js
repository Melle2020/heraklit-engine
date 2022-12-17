"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RGTransition = exports.ReachableState = exports.ReachabilityGraph = void 0;
class RGTransition {
}
exports.RGTransition = RGTransition;
class ReachableState {
    constructor() {
        this.symbolTable = new Map();
        this.outGoingTransition = [];
        this.name = '';
    }
}
exports.ReachableState = ReachableState;
class ReachabilityGraph {
    constructor() {
        this.stateMap = new Map();
    }
}
exports.ReachabilityGraph = ReachabilityGraph;
