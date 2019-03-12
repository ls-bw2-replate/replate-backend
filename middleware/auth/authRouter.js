const router = require('express').Router();
const bcrypt = require('bcryptjs');
const tokenService = require('../tokenService/tokenService');

const Volunteer = require('../../helpers/volunteers/volunteerModel');
const Business = require('../../helpers/business/businessModel');
const Foodbank = require('../../helpers/foodbank/foodbankModel');

router.post('/register', async (req, res) => {
	let user = req.body;
	const hash = bcrypt.hashSync(user.password, 10);
	user.password = hash;

	switch (user.usertype) {
		case 'volunteer':
			try {
				const newVolunteer = await Volunteer.add(user);
				res.status(201).json(newVolunteer);
			} catch (error) {
				res.status(500).json(error);
			}

		case 'business':
			return Business.add(user)
				.then(newBusiness => {
					res.status(201).json(newBusiness);
				})
				.catch(error => {
					res.status(500).json(error);
				});

		case 'foodbank':
			return Foodbank.add(user)
				.then(newFoodbank => {
					res.status(201).json(newFoodbank);
				})
				.catch(error => {
					res.status(500).json(error);
				});
		default:
			return;
	}
});

router.post('/login', async (req, res) => {
	switch (req.body.usertype) {
		case 'volunteer':
			let { first_name, password } = req.body;
			try {
				const existingUser = await Volunteer.findBy(first_name);
				if (
					existingUser &&
					bcrypt.compareSync(password, existingUser.password)
				) {
					const token = tokenService(existingUser);
					res.status(200).json({
						message: `Welcome ${existingUser.first_name}!`,
						token,
					});
				} else {
					res.status(401).json({ message: 'Invalid Credentials' });
				}
			} catch (error) {
				console.log(error);
				res.status(500).json(error);
			}
			break;

		case 'business':
			try {
				const existingBusiness = await Business.findBy(
					user.businessName,
				).first();
				if (
					existingBusiness &&
					bcrypt.compareSync(user.password, existingBusiness.password)
				) {
					const token = tokenService(existingBusiness);
					res.status(200).json({
						message: `Welcome ${existingBusiness.businessName}!`,
						token,
					});
				} else {
					res.status(401).json({ message: 'Invalid Credentials' });
				}
			} catch (error) {
				res.status(500).json(error);
			}
			break;

		case 'foodbank':
			try {
				const existingFoodbank = await Foodbank.findBy(
					user.businessName,
				).first();
				if (
					existingFoodbank &&
					bcrypt.compareSync(user.password, existingFoodbank.password)
				) {
					const token = tokenService(existingFoodbank);
					res.status(200).json({
						message: `Welcome ${existingFoodbank.businessName}!`,
						token,
					});
				} else {
					res.status(401).json({ message: 'Invalid Credentials' });
				}
			} catch (error) {
				res.status(500).json(error);
			}
			break;
		default:
			return;
	}
});

module.exports = router;
