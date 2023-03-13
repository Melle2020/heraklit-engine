
export class Symbol {
  name!: string
  _type!: string
  value: Map<string, Symbol> = new Map()
}

export class Transition extends Symbol {
  inFlows: Flow[] = []
  outFlows: Flow[] = []
  equations: Map<string, definition> = new Map()
  valueAssociation: Map<string, Association> = new Map()
}

export class Flow extends Symbol {
  list: string[] = []
}

export class Association extends Symbol {
  params!: Params
  result!: Result
}

export class definition {
  params!: Params
  result!: Result
}

export class Params {
  list: string[] = []
}

export class Result {
  list: string[] = []
}

export class ValuePlace extends Symbol {
  list: string[] = []
}
export class TypeValue extends Symbol {
  declaration: Map<string, string[]> = new Map()
}