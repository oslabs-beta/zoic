import { assert, assertThrows, assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { afterEach, beforeEach, beforeAll, describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { Context, Response } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { DoublyLinkedList } from '../doublyLinkedList.ts';


describe("Doubly LinkedList Test", () => {

  const list = new DoublyLinkedList();

  it("Should properly add nodes to the start of the doubly linked list", () => {
    list.addHead(3, 'C');
    list.addHead(2, 'B');
    list.addHead(1, 'A');

    assertEquals(list.head, list.tail.prev.prev);
    assertEquals(list.head.next, list.tail.prev);
    assertEquals(list.head.next.next, list.tail);
  });

});