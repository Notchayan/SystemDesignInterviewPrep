const crypto = require('crypto');

class Node {
    constructor(id, weight) {
        this.id = id;
        this.weight = weight;
    }
}

class Request {
    constructor(id) {
        this.id = id;
    }
}

class ConsistentHashing {
    constructor(hashFunction, pointMultiplier) {
        if (pointMultiplier === 0) {
            throw new Error('pointMultiplier must be non-zero');
        }
        this.pointMultiplier = pointMultiplier;
        this.hashFunction = hashFunction;
        this.nodePositions = new Map();
        this.nodeMappings = new Map();
    }

    hash(key) {
        return parseInt(this.hashFunction(key), 16);
    }

    addNode(node) {
        this.nodePositions.set(node, []);
        for (let i = 0; i < this.pointMultiplier; i++) {
            for (let j = 0; j < node.weight; j++) {
                const point = this.hash((i * this.pointMultiplier + j) + node.id);
                this.nodePositions.get(node).push(point);
                this.nodeMappings.set(point, node);
            }
        }
    }

    removeNode(node) {
        const positions = this.nodePositions.get(node);
        if (positions) {
            positions.forEach(point => {
                this.nodeMappings.delete(point);
            });
            this.nodePositions.delete(node);
        }
    }

    getAssignedNode(request) {
        const key = this.hash(request.id);
        let assignedNode = null;
        for (let [point, node] of this.nodeMappings) {
            if (point >= key) {
                assignedNode = node;
                break;
            }
        }
        return assignedNode || Array.from(this.nodeMappings.values())[0];
    }
}
