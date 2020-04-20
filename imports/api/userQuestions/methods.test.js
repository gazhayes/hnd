import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { UserQuestions } from './userQuestions'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ moderator: true, profile: { name: 'Test User'} }) // stub user data as well
Meteor.user = () => ({ moderator: true, profile: { name: 'Test User'} })

describe('user questions methods', () => {
    it('can submit new data', () => {
        let data = {
            fullName: 'Test user',
            dob: new Date(),
            country: 'Serbia',
            github: 'tester',
            reason: 'Test reason',
            teamDescription: 'Something',
            averageTeamWorkday: 'I have no idea.',
            timeCommitment: 'All',
            personalInvestment: 'None',
            relatedPastProjects: 'Nothing',
            projectGoals: 'idk',
            likedBlockchainProjects: 'something maybe',
            employmentStatus: 'happily employed'
        }

        return callWithPromise('addUserInfo', {userInfoID: 'new', userInfo: data, steps: { last: 'stepOne', next: 'stepTwo' }}).then(infoId => {
            let info = UserQuestions.findOne({
                _id: infoId
            })

            Object.keys(data).forEach(i => {
                if (i === 'dob') {
                    assert.ok(info[i].toISOString() === data[i].toISOString())
                } else {
                    assert.ok(info[i] === data[i])
                }
            })
        })
    })

    it ('user can update data', () => {
        let uq = UserQuestions.findOne({})

        return callWithPromise('updateUserInfo', {
            _id: uq._id,
            modifier: {
                $set: {
                    fullName: 'Testing'
                }
            }
        }).then(data => {
            let uq2 = UserQuestions.findOne({
                _id: uq._id
            })

            assert.ok(uq2.fullName === 'Testing')
        })
    })

    after(() => {
        UserQuestions.remove({})
    })
})
