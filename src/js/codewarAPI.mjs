export async function updateKataCompletionStatus(kataCollections, username) {
  try {
    const userKatas = await fetchUserKatas(username);

    // Create a map for quick lookup
    const userKatasMap = new Map(userKatas.map((kata) => [kata.id, kata]));

    kataCollections.forEach((collection) => {
      let completedCount = 0;

      collection.katas.forEach((kata) => {
        const userKata = userKatasMap.get(kata.id);

        if (!userKata) return;

        // if no languages specified, assume "any language"
        if (
          collection.acceptedLanguages.length === 0 ||
          userKata.completedLanguages.some((lang) =>
            collection.acceptedLanguages.includes(lang)
          )
        ) {
          kata.completed = true;
          completedCount++;
        }
      });

      collection.completedCount = completedCount;
    });
  } catch (err) {
    throw new Error(`Failed to fetch user data: ${err.message}`);
  }
}

/* 
  Return an array of katas completed by the user.

  Each element is in the form:
  {
    id: "514b92a657cdc65150000006",
    name: "Multiples of 3 and 5",
    slug: "multiples-of-3-and-5",
    completedAt: "2017-04-06T16:32:09Z",
    completedLanguages: ["javascript", "python", "coffeescript", "ruby"]
  }
*/
export async function fetchUserKatas(username) {
  const katas = [];

  username = encodeURIComponent(username.trim());

  // Note: Cannot find naming rules for usernames in the Codewars docs
  // The rules seems quite loose. For example, space (except trailing and leading space) is allowed.
  if (username.length === 0) {
    throw new Error("Invalid username");
  }

  // Fetch all completed katas, page by page
  for (let page = 0; ; page++) {
    // Ref: https://dev.codewars.com/#list-completed-challenges
    const res = await fetch(
      `https://www.codewars.com/api/v1/users/${username}/code-challenges/completed?page=${page}`
    );

    if (!res.ok) {
      switch (res.status) {
        case 404:
          throw new Error("User not found");
        default:
          throw new Error(res.status);
      }
    }

    const json = await res.json();
    katas.push(...json.data);

    if (page >= json.totalPages - 1) break;
  }

  return katas;
}

export async function fetchUser(username) {
  username = encodeURIComponent(username.trim());
  // Ref: https://dev.codewars.com/#get-user
  const res = await fetch(`https://www.codewars.com/api/v1/users/${username}`);

  if (!res.ok) {
    switch (res.status) {
      case 404:
        throw new Error("User not found");
      default:
        throw new Error(res.status);
    }
  }

  return await res.json();
}
