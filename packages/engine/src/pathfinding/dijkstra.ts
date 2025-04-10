import { isDefined, isFunction } from '@game/shared';
import { PriorityQueue } from '../utils/priority-queue';

export type NodeKey = string | number;

export type Edge<T> = {
  node: T;
  weight: number;
};

type QueueEntry<T> = {
  node: T;
  cost: number;
};

export interface GraphAdapter<T> {
  getKey?: (node: T) => NodeKey;
  getEdges: (node: T) => Edge<T>[];
}

const getNodeKey = <T>(node: T, adapter: GraphAdapter<T>): NodeKey => {
  if (isFunction(adapter.getKey)) return adapter.getKey(node);
  if (typeof node === 'string' || typeof node === 'number') return node;
  throw new Error('Adapter must implement method getKey');
};

export const dijkstra = <T>(
  adapter: GraphAdapter<T>,
  {
    startNode,
    finishNode,
    maxWeight
  }: { startNode: T; finishNode?: T; maxWeight?: number }
) => {
  const getKey = (node: T) => getNodeKey(node, adapter);
  const parents: Record<NodeKey, T> = {};
  const costs: Record<NodeKey, number> = {};
  const explored: Record<NodeKey, boolean> = {};
  const prioQueue = new PriorityQueue<QueueEntry<T>>({
    comparator: (a, b) => a.cost - b.cost
  });
  prioQueue.queue({ node: startNode, cost: 0 });
  do {
    const node = prioQueue.dequeue().node;
    const nodeKey = getKey(node);
    const cost = costs[nodeKey] || 0;

    explored[nodeKey] = true;

    // Early return when the shortest path in our
    // graph is already the finishNode
    if (isDefined(finishNode) && nodeKey === getKey(finishNode)) break;
    const edges = adapter.getEdges(node);
    edges.forEach(edge => {
      const childNode = edge.node;
      const childNodeKey = getKey(childNode);
      const newCost = cost + edge.weight;

      const isTooExpensive =
        isDefined(costs[childNodeKey]) &&
        newCost > Math.min(costs[childNodeKey], maxWeight ?? Infinity);
      if (isTooExpensive) return;

      costs[childNodeKey] = newCost;
      parents[childNodeKey] = node;

      if (!explored[childNodeKey]) {
        prioQueue.queue({ node: childNode, cost: newCost });
      }
    });
  } while (prioQueue.length);

  return {
    costs,
    parents
  };
};

export const findShortestPath = <T>({
  adapter,
  distanceMap,
  startNode,
  finishNode,
  maxWeight
}: {
  adapter: GraphAdapter<T>;
  distanceMap?: {
    costs: Record<NodeKey, number>;
    parents: Record<NodeKey, T>;
  };
  startNode: T;
  finishNode: T;
  maxWeight?: number;
}) => {
  const getKey = (node: T) => getNodeKey(node, adapter);
  const { costs, parents } =
    distanceMap ?? dijkstra(adapter, { startNode, finishNode, maxWeight });

  const optimalPath = [finishNode];
  let parent = parents[getKey(finishNode)];
  if (!parent) return null;

  while (parent) {
    if (parent !== startNode) {
      try {
        optimalPath.push(parent);
      } catch (err) {
        console.log(`Error going from ${getKey(startNode)} to ${getKey(finishNode)}`);
        console.log({ costs, parents });
        console.log(optimalPath.slice(0, 100));
        throw err;
      }
    }
    parent = parents[getKey(parent)];
  }

  optimalPath.reverse();

  const results = {
    distance: costs[getKey(finishNode)],
    path: optimalPath
  };

  return results;
};
