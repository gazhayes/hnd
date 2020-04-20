import './commentBody.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Comments } from '/imports/api/comments/comments'

import { newComment, editComment, removeComment } from '/imports/api/comments/methods'

import { notify } from '/imports/modules/notifier'

import swal from 'sweetalert2'

Template.commentBody.onCreated(function() {
	this.edits = new ReactiveDict()
	this.replies = new ReactiveDict()

	this.message = new ReactiveVar('')

	this.showReplies = new ReactiveVar(false);
})

Template.commentBody.helpers({
	origId: () => Template.instance().data._id,
	type: () => Template.instance().data.type,
	fieldId: () => Template.instance().data.fieldId,
	user: () => Meteor.users.findOne({ _id: Template.currentData().createdBy}),
	name: function() {
		return this && this.username ? this.username : (((this || {}).emails || [])[0] || {}).address || 'Unknown'
	},
    canEditComment: function() {
    	return this.createdBy === Meteor.userId()
    },
    editMode: function() {
    	return Template.instance().edits.get(this._id)
    },
    replyMode: function() {
    	return Template.instance().replies.get(this._id)
    },
	commentInvalidMessage: () => Template.instance().message.get(),
	newIdent: () => Template.instance().data.ident + 10,
	formIdent: () => Template.instance().data.ident - 5,
	ident: () => Template.instance().data.ident,
	childComments: function() {
		return Comments.find({
			parentId: this._id
		}, {
			sort: {
				createdAt: -1
			}
		})
	},
	childCommentCount: function() {
		return Comments.find({
			parentId: this._id
		}, {
			sort: {
				createdAt: -1
			}
		}).count();
	},
	showReplies: () => Template.instance().showReplies.get(),
	isModerator: () => Meteor.user().moderator,
})

Template.commentBody.events({
	'click .reply': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		templateInstance.replies.set(this._id, true)
	},
	'click .reply-comment': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		newComment.call({
			parentId: this._id,
			text: $(`.rep-comment-${this._id}`).val(),
			resourceId: templateInstance.data._id,
			type: templateInstance.data.type,
			fieldId: templateInstance.data.fieldId
		}, (err, data) => {
      		$(`.rep-comment-${this._id}`).val('')

			if (!err) {
				notify('Successfully commented.', 'success')
				templateInstance.message.set('')

				templateInstance.replies.set(this._id, false)
				templateInstance.showReplies.set(true);
			} else {
				templateInstance.message.set(err.reason || err.message)
			}
		})
	},
	'click .reply-comment-moderator': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		newComment.call({
			parentId: this._id,
			text: $(`.rep-comment-${this._id}`).val(),
			resourceId: templateInstance.data._id,
			type: templateInstance.data.type,
			fieldId: templateInstance.data.fieldId,
			isModeratorOnly: true,
		}, (err, data) => {
      		$(`.rep-comment-${this._id}`).val('')
			if (!err) {
				notify('Successfully commented.', 'success')
				templateInstance.message.set('')

				templateInstance.replies.set(this._id, false)
				templateInstance.showReplies.set(true);
			} else {
				templateInstance.message.set(err.reason || err.message)
			}
		})
	},
	'click .cancel-reply': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		templateInstance.replies.set(this._id, false)
	},
	'click .edit-mode': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		templateInstance.edits.set(this._id, true)
	},
	'click .delete-comment': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		swal({
            text: `Are you sure you want to remove this comment? This action is not reversible.`,
            type: 'warning',
            showCancelButton: true
        }).then(confirmed => {
            if (confirmed.value) {
                removeComment.call({
                    commentId: this._id
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    }
                })
            }
        })
	},
	'click .edit-comment': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		editComment.call({
			commentId: this._id,
			text: $(`.edit-comment-${this._id}`).val()
		}, (err, data) => {
			if (err) {
                notify(err.reason || err.message, 'error')
            } else {
            	notify('Successfully edited.', 'success')
				templateInstance.edits.set(this._id, false)
            }
		})
	},
	'click .cancel-edit': function(event, templateInstance) {
		event.preventDefault()
		event.stopImmediatePropagation()

		templateInstance.edits.set(this._id, false)
	},
	'click .showReplies': (event, templateInstance) => {
		event.preventDefault();

		// Check if the button was clicked for this comment and not in a child
		if (templateInstance.data.comment._id === event.target.getAttribute('data-id'))
			templateInstance.showReplies.set(true)
	},
	'click .hideReplies': (event, templateInstance) => {
		event.preventDefault();

		// Check if the button was clicked for this comment and not in a child
		if (templateInstance.data.comment._id === event.target.getAttribute('data-id'))
			templateInstance.showReplies.set(false)
	},
})
