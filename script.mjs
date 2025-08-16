

const kataListItemTemplate = document.getElementById("kata-li-template").content.firstElementChild;

const usernameInput = document.getElementById("username");
const messageEl = document.getElementById("message");

window.addEventListener("load", setup);

async function setup() {
  document.getElementById("check-btn").addEventListener("click", () => {
    const username = usernameInput.value.trim();
    localStorage.setItem("codewars-username", username);
  });

  {
    const username = localStorage.getItem("codewars-username");
    if (username) {
      usernameInput.value = username;
    }
  }

  // Get the query string part of the URL
  const params = new URLSearchParams(window.location.search);

  // Retrieve the "username" parameter
  const username = params.get("username");

  if (username) {
    await checkUserProgress(username);
  }

  render();  
}

async function checkUserProgress(username) {
  try {
    let completedCount = 0;
    const katas = await fetchUserKatas(username);

    katas.forEach(kata => {
      const kataData = selectedKatasMap.get(kata.id);
      if (kataData) {
        completedCount++;
        kataData.completed = true;
      }
    });

    setMessage(`${Math.round(completedCount/selectedKatas.length * 100)}% Completed`);
  } catch(err) {
    setMessage(err.toString(), "error");
  }
}

function setMessage(msg, type="") {
  messageEl.textContent = msg;
  messageEl.className = type;
}

function render() {
  const listEl = document.getElementById("katas-list");
  listEl.innerHTML = '';
  
  selectedKatas.forEach(({id, title, completed}) => {
    const li = kataListItemTemplate.cloneNode(true);
    const a = li.querySelector('a');
    a.setAttribute("href", `https://www.codewars.com/kata/${id}`);
    a.textContent = title;
    
    if (completed) {
      li.querySelector(".kata-completed").classList.add('yes');
    }

    listEl.appendChild(li);
  });
}

async function fetchUserKatas(username) {
  const katas = [];

  for (let page=0; ; page++) {
    const res = await fetch(
      `https://www.codewars.com/api/v1/users/${username}/code-challenges/completed?page=${page}`
    );

    if (!res.ok) {
      throw new Error(`Error fetching data: ${res.status}`);
    }

    const json = await res.json();
    katas.push(...json.data);

    if (page >= json.totalPages - 1) break;
  }

  return katas;
}

/*
  Run this in a browser console on a collection page:
  
  const katas = [... document.querySelectorAll(".list-item-kata")].map(el=> ({id: el.id, title: el.dataset['title'] }));
  console.log(JSON.stringify(katas, null, 2));
*/

const selectedKatas = [{"id":"57eadb7ecd143f4c9c0000a3","title":"Abbreviate a Two Word Name"},{"id":"55f9bca8ecaa9eac7100004a","title":"Beginner Series #2 Clock"},{"id":"54d1c59aba326343c80000e7","title":"Incorrect division method"},{"id":"56dec885c54a926dcd001095","title":"Opposite number"},{"id":"57a429e253ba3381850000fb","title":"Calculate BMI"},{"id":"59b0a6da44a4b7080300008a","title":"Converting 12-hour time to 24-hour time"},{"id":"53ee5429ba190077850011d4","title":"You Can't Code Under Pressure #1"},{"id":"53da3dbb4a5168369a0000fe","title":"Even or Odd"},{"id":"574e4175ff5b0a554a00000b","title":"Convert Improper Fraction to Mixed Numeral"},{"id":"57356c55867b9b7a60000bd7","title":"Basic Mathematical Operations"},{"id":"57089707fe2d01529f00024a","title":"Grasshopper - If/else syntax debug"},{"id":"5861d28f124b35723e00005e","title":"Will you make it?"},{"id":"574b3b1599d8f897470018f6","title":"What's the real floor?"},{"id":"57d1f36705c186d018000813","title":"Hells Kitchen"},{"id":"5a2fd38b55519ed98f0000ce","title":"Multiplication table for number"},{"id":"5672a98bdbdd995fad00000f","title":"Rock Paper Scissors!"},{"id":"56dae9dc54c0acd29d00109a","title":"Grasshopper - Function syntax debugging"},{"id":"582e4c3406e37fcc770001ad","title":"ES6 string addition"},{"id":"5265326f5fda8eb1160004c8","title":"Convert a Number to a String!"}];
const selectedKatasMap = new Map(selectedKatas.map(kata => [kata.id, kata]));