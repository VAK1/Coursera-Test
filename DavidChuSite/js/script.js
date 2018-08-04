$(function () { // Same as document.addEventListener("DOMContentLoaded"...

  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });

  // In Firefox and Safari, the click event doesn't retain the focus
  // on the clicked button. Therefore, the blur event will not fire on
  // user clicking somewhere else in the page and the blur event handler
  // which is set up above will not be called.
  // Refer to issue #28 in the repo.
  // Solution: force focus on the element that the click event fired on
  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});

(function (global) {

var dc = {};

var homeHtml = "snippets/home-snippet.html";
var allCategoriesUrl =
  "https://davids-restaurant.herokuapp.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";
// Convenience function for inserting innerHTML for 'select'
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Return substitute of '{{propName}}'
// with propValue in given 'string'
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
}

// On page load (before images or CSS)
document.addEventListener("DOMContentLoaded", function (event) {

// On first load, show home view
showLoading("#main-content");
$ajaxUtils.sendGetRequest(
  homeHtml,
  function (responseText) {
    document.querySelector("#main-content")
      .innerHTML = responseText;
  },
  false);
});

// Load the menu categories view
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML);
};

dc.loadMenuItems = function (categoryShort) {
	showLoading("#main-content");
	$ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
}

// Builds HTML for the categories page based on the data
// from the server
function buildAndShowCategoriesHTML (categories) {
  // Load title snippet of categories page
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (categoriesTitleHtml) {
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {
          var categoriesViewHtml =
            buildCategoriesViewHtml(categories,
                                    categoriesTitleHtml,
                                    categoryHtml);
          insertHtml("#main-content", categoriesViewHtml);
        },
        false);
    },
    false);
}


// Using categories data and snippets html
// build categories view HTML to be inserted into page
function buildCategoriesViewHtml(categories,
                                 categoriesTitleHtml,
                                 categoryHtml) {

  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section class='row'>";

  // Loop over categories
  for (var i = 0; i < categories.length; i++) {
    // Insert category values
    var html = categoryHtml;
    var name = "" + categories[i].name;
    var short_name = categories[i].short_name;
    html =
      insertProperty(html, "name", name);
    html =
      insertProperty(html,
                     "short_name",
                     short_name);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

function buildAndShowMenuItemsHTML (categoryMenuItems) {
	$ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml) {
		$ajaxUtils.sendGetRequest(menuItemHtml, function(menuItemHtml) {
		var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
		insertHtml("#main-content", menuItemsViewHtml);
		}, false);
	}, false);
}

function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
	menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
	menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "specialInstructions", categoryMenuItems.category.special_instructions);
	var finalHtml = menuItemsTitleHtml;
	finalHtml += "<section class = 'row'>";
	var menuItems = categoryMenuItems.menu_items;
	var catShortName = categoryMenuItems.category.short_name;
	console.log(catShortName);
	for (var i = 0; i < menuItems.length; i++) {
		var html = menuItemHtml;
		html = insertProperty(html, "name", menuItems[i].name);
		html = insertProperty(html, "short_name", menuItems[i].short_name);
		html = insertProperty(html, "catShortName", catShortName);
		html = insertProperty(html, "description", menuItems[i].description);
		html = insertItemPrice(html, "price_small", menuItems[i].price_small);
		html = insertItemPrice(html, "price_large", menuItems[i].price_large);
		html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
		html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
		if (i%2 != 0) {
			html += "<div class = 'clearfix visible-lg-block visible-md-block'></div>";
		}
		finalHtml += html;
	}
	finalHtml += "</section>";
	return finalHtml;
}

function insertItemPrice (html, pricePropName, priceValue) {
	if (!priceValue) {return insertProperty(html, pricePropName, "")};
	priceValue = "$" + priceValue.toFixed(2);
	return insertProperty(html, pricePropName, priceValue);
}
function insertItemPortionName (html, portionPropName, portionValue) {
	if (!portionValue) {return insertProperty(html, portionPropName, "")};
	portionValue = "(" + portionValue + ")";
	return insertProperty(html, portionPropName, portionValue);
}
global.$dc = dc;

})(window);