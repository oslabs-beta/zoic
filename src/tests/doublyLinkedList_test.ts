import { assertEquals, assertExists } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
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

  it("Should properly update list when adding new freqency nodes", () => {
    const valListHead = freqList.head?.valList.head;

    assertExists(valListHead);
    const newNode = freqList.increaseFreq(valListHead);
    assertEquals(freqList.head?.freqValue, 1);
    assertEquals(freqList.head?.next?.freqValue, 2);
    assertEquals(freqList.head?.next?.next, null);

    assertExists(newNode);
    freqList.increaseFreq(newNode);
    assertEquals(freqList.head?.freqValue, 1);
    assertEquals(freqList.head?.next?.freqValue, 3);
    assertEquals(freqList.head?.next?.next, null);
  });
});