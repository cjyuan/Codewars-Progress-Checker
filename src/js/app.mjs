import { cloneKataCollections } from "./kataCollections.mjs";
import { updateKataCompletionStatus, fetchUser } from "./codewarAPI.mjs";

const usernameInput = document.getElementById("username");

window.addEventListener("load", async () => {
  window.addEventListener("hashchange", handleHashChanged);
  document.getElementById("check-btn").addEventListener("click", handleUsernameInput);

  handleHashChanged();
});

function createInitialData() {
  return {
    kataCollections: cloneKataCollections(),
    userData: { username: "", name: "", honor: 0 },
  };
}

function handleHashChanged() {
  const hash = window.location.hash.slice(1);
  if (hash) {
    const username = decodeURIComponent(hash);
    loadAndRenderUserProgress(username);
  } else {
    messageBox.hide();
    render(createInitialData());
  }
}

function handleUsernameInput() {
  const username = usernameInput.value.trim();
  if (!username) {
    messageBox.show("Please enter a username", "error");
    return;
  }

  messageBox.hide();
  usernameInput.value = "";

  // If current hash is different, use hashchange event to trigger loading user progress
  // to prevent triggering the loading function multiple times
  if (encodeURIComponent(username) !== window.location.hash.slice(1)) {
    window.location.hash = encodeURIComponent(username);
    return;
  }

  loadAndRenderUserProgress(username);
}

async function loadAndRenderUserProgress(username) {
  let { kataCollections, userData } = createInitialData();

  try {
    const { name, honor } = await fetchUser(username);
    userData = { username, name, honor };

    // Only set hash if username exists
    window.location.hash = encodeURIComponent(username);

    await updateKataCompletionStatus(kataCollections, username);
  } catch (error) {
    messageBox.show(error.message, "error");
  }

  render({ kataCollections, userData });
}

const collectionDetailsTemplate =
  document.getElementById("collection-template").content.firstElementChild;
const kataListItemTemplate = document.getElementById("kata-li-template").content.firstElementChild;

function render({ kataCollections, userData }) {
  function formatCompletionStatus({ completedCount, totalCount }) {
    const completionPercentage = totalCount ? (completedCount / totalCount) * 100 : 0;
    return `Completed: ${completedCount}/${totalCount} (${completionPercentage.toFixed(0)}%)`;
  }

  // Render user info
  document.getElementById("user-username").textContent = userData.username;
  document.getElementById("user-name").textContent = userData.name;
  document.getElementById("user-honor").textContent = userData.honor;

  // Render collections
  const collectionsContainer = document.getElementById("collections-container");
  collectionsContainer.innerHTML = "";

  kataCollections.forEach((collection) => {
    const collectionEl = collectionDetailsTemplate.cloneNode(true);
    collectionEl.querySelector(".collection-name").textContent = collection.name;
    collectionEl.querySelector(".collection-completion-status").textContent =
      formatCompletionStatus(collection);

    const katasList = collectionEl.querySelector(".katas-list");
    katasList.innerHTML = "";
    constructKataListItems(katasList, collection.katas);

    collectionsContainer.appendChild(collectionEl);
  });
}

function constructKataListItems(listEl, katas) {
  const fragment = document.createDocumentFragment();  
  katas.forEach((kata) => {
    const { id, name, completed } = kata;
    const li = kataListItemTemplate.cloneNode(true);
    const a = li.querySelector("a");
    a.setAttribute("href", `https://www.codewars.com/kata/${id}`);
    a.textContent = name;

    li.querySelector(".kata-completed").classList.add(completed ? "completed" : "incomplete");

    fragment.appendChild(li);
  });

  listEl.appendChild(fragment);
}

const messageBox = (() => {
  const box = document.getElementById("message");
  const text = document.getElementById("message-text");
  const closeBtn = document.getElementById("message-close");

  closeBtn.addEventListener("click", hide);

  // type can be "info", "error", "success"
  function show(msg, type = "info") {
    text.textContent = msg;
    text.className = type;

    if (type === "error") {
      box.setAttribute("role", "alert");
    } else {
      box.setAttribute("role", "status");
    }

    box.style.display = "flex"; // Make it visible
  }

  function hide() {
    box.style.display = "none";
  }

  return { show, hide };
})();
