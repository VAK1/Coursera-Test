// Practicing "new" and "this"

function Family(titlee) {;
	this.title = titlee;
};

Family.prototype.full_name = function() {
	return ("This is a(n) " + this.title + " family!");
};
var myFamily1 = new Family("cool")
var myFamily2 = new Family("awesome")
console.log(myFamily1.title)
console.log(myFamily2.title)
console.log(myFamily2.full_name())