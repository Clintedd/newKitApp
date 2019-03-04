/*!
 * project-name v0.0.1
 * A description for your project.
 * (c) 2019 YOUR NAME
 * MIT License
 * http://link-to-your-git-repo.com
 */

const app = {};
let searchedAll = [];
const allergySelected = [];
let dietSelected = 'none';
let maxTimeSelected = 'none';
let clicked = false;
let ajaxResult;
let storedResult;

// On form submit, call the getMainInfo function
app.mainSearchEvent = function () {
	$('#form-search-main').on('submit', (function (e) {
		e.preventDefault();
		$('label').removeClass('active');
		app.getMainInfo();
		app.searchedTitle(searchedAll);
		app.headerHeightVH();
		app.widthHandlerSubmitted();
		$('#search').blur();
		this.reset();
		app.scrollToTopRecipe();
	}))
}

app.scrollToTopRecipe = function () {
	$('html,body').animate({
		scrollTop: $(".recipe-wrapper").offset().top
	},
		800);
}

app.scrollToTopHeader = function () {
	$('html,body').animate({
		scrollTop: $("header").offset().top
	},
		800);
}

app.headerHeightVH = function () {
	$('header').css('height', '100vh');
}

app.updateIngredients = function () {
	if (searchedAll.length > 0) {
		$('.searched-ingredient').text('Searched Ingredients:');
		for (var i = 0; i < searchedAll.length; i++) {
			$('.searched-ingredient').append(`<span class="searched-each">${searchedAll[i]}</span>`);
		}
	}
}

// When the function is called, use the value of searched input, checked allergies, checked diets, checked time to get recipe info from Yummly API
app.getMainInfo = function () {
	const searchedIngredient = $('input[type=search]').val();
	if (searchedIngredient) {
		const oneSearch = $('input[name=ingredient]').val();
		$('.searched-ingredient').append(`<span class="searched-each">${oneSearch}</span>`);
		searchedAll.push(oneSearch);
	}

	const allergiesAll = [];
	const checkedAllergies = $('.allergies input[type=checkbox]').filter($('input:checked'));
	allergiesAll.push(...checkedAllergies);
	for (var i = 0; i < allergiesAll.length; i++) {
		allergySelected.push(allergiesAll[i].value);
	}


	dietSelected = $('.diets input[type=radio]').filter($('input:checked')).val();

	maxTimeSelected = $('.duration input[type=radio]').filter($('input:checked')).val();

	$('.searched-ingredient').css('display', 'flex');
	$('.recipe-wrapper').css('display', 'block');
	app.getRecip(searchedAll, allergySelected, dietSelected, maxTimeSelected);
	app.updateIngredients();
}

app.searchedTitle = function (searchedAll) {
	$('#recipes').empty();

}

// Get data from Yummly API with all the info inputed
app.getRecip = function (searchedAll, allergySelected, dietSelected, maxTimeSelected) {
	$.ajax({
		url: 'http://api.yummly.com/v1/api/recipes',
		dataType: 'json',
		data: {
			_app_id: '1d2af616',
			_app_key: 'ff279905f6336ced45e39d38f120592e',
			maxResult: 12,
			q: searchedAll,
			allowedAllergy: allergySelected,
			maxTotalTimeInSeconds: maxTimeSelected,
			allowedDiet: dietSelected
		}
	}).then((res) => {
		console.log(res);
		ajaxResult = res;
		app.showResult(ajaxResult);

	})
}

// Display the data recieved and attach each recipes to the recipes section
app.showResult = function (ajaxResult) {
	const arrayOfRecip = ajaxResult.matches;

	arrayOfRecip.forEach((function (item) {
		const $recipeName = item.recipeName;
		const $recipeUnique = item.sourceDisplayName;
		const $imageUrl = item.imageUrlsBySize;
		const $itemId = item.id
		const $totalSeconds = item.totalTimeInSeconds;

		//Generating dynamic html with JavaScript;
		const recipTitle = $('<h4 class="recipe-title">').text($recipeName);
		const recipUniqueTitle = $('<h6 class="recipe-unique">').text($recipeUnique);

		const imageUrl = $imageUrl['90'].split('=')[0];
		const recipImage = $('<img class="recipe-img">').attr('src', imageUrl);
		const recipAnchor = $(`<a href="https://www.yummly.com/recipe/${$itemId}" target="_blank"></a>`).append(recipImage);

		const ingredientsTitle = $(`<p class="ingredients-title" target="_blank">`).text('Ingredients');

		const duration = ($totalSeconds / 60);
		const durationInMin = $('<h6 class="duration-each">').text(`Time: ${duration} Min`);

		const divIngDur = $(`<div class="ing-dur">`).append(durationInMin, ingredientsTitle)

		const eachRecip = $(`<div>`).addClass('recipe-item').append(recipTitle, recipUniqueTitle, recipAnchor, divIngDur);


		$('#recipes').append(eachRecip);
	}))
}

