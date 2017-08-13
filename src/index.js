const $ = require('jquery');
const users = require('./json/users.json');
const venues = require('./json/venues.json');
const results_template = require('./templates/results.handlebars');
const users_list_template = require('./templates/users_list.handlebars');

let app = {
	div : $('#restaurant-finder'),

	events : function() {
		let self = this;

		this.div.on('change', 'input', function() {
			let i = $(this).val();
			if(self.users[i].selected) {
				self.users[i].selected = false;
			} else {
				self.users[i].selected = true;
			}
			
			self.find_venues();
		});
	},

	set_users_selected : function() {
		for(let i = 0; i < this.users.length; i++) {
			this.users[i].selected = true;
		}
	},
	
	find_venues : function() {
		let results = [];
		
		for(let i = 0; i < venues.length; i++) {
			let approved = true;
			let venue = Object.assign({}, venues[i]);;
			venue.happy = [];
			venue.unhappy = [];

			for(let j = 0; j < this.users.length; j++) {
				let user = Object.assign({}, this.users[j]);
				if(user.selected) {
					user.reasons = [];

					// remove all the food they don't like and see if there's anything left for them to eat.
					let can_eat = venues[i].food.filter(function(val){
						return (users[j].wont_eat.indexOf(val) == -1 ? true : false)
					})
					if(can_eat.length === 0) {
						user.reasons.push("Doesn't have any food they like");
					}

					// check if they serve any drinks they like by comparing the 2 arrays
					if(!venues[i].drinks.some(v => users[j].drinks.includes(v))) {
						approved = false;
						user.reasons.push("Doesn't have any drinks they like");
					}

					// If they have no reason to be unhappy, they are happy
					if(user.reasons.length > 0) {
						venue.unhappy.push(user);
					} else {
						venue.happy.push(user);
					}
				}
			}

			results.push(venue);
		}
		this.show_results(results);
	},

	show_results : function(data) {
		let results = {
			good : [],
			bad : []
		};
		for(let i = 0; i < data.length; i++) {
			if(data[i].unhappy.length == 0) {
				results.good.push(data[i]);
			} else {
				results.bad.push(data[i]);
			}
		}

		// lets put the ones with the most amount of people who are happy first
		// so it's easier to choose from if 0 results
		results.bad = results.bad.sort(function (a, b) {
			return b.happy.length - a.happy.length;
		});

		// I would normally do this in a single template with a partial
		let good = results_template(results.good);
		$('#results .good').html(good);

		let bad = results_template(results.bad);
		$('#results .bad').html(bad);
	},
	
	init : function() {
		this.events();
		
		this.users = users;

		// initally set all users as selected
		this.set_users_selected();

		// display all users on the page with checkboxes
		let users_list = users_list_template(this.users);
		$('#user-list').html(users_list);

		// find possible venues with everyone checked
		this.find_venues();
	}
};

app.init();