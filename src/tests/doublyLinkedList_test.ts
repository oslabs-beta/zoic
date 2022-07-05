import { assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { DoublyLinkedList } from '../doublyLinkedList.ts';

describe("Doubly linked list tests", () => {

  const list = new DoublyLinkedList();
  const time = new Date();

  it("Should properly handle an empty list", () => {
    assertEquals(list.head, null);
    assertEquals(list.tail, null);
  });

  it("Should properly add a sinlge node", () => {
    list.addHead({headers: {}, body: new Uint8Array([1]), status: 200}, 'C', 50, time);
    assertEquals(list.head, list.tail);
    assertEquals(list.head?.next, null);
    assertEquals(list.head?.prev, null);
    assertEquals(list.tail?.next, null);
    assertEquals(list.tail?.prev, null);
  });

  it("Should properly add nodes to the start of the linked list", () => {
    list.addHead({headers: {}, body: new Uint8Array([2]), status: 200}, 'B', 100, time);
    list.addHead({headers: {}, body: new Uint8Array([3]), status: 200}, 'A', 200, time);
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
});