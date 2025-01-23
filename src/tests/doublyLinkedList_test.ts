import {
    assertEquals,
    assertExists,
    describe,
    it
} from "../../deps.ts";
import { ValueDoublyLinkedList, FreqDoublyLinkedList } from '../doublyLinkedLists.ts';

describe("ValDoublyLinkedList tests", () => {

  const list = new ValueDoublyLinkedList();
  const time = new Date();

  it("Should properly handle an empty list", () => {
    assertEquals(list.head, null);
    assertEquals(list.tail, null);
  });

  it("Should properly add a sinlge node", () => {
    list.addHead('C', {headers: {}, body: new Uint8Array([1]), status: 200}, 50, time);
    assertEquals(list.head, list.tail);
    assertEquals(list.head?.next, null);
    assertEquals(list.head?.prev, null);
    assertEquals(list.tail?.next, null);
    assertEquals(list.tail?.prev, null);
  });

  it("Should properly add nodes to the start of the linked list", () => {
    list.addHead('B', {headers: {}, body: new Uint8Array([2]), status: 200}, 100, time);
    list.addHead('A', {headers: {}, body: new Uint8Array([3]), status: 200}, 200, time);
    assertEquals(list.tail?.key, 'C');
    assertEquals(list.head?.key, 'A');
    assertEquals(list.head?.next?.key, 'B');
    assertEquals(list.head?.next?.next?.key, 'C');
    assertEquals(list.head?.next?.next?.next, null);
    assertEquals(list.head?.next?.next, list.tail);
    assertEquals(list.tail?.next, null);
  });

  it("Should store properties corretly on nodes", () => {
    assertEquals(list.head?.value.body, new Uint8Array([3]));
    assertEquals(list.head?.next?.value.body, new Uint8Array([2]));
    assertEquals(list.head?.next?.next?.value.body, new Uint8Array([1]));
    assertEquals(list.head?.value.status, 200);
    assertEquals(list.head?.next?.value.status, 200);
    assertEquals(list.head?.next?.next?.value.status, 200);
    assertEquals(list.head?.byteSize, 200);
    assertEquals(list.head?.next?.byteSize, 100);
    assertEquals(list.head?.next?.next?.byteSize, 50);
  });

  it("Should properly delete nodes with delete method", () => {
    const list2 = new ValueDoublyLinkedList();
    const time2 = new Date();

    const node1 = list2.addHead('A', {headers: {}, body: new Uint8Array([1]), status: 200}, 200, time2);
    const node2 = list2.addHead('B', {headers: {}, body: new Uint8Array([2]), status: 200}, 200, time2);
    const node3 = list2.addHead('C', {headers: {}, body: new Uint8Array([3]), status: 200}, 200, time2);
    const node4 = list2.addHead('D', {headers: {}, body: new Uint8Array([4]), status: 200}, 200, time2);

    assertEquals(list2.head, node4);
    assertEquals(list2.tail, node1);

    list2.delete(node2);

    assertEquals(list2.head, node4);
    assertEquals(list2.head?.next, node3);
    assertEquals(list2.head?.next?.next, node1);
    assertEquals(list2.head?.next?.next?.next, null);

    assertEquals(list2.tail, node1);
    assertEquals(list2.tail?.prev, node3);
    assertEquals(list2.tail?.prev?.prev, node4);
    assertEquals(list2.tail?.prev?.prev?.prev, null);

    list2.delete(node4);

    assertEquals(list2.head, node3);
    assertEquals(list2.head?.next, node1);
    assertEquals(list2.head?.next?.next, null);

    assertEquals(list2.tail, node1);
    assertEquals(list2.tail?.prev, node3);
    assertEquals(list2.tail?.prev?.prev, null);

    list2.delete(node1);

    assertEquals(list2.head, node3);
    assertEquals(list2.tail, node3);
    assertEquals(list2.head, list2.tail);

    list2.delete(node3);

    assertEquals(list2.head, null);
    assertEquals(list2.tail, null);
  })

  it("Should properly delete nodes from the tail of the linked list with nodes remaining", () => {
    list.deleteTail();
    assertEquals(list.tail?.key, 'B');
    assertEquals(list.head?.key, 'A');
  });

  it("Should properly delete all nodes from the list.", () => {
    list.deleteTail();
    list.deleteTail();
    assertEquals(list.tail, null);
    assertEquals(list.head, null);
  });
});



