export const test1 = async () => {
  for (let i = 1; i < 5000; i++){
    const res = await fetch(`http://localhost:8000/dbRead/${Math.floor(Math.random() * 100)}`);
    const body = await res.json();
    console.log(body);
  }
}

export const test2 = async () => {
  for (let i = 1; i < 10; i++){
    const res = await fetch(`http://localhost:8000/dbRead/1`);
    const body = await res.json();
    console.log(body);
  }
}

test1();
// test2()