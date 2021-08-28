const User = require('../models/User');

module.exports = {
	findUser: (req, res, next) => {
		if (!req.session.user) {
			return next();
		}
		User.findById(req.session.user._id)
			.then(user => {
				req.user = user;
				let currentUser = req.user || null;
				let userid = req.user._id.toString() || null;
				res.locals.currentUser = currentUser;
				res.locals.userid = userid;
				res.locals.isAuthenticated = req.session.isLoggedin;
				res.locals.isAdmin = req.session.isAdmin;
				res.locals.name = req.session.user.name;
				next();
			})
			.catch(err => {
				console.log(err);
			});
	},
	renderUsers: user => {
		let skills = user.skills
			? user.skills.map(skill => skill + ',').join(' ')
			: '';

		let skillsHtml =
			user?.skills?.length !== 0
				? `<a href="" class="crayons-tag"><span class="crayons-tag__prefix"></span>
                                                    skills : ${skills}
                                                </a>
                                                <br>`
				: '';
		let countryHtml = user.country
			? `<a href="" class="crayons-tag"><span class="crayons-tag__prefix"></span>
                                                    Country : ${user.country}
                                                </a>
                                                <br>`
			: '';
		let yearHtml = user.yearOfBirth
			? `<a href="" class="crayons-tag"><span class="crayons-tag__prefix"></span>
                                                    year of birth : ${user.yearOfBirth}
                                                </a>
                                                <br>`
			: '';
		let genderHtml = user.gender
			? `<a href="" class="crayons-tag"><span class="crayons-tag__prefix"></span>
                                                    Gender : ${user.gender}
                                                </a>`
			: '';
		return `
		<div class="crayons-story user" data-username="${user.username}">
                                    <div class="crayons-story__body">
                                        <div class="crayons-story__top">
                                            <div class="crayons-story__meta">
                                                <div class="crayons-story__author-pic">

                                                    <a href="/users/profile/${
																											user.username
																										}" class="crayons-avatar crayons-avatar--l ">
                                                        <img src="${
																													user.Image
																														? '/' + user.Image
																														: '/assets/img/default.png'
																												}"
                                                            alt="aemiej profile" class="crayons-avatar__image" />
                                                    </a>
                                                </div>
                                                <div>
                                                    <p>
                                                        <a href="/users/profile/${
																													user.username
																												}" class="crayons-story__secondary fw-medium">
                                                            @${user.username}
                                                        </a>
                                                    </p>

                                                </div>
                                            </div>
                                        </div>

                                        <div class="crayons-story__indention">
                                            <h2 class="crayons-story__title">
                                                <p>
                                                    ${user.name}
                                                </p>
                                            </h2>
                                            <div class="crayons-story__tags">
                                            ${skillsHtml}
                                            ${countryHtml}                                                            
                                            ${yearHtml}                                                            
                                            ${genderHtml}                                                            
                                            </div>
                                            <div class="crayons-story__bottom">
                                                <div class="crayons-story__details">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
	},
	generateCriteriaObject: obj => {
		let data = {};
		// delete all properties that have values of 'any'
		for (let prop in obj) {
			// if the property is empty string or 'any' or skills array is empty delete them
			if (obj[prop] === 'any' || obj[prop] === '' || obj[prop].length === 0) {
				delete obj[prop];
			}
			// lw el prop = name w el name msh empty 7ott el query bta3t el search f el obj data
			if (prop === 'name' && obj[prop] !== '' && obj[prop] !== undefined) {
				data['$text'] = { $search: `${obj[prop]}` };
			} else if (prop === 'skills' && obj[prop]?.length > 0) {
				if (obj[prop].length === 1) {
					data['skills'] = { $in: `${obj[prop].concat([])}` };
				} else {
					data['skills'] = { $in: obj[prop] };
				}
			} else if (obj[prop] !== undefined) {
				data[prop] = obj[prop];
			}
		}
		return data;
	},
};
