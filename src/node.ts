export enum NodeType {
    None,
    Scalar,
    List,
    Dict
}

export type Dict = {
    [key: string]: Node<List | Dict | Scalar>;
}

export type Scalar = string;

export type List = Array<Node<List | Dict | Scalar>>;

export class Node<NodeValueType> {
    public type: NodeType;
    public value: NodeValueType;

    constructor(type: NodeType, val: NodeValueType) {
        this.type = type;
        this.value = val;
    }
}