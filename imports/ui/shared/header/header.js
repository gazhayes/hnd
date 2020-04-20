import './header.html'
import './header.scss'

import { Notifications } from '/imports/api/notifications/notifications'

Template.header.onCreated(function() {
  this.autorun(() => {
    this.subscribe('notifications')
  })
})

Template.header.events({
  'click .sidebar-toggler' (event) {
    event.preventDefault()
    if($('body').hasClass('sidebar-lg-show')) {
      $('body').removeClass('sidebar-lg-show')
    } else {
      $('body').toggleClass('sidebar-show')
    }
  },

  'click #signOut' (event) {
    event.preventDefault()
    if (Meteor.userId()) { 
      Meteor.logout() 
    }
  }
})

Template.header.helpers({
    profileReady() {
        let profile = Meteor.user().profile ? Meteor.user().profile.bio : null
        if (profile) {
            return true;
        }
    },
  notificationsCount: () => Notifications.find({
    userId: Meteor.userId(),
    read: false,
    $or: [{
      type: 'notification'
    }, {
      type: {
        $exists: false
      }
    }]
  }).count(),
  userId : () => Meteor.userId()
})