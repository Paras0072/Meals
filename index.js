const search = document.getElementById("search");
const submit = document.getElementById("submit");
const random = document.getElementById("random");
const mealsEl = document.getElementById("meals");
const resultHeading = document.getElementsByClassName("result-heading");
const single_mealEl = document.getElementById("single-meal");


//Event Listerner

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-favourites")) {
    addMealToFavourites(selectedMeal);
  }
});
submit.addEventListener("submit", searchMeal);
random.addEventListener('click',randomMeal);
mealsEl.addEventListener("click", (e) => {
  const mealInfo = e.path.find((item) => {
    if (item.classList) {
      return item.classList.contains("meal-info");
    } else {
      return false;
    }
  });
  if (mealInfo) {
    const mealID = mealInfo.getAttribute(
      "data-mealid"
    );
    getMealById(mealID);
  }
});

//SearchMeal from API
function searchMeal(e) {
  e.preventDefault();

  // Clear single Meal
  single_mealEl.innerHTML = "";

  //get search Term
  const term = search.value;

  //Check for empty
  if (term.trim()) {
    fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        resultHeading.innerHTML = `<h2>Search Result For ${term}`;

        if (data.meals === null) {
          resultHeading.innerHTML = `<h2> There are No Search results for ${term}`;
        } else {
          mealsEl.innerHTML = data.meals
            .map(
              meal=> `
                 <div class="meal">
                 <img src="${meal.strMealThumb}" alt="${meal.strMeal}" >
                 <div class="meal-info" data-mealID="${meal.idMeal}">
                    <h3>${meal.strMeal}</h3>
                 </div>
                 </div>
                `
            ) .join("");
           
        }
      });

    //Clear Search Term
    search.value = "";
  } else {
    alert("Please enter value for search");
  }
}

//Fetch Meal By Id

function getMealById(mealID) {
  fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const meal = data.meals[0];
      addMealToDOM(meal);
    });
}

//fetch Meal 
function randomMeal(){
    //Clear Meals and Heading
    mealsEl.innerHTML='';
    resultHeading.innerHTML='';

    fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
    .then(res => res.json())
    .then(data => {
        const meal = data.meals[0];
        addMealToDOM(meal);
    })

}

//Add meal to DOM

function addMealToDOM(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `${meal[`strIngredient${i}`]} - ${
          meal[`strMeasure${i}`]
        }`
      );
    }else{
        break;
    }
  }

  single_mealEl.innerHTML = `
    <div class="single-meal">
      <h1>${meal.strMeal}</h1>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}"/>
      <div class="single-meal-info">
        ${meal.strCategory ? `<p>${meal.strCategory}</p>` : ''}
        ${meal.strArea ? `<p>${meal.strArea}</p>` : ''}
      </div>
      <div class="main">
        <p>${meal.strInstructions}</p>
        <h2>Ingredients</h2>
        <ul>
          ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <button class="btn add-to-favourites">Add to Favourites</button>
      </div>
    </div>
  `;

  const addToFavouritesBtn = single_mealEl.querySelector(
    ".add-to-favourites"
  );
  addToFavouritesBtn.addEventListener("click", () =>
    addToFavourites(meal)
  );
}


function addToFavourites(meal) {
  const favourites = getFavouritesFromStorage();

  if (!favourites.find((fav) => fav.id === meal.idMeal)) {
    favourites.push(meal);
    localStorage.setItem("favourites", JSON.stringify(favourites));
    displayFavourites(favourites);
  } else {
    alert("Meal is already in favourites!");
  }
}



function getFavouritesFromStorage() {
  const favourites = localStorage.getItem("favourites");
  return favourites ? JSON.parse(favourites) : [];
}

const favouritesEl = document.getElementById("favourites");

// an array to store favourite meals
let favourites = [];

// function to display the saved favourite meals
function displayFavourites() {
  const savedFavourites = JSON.parse(localStorage.getItem("favourites")) || [];
  favourites = savedFavourites;
  favouritesEl.innerHTML = "";

  if (favourites.length > 0) {
    favourites.forEach((meal) => {
      const favMealEl = document.createElement("li");
      favMealEl.innerHTML = `
        <div class='left'><img src="${meal.strMealThumb}" alt="${meal.strMeal}" /></div>
        <div class='right'>${meal.strMeal}</div>
        <div class='right'><button class='btn delete' data-mealid="${meal.idMeal}">Delete</button></div>
      `;
      favouritesEl.appendChild(favMealEl);
    });

    // add event listener to the delete buttons
    const deleteButtons = document.querySelectorAll(".delete");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const mealId = e.target.getAttribute("data-mealid");
        favourites = favourites.filter((meal) => meal.idMeal !== mealId);
        localStorage.setItem("favourites", JSON.stringify(favourites));
        displayFavourites();
      });
    });
  } else {
    favouritesEl.innerHTML = "<p>No favourite meals added yet!</p>";
  }
}



function removeFromFavourites(mealID) {
  const favourites = getFavouritesFromStorage().filter(
    (fav) => fav.id !== mealID
  );
  localStorage.setItem("favourites", JSON.stringify(favourites));
  displayFavourites();

  // remove the meal container from the single meal view if it's being displayed
  const singleMealEl = document.getElementById("single-meal");
  const singleMealID = singleMealEl.querySelector(".meal-info").getAttribute("data-mealid");
  if (singleMealID === mealID) {
    singleMealEl.innerHTML = "";
  }
}



function addMealToFavourites(meal) {
  // get the saved favourite meals from localStorage, or set it to an empty array if none exist
  const savedFavourites = JSON.parse(localStorage.getItem("favourites")) || [];

  // check if the selected meal is already in the favourites list
  const isMealInFavourites = savedFavourites.some((favouriteMeal) => favouriteMeal.idMeal === meal.idMeal);

  if (!isMealInFavourites) {
    // if the selected meal is not already in the favourites list, add it to the list and save to localStorage
    savedFavourites.push(meal);
    localStorage.setItem("favourites", JSON.stringify(savedFavourites));

    // show success message
    alert(`${meal.strMeal} has been added to your favourites!`);
  } else {
    // show error message if the selected meal is already in the favourites list
    alert(`${meal.strMeal} is already in your favourites!`);
  }
}

mealsEl.addEventListener("click", (e) => {
  const mealInfo = e.path.find((item) => {
    if (item.classList) {
      return item.classList.contains("meal-info");
    } else {
      return false;
    }
  });
  if (mealInfo) {
    const mealID = mealInfo.getAttribute(
      "data-mealid"
    );
    getMealById(mealID);
  }
});