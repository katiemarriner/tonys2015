var mainContainer = d3.select("#main-container");
var headers = ["", "Rooting for", "Prediction", "Winner"]
var colors = {
	musical: "#3D8F83",
	play: "#753275",
	both: "#3D3F8F"
}
var ballot = []


App = {

	init: function() {
		// Tabletop.init({ key: '1dnZEytaB3-aCdH6RjZFV3vzlr9AGvrOog-1XqOGwq0Y',
  //                  		callback: function(ballot, tabletop) { App.gatherData(ballot) },
  //                  		simpleSheet: true } )
		// App.bindEvents();
		$.ajax({
		    url: 'https://spreadsheets.google.com/feeds/list/1dnZEytaB3-aCdH6RjZFV3vzlr9AGvrOog-1XqOGwq0Y/od6/public/values?alt=json',
		    dataType: 'json',
		    success: function( data ) {
			var entry = data.feed.entry;

		    _.each(entry, function(e){
				ballot.push({'category': e.gsx$category.$t, 'active': e.gsx$active.$t, 'nominee': e.gsx$nominee.$t, 'secondary_description': e.gsx$secondarydescription.$t, 'rooting': e.gsx$rooting.$t, 'prediction': e.gsx$prediction.$t, 'winner': e.gsx$winner.$t});
			});
			App.gatherData(ballot);
		    },
		    error: function( data ) {
		    	console.log("error:" + data)
		      $("#main-container").html("Sorry, there was a problem getting data. Please refresh the page.")
		    }
		  });
		// $.getJSON("", function(data){
			
		// });
		$('.dropdown-toggle').dropdown();
	},

	bindEvents: function(){
		setTimeout("App.refreshPage();", 300000);
	},

	gatherData: function(ballot) {
		var nested = d3.nest()
			  .key(function(d) { return d.category; })
			  .entries(ballot);
		App.renderCategories(ballot, nested);
	},

	renderCategories: function(ballot, nested) {

		var dropdownRender = d3.select(".dropdown-menu")
			.selectAll("li.listed")
			.data(nested)
			.enter()
			.append("li")
			.append("a")
			.attr("href", function(d){
				var clean = (d.key).replace(/[( )]/g,"")
				return "#" + clean.trim()
			})
			.html(function(d){
				return d.key
			})

		var categoryContainers = mainContainer.selectAll("div")
			.data(nested)
			.enter()
			.append("div")
			.attr("class", function(d){
				if(d.values[0].active){
					return d.key + " category-container active"
				} else {
					return d.key + " category-container"
				}
			});

		categoryContainers.append("a")
			.attr("name", function(d){
				var clean = (d.key).replace(/[( )]/g,"")
				return clean.trim()
			})
			.style("margin-top", "70px");

		var categoryTitles = categoryContainers
			.append("h4")
			.attr("class", function(d){
				if(d.values[0].active){
					return "category-title active"
				} else {
					return "category-title"
				}
			})
			.html(function(d){
				return d.key;
			});

		var secondaryContainer = categoryContainers
			.append("table")
			.attr("class", function(d){
				return "nominee-table"
			});

		secondaryContainer.append("thead").append("tr").selectAll("th")
			.data(headers)
			.enter()
			.append("th")
			.attr("class", function(d){
				return d
			})
			.html(function(d){
				return d
			});

		var tableBody = secondaryContainer.append("tbody");

		var rows = tableBody.selectAll("tr")
			.data(function(n1){ return n1.values })
			.enter()
			.append("tr");

		var nomineeTitle = rows.append("td").attr("class", "nominee-cell");

		nomineeTitle.append("h4").html(function(d){
			return d.nominee
		})
		.attr("class", "nominee-title");

		var nomineeSub = nomineeTitle.append("p").html(function(d){
			return d.secondary_description
		})
		.attr("class", "nominee-sub");

		rows.append("td")
			.attr("class", function(d){
				if(d.rooting){
					return "rooting-yes rooting-cell"
				} else {
					return "rooting-cell"
				}
			})
			.attr("align", "center");

		rows.append("td")
			.attr("class", function(d){
				if(d.prediction){
					return "prediction-yes prediction-cell"
				} else {
					return "prediction-cell"
				}
			})
			.attr("align", "center");

		rows.append("td")
			.attr("class", function(d){
				if(d.winner){
					return "winner-yes winner-cell"
				} else {
					return "winner-cell"
				}
			})
			.attr("align", "center");

		mainContainer.append("div").attr("class", "credits")
			.html('<a name="about"></a><h6>About</h6><p>As a web developer and a (recent) Broadway superfan, I decided to combine my two interests into an interactive ballot. "Ta-da!" While I have seen many, I was not able to attend every single nominated show (my goal for next season), so some of my predictions are based on buzz. You can also see the musicals, plays and actors and actresses I\'m most rooting for.</p><a name="credits"></a><h6>Credits</h6><ul><li>List of nominees from <a href="http://www.tonyawards.com/en_US/nominees/2015_Printable_Ballot.pdf">The Tony Awards Ballot</a></li><li>Fist by <a href="https://thenounproject.com/deivid.saenz/">Deivid S&#225;enz</a> from the Noun Project</li><li>Crystal Ball by <a href="https://thenounproject.com/emmamengyuan/">Emma Yuan</a> from the Noun Project</li><li>Tony Award by <a href="https://thenounproject.com/jamil.ramirez.14/">Jamil Ramirez</a> from The Noun Project</li></ul>')

		App.smoothScroll(nested)
		App.appendImages(ballot, nested)
		App.colorCode();
		App.reorder();
	},

	smoothScroll: function(nested) {
		$('a[href*=#]:not([href=#])').click(function() {
	    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	      var target = $(this.hash);
	      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	      if (target.length) {
	        $('html,body').animate({
	          scrollTop: target.offset().top
	        }, 1000);
	        return false;
	      }
	    }
	  });
	},

	reorder: function() {
		$("#main-container > div").each(function(e){
			if($(this).hasClass("active")){
				$(this).prependTo("#main-container")
			}
		});
	},

	refreshPage: function() {
		console.log("ran")
		$("#main-container").load(window.location.href + "#main-container");
	},

	appendImages: function(ballot, nested) {
		d3.selectAll(".rooting-yes").append("img").attr("src", "icons/fist.svg").attr("class", "icon")
		d3.selectAll(".prediction-yes").append("img").attr("src", "icons/crystal_ball.svg").attr("class", "icon")
		d3.selectAll(".winner-yes").append("img").attr("src", "icons/tony.svg").attr("class", "icon")
	},

	colorCode: function() {
		$(".category-title:contains('Play')").css("background-color", colors.play);
		$(".category-title:contains('Musical'), .category-title:contains('Score'), .category-title:contains('Orchestrations')").css("background-color", colors.musical);
		$(".category-title:contains('Choreography')").css("background-color", colors.both);

	}

}



$(document).ready(function(){
	App.init();
});