// check if any of the labels are clicked, then change the class of the element to active
app.checkboxToggle = function () {
	$('.allergies label').click((function () {
		$(this).toggleClass('active');
	}))
}

app.dietsToggle = function (dietSelected) {
	$('.diets input[type=radio]').change((function () {
		$('.diets label').removeClass('active');
		if (this.checked) {
			$(this).next().toggleClass('active');
			dietSelected = $(this).val()
		}
	}))
}

app.durationToggle = function (maxTimeSelected) {
	$('.duration input[type=radio]').change((function () {
		$('.duration label').removeClass('active');
		if (this.checked) {
			$(this).next().toggleClass('active');
			maxTimeSelected = $(this).val()
		}

	}))
}


// if a searched ingredient is clicked, remove the ingredient from the array of searched ingredient and then search again with the remaining searched ingredients
app.updateRecipe = function () {
	$(document).on('click', '.searched-each', (function () {
		const $itemToRemove = this.innerHTML;
		$(this).remove();

		const filteredSearch = searchedAll.filter((function (item) {
			return $itemToRemove !== item
		}));

		searchedAll = filteredSearch;
		$('#recipes').empty();

		if (filteredSearch.length === 0) {
			$('#recipes').empty();
			$('.searched-ingredient').empty();
			$('.searched-ingredient').text('Please search an ingredient');
			app.scrollToTopHeader();
		}
		else {
			app.getRecip(filteredSearch, allergySelected, dietSelected, maxTimeSelected);
			app.scrollToTopRecipe();
		}
	}))
}

// handles the height behaviour of header when called
app.widthHandler = function () {
	$(window).resize((function () {
		if ($(window).width() < 350) {
			$('header').css('height', 'auto');
		}
		else {
			$('header').css('height', '96vh');
		}
	}));
}

app.widthHandlerSubmitted = function () {
	$(window).resize((function () {
		if ($(window).width() < 350) {
			$('header').css('height', 'auto');
		}
		else {
			app.headerHeightVH();
		}
	}));
}


// When user clicks on 'ingredients', use the data from the searched array, and append each ingredients to an unordered list and append the ul to the recipe item
app.indIngredients = function () {
	$(document).on('click', '.ingredients-title', (function () {
		const arrayOfRecip = ajaxResult.matches;
		if (clicked === false) {
			const indexOf = $('.ingredients-title').index(this);
			console.log(indexOf);
			const ingredientsAll = arrayOfRecip[indexOf].ingredients.slice(0, 20);
			const ingredientsUL = $(`<ul class=ingredients-ul>`);
			const ingredientsExp = $('<h4 class="ingredients-exp">').text('Ingredients:');
			ingredientsUL.append(ingredientsExp);

			for (var i = 0; i < ingredientsAll.length; i++) {
				const ingredientsInd = $(`<li class="ingredients-each">`).text(`${ingredientsAll[i]}`);
				ingredientsUL.append(ingredientsInd);
			}
			$(this.parentElement.parentElement).append(ingredientsUL);
			clicked = true;
		}
		else if (clicked === true) {
			$('.ingredients-ul').on('click', app.hideIngredients());
		}

	}))
	$(document).on('click', '.ingredients-ul', (function () {
		app.hideIngredients();
		clicked = false;
	}))
}

app.hideIngredients = function () {
	$('.ingredients-ul').css('display', 'none');
	clicked = false;
}


// init function
app.init = function () {
	app.mainSearchEvent();
	app.checkboxToggle();
	app.dietsToggle();
	app.durationToggle();
	app.widthHandler();
	app.updateRecipe();
	app.indIngredients();
}


// document ready function
$(document).ready((function () {
	app.init();
}));