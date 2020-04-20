import { Meteor } from 'meteor/meteor'

Meteor.publish(null, () => Meteor.users.find({
	_id: Meteor.userId()
}, {
	fields: {
		_id: 1,
		moderator: 1,
		profile: 1,
		username: 1,
		emails: 1
	}
}))


Meteor.publish('users', () => Meteor.users.find({}, {
	fields: {
		_id: 1,
		moderator: 1,
		profile: 1,
		username: 1,
		emails: 1
	}
}))

Meteor.publish('modUsers', () => Meteor.users.find({}, {
	fields: {
		services: 0
	}
}))