describe('FreqDoublyLinkedList tests', () => {

  const freqList = new FreqDoublyLinkedList()
  const time = new Date();

  it("Should properly handle an empty list", () => {
    assertEquals(freqList.head, null);
    assertEquals(freqList.tail, null);
  });

  it("Should properly add a sinlge node", () => {
    freqList.addNewFreq('C', {headers: {}, body: new Uint8Array([1]), status: 200}, 50, time);
    assertEquals(freqList.head, freqList.tail);
    assertEquals(freqList.head?.next, null);
    assertEquals(freqList.head?.prev, null);
    assertEquals(freqList.tail?.next, null);
    assertEquals(freqList.tail?.prev, null);
  });

  it("Should properly add nodes to the start of the linked list", () => {
    freqList.addNewFreq('B', {headers: {}, body: new Uint8Array([2]), status: 200}, 100, time);
    freqList.addNewFreq('A', {headers: {}, body: new Uint8Array([3]), status: 200}, 200, time);
    assertEquals(freqList.tail?.freqValue, 1);
    assertEquals(freqList.head?.freqValue, 1);
    assertEquals(freqList.head?.next, null);
    assertEquals(freqList.tail?.next, null);
    assertEquals(freqList.head, freqList.tail);
    assertEquals(freqList.head?.valList.head?.key, 'A');
    assertEquals(freqList.head?.valList.head?.next?.key, 'B');
    assertEquals(freqList.head?.valList.head?.next?.next?.key, 'C');
  });

  it("Should properly update list when node frequency value is increased", () => {
    const headNode1 = freqList.head?.valList.head;

    assertExists(headNode1);
    const newNode = freqList.increaseFreq(headNode1);
    assertEquals(freqList.head?.freqValue, 1);
    assertEquals(freqList.head?.next?.freqValue, 2);
    assertEquals(freqList.head?.next?.next, null);
    assertEquals(freqList.head?.valList.head?.key, 'B')
    assertEquals(freqList.head?.valList.head?.next?.key, 'C')
    assertEquals(freqList.head?.next?.valList.head?.key, 'A')

    assertExists(newNode);
    freqList.increaseFreq(newNode);
    assertEquals(freqList.head?.freqValue, 1);
    assertEquals(freqList.head?.next?.freqValue, 3);
    assertEquals(freqList.head?.next?.next, null);
    assertEquals(freqList.head?.valList.head?.key, 'B')
    assertEquals(freqList.head?.valList.head?.next?.key, 'C')
    assertEquals(freqList.head?.next?.valList.head?.key, 'A')

    const headNode2 = freqList.head?.valList.head;
    assertExists(headNode2);
    freqList.increaseFreq(headNode2);
    assertEquals(freqList.head?.freqValue, 1);
    assertEquals(freqList.head?.next?.freqValue, 2);
    assertEquals(freqList.head?.next?.next?.freqValue, 3);
    assertEquals(freqList.head?.next?.next?.next, null);
    assertEquals(freqList.head?.valList.head?.key, 'C')
    assertEquals(freqList.head?.next?.valList.head?.key, 'B')
    assertEquals(freqList.head?.next?.next?.valList.head?.key, 'A')

    const headNode3 = freqList.head?.valList.head;
    assertExists(headNode3)
    freqList.increaseFreq(headNode3);
    assertEquals(freqList.head?.freqValue, 2);
    assertEquals(freqList.head?.next?.freqValue, 3);
    assertEquals(freqList.head?.valList.head?.key, 'C')
    assertEquals(freqList.head?.valList.head?.next?.key, 'B')
    assertEquals(freqList.head?.next?.valList.head?.key, 'A')

    const headNode4 = freqList.head?.valList.head;
    assertExists(headNode4)
    freqList.increaseFreq(headNode4);
    const headNode5 = freqList.head?.valList.head;
    assertExists(headNode5)
    freqList.increaseFreq(headNode5);
    assertEquals(freqList.head?.freqValue, 3);
    assertEquals(freqList.head?.next, null);
    assertEquals(freqList.head, freqList.tail);
    assertEquals(freqList.head?.valList.head?.key, 'B')
    assertEquals(freqList.head?.valList.head?.next?.key, 'C')
    assertEquals(freqList.head?.valList.head?.next?.next?.key, 'A')
  });

  it("Should properly delete nodes with delete method", () => {
    const freqList2 = new FreqDoublyLinkedList();
    const time2 = new Date();

    const node1 = freqList2.addNewFreq('A', {headers: {}, body: new Uint8Array([1]), status: 200}, 200, time2);
    const node2 = freqList2.addNewFreq('B', {headers: {}, body: new Uint8Array([2]), status: 200}, 200, time2);
    const node3 = freqList2.addNewFreq('C', {headers: {}, body: new Uint8Array([3]), status: 200}, 200, time2);
    const node4 = freqList2.addNewFreq('D', {headers: {}, body: new Uint8Array([4]), status: 200}, 200, time2);

    const freqNode1 = node1.parent;

    const freqNode2 = freqList2.increaseFreq(node2)?.parent;

    const tempNode3_1 = freqList2.increaseFreq(node3)
    assertExists(tempNode3_1);
    const freqNode3 = freqList2.increaseFreq(tempNode3_1)?.parent;

    const tempNode4_1 = freqList2.increaseFreq(node4);
    assertExists(tempNode4_1)
    const tempNode4_2 = freqList2.increaseFreq(tempNode4_1);
    assertExists(tempNode4_2);
    const freqNode4 = freqList2.increaseFreq(tempNode4_2)?.parent;

    assertExists(freqNode1);
    assertExists(freqNode2);
    assertExists(freqNode3);
    assertExists(freqNode4);

    assertEquals(freqList2.head, freqNode1);
    assertEquals(freqList2.tail, freqNode4);

    freqList2.delete(freqNode2);

    assertEquals(freqList2.head, freqNode1);
    assertEquals(freqList2.head?.next, freqNode3);
    assertEquals(freqList2.head?.next?.next, freqNode4);
    assertEquals(freqList2.head?.next?.next?.next, null);

    assertEquals(freqList2.tail, freqNode4);
    assertEquals(freqList2.tail?.prev, freqNode3);
    assertEquals(freqList2.tail?.prev?.prev, freqNode1);
    assertEquals(freqList2.tail?.prev?.prev?.prev, null);

    freqList2.delete(freqNode4);

    assertEquals(freqList2.head, freqNode1);
    assertEquals(freqList2.head?.next, freqNode3);
    assertEquals(freqList2.head?.next?.next, null);

    assertEquals(freqList2.tail, freqNode3);
    assertEquals(freqList2.tail?.prev, freqNode1);
    assertEquals(freqList2.tail?.prev?.prev, null);

    freqList2.delete(freqNode1);

    assertEquals(freqList2.head, freqNode3);
    assertEquals(freqList2.tail, freqNode3);
    assertEquals(freqList2.head, freqList2.tail);

    freqList2.delete(freqNode3);

    assertEquals(freqList2.head, null);
    assertEquals(freqList2.tail, null);
  });


  it("Should properly delete value nodes from sublist, and delete freq nodes when value sublist is empty", () => {
    freqList.addNewFreq('D', {headers: {}, body: new Uint8Array([1]), status: 200}, 50, time);
    freqList.addNewFreq('E', {headers: {}, body: new Uint8Array([1]), status: 200}, 50, time);

    const node = freqList.head?.valList.head;
    assertExists(node)
    const deletedNode = freqList.deleteValNode(node);
    assertEquals(deletedNode?.key, 'E');
    assertEquals(freqList.head?.valList.head?.key, 'D');
    assertEquals(freqList.head?.next?.valList.head?.key, 'B');
    assertEquals(freqList.head?.next?.next, null);
    assertEquals(freqList.head?.prev, null);
    assertEquals(freqList.tail?.valList.head?.key, 'B');
    assertEquals(freqList.tail?.prev?.valList.head?.key, 'D');
    assertEquals(freqList.tail?.prev?.prev, null);
    assertEquals(freqList.tail?.next, null);

    const deletedTail0 = freqList.deleteLeastFreq();
    assertEquals(deletedTail0?.key, 'D');
    assertEquals(freqList.head?.valList.head?.key, 'B');
    assertEquals(freqList.tail?.valList.head?.key, 'B');
    assertEquals(freqList.head?.next, null)
    assertEquals(freqList.head?.prev, null)
    assertEquals(freqList.tail?.next, null)
    assertEquals(freqList.tail?.prev, null)

    const deletedTail1 = freqList.deleteLeastFreq();
    assertEquals(deletedTail1?.key, 'A');
    assertEquals(freqList.head?.valList.head?.key, 'B');
    assertEquals(freqList.tail?.valList.head?.key, 'B');
    assertEquals(freqList.head?.next, null)
    assertEquals(freqList.head?.prev, null)
    assertEquals(freqList.tail?.next, null)
    assertEquals(freqList.tail?.prev, null)

    const deletedTail2 = freqList.deleteLeastFreq();
    assertEquals(deletedTail2?.key, 'C');
    assertEquals(freqList.head?.valList.head?.key, 'B');
    assertEquals(freqList.tail?.valList.head?.key, 'B');
    assertEquals(freqList.head?.next, null)
    assertEquals(freqList.head?.prev, null)
    assertEquals(freqList.tail?.next, null)
    assertEquals(freqList.tail?.prev, null)

    const deletedTail3 = freqList.deleteLeastFreq();
    assertEquals(deletedTail3?.key, 'B');
    assertEquals(freqList.head, null);
    assertEquals(freqList.tail, null);
    assertEquals(freqList.head?.valList.head, undefined);

    const deletedTail4 = freqList.deleteLeastFreq();
    assertEquals(deletedTail4?.key, undefined);
  });
});
