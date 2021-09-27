const btn = document.getElementById("button");
const inp = document.getElementById("input");
const bal = document.getElementById("bal");

const loginUrl = "http://localhost:3000/login";
const getStandardAccessUrl = "http://localhost:3000/getStandardAccess";
const getBalanceUrl = "http://localhost:3000/getBalance";

let address = "";

inp.addEventListener('input', function (e) {
  address = e.target.value;
});

btn.addEventListener('click', async function (e) {
  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address })
  });

  const resjson = await res.json();
  let token = resjson.token;

  setTimeout(async function () {
    const res2 = await fetch(getStandardAccessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address, token })
    });

    const res2json = await res2.json();
    token = res2json.token;

    const res3 = await fetch(getBalanceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address, token })
    });

    const res3json = await res3.json();
    const balance = res3json.balance;

    bal.innerText = "Your balance: " + balance;
  }, 1500);
});
