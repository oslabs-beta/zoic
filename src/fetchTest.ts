export const test = async () => {
  for (let i = 1; i < 5000; i++){
    const res = await fetch(`http://localhost:8000/dbRead/${Math.floor(Math.random() * 100)}`);
    const body = await res.json();
    console.log(body);
  }
}

test();