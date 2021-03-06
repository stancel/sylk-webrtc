'use strict';

const React              = require('react');
const NotificationSystem = require('react-notification-system');
const moment             = require('moment');
const Notify             = require('notifyjs');

const config = require('../config');


class NotificationCenter extends React.Component {
    _postSystemNotification(title, options) {
        const n = new Notify(title, options);
        n.show();
        return n;
    }

    postSystemNotification(title, options={}) {    // eslint-disable-line space-infix-ops
        const defaultOptions = {
            icon: 'assets/images/blink-48.png',
            body: '',
            timeout: 5,
            silent: true
        }

        let ua = window.navigator.userAgent;
        let iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
        let webkit = !!ua.match(/WebKit/i);
        let android = !!ua.match(/Android/i);
        let chrome = !!ua.match(/Chrome/i);
        let iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
        let chromeAndroid = android && chrome;
        if (!iOSSafari && !chromeAndroid) {
            if (Notify.needsPermission) {
                Notify.requestPermission(() => {
                    this._postSystemNotification(title, Object.assign({}, defaultOptions, options));
                });
            } else {
                this._postSystemNotification(title, Object.assign({}, defaultOptions, options));
            }
        }
    }

    postConferenceInvite(originator, room, cb) {
        if (originator.uri.endsWith(config.defaultGuestDomain)) {
            return;
        }
        const idx = room.indexOf('@');
        if (idx === -1) {
            return;
        }
        const currentDate = moment().format('MMMM Do YYYY [at] HH:mm:ss');
        const action = {
            label: 'Join',
            callback: () => { cb(room); }
        };
        this.refs.notificationSystem.addNotification({
            message: `${(originator.displayName || originator.uri)} invited you to join conference room ${room.substring(0, idx)}<br />On ${currentDate}`,
            title: 'Conference Invite',
            autoDismiss: 0,
            action: action,
            level: 'success',
            position: 'br'
        });
    }

    postMissedCall(originator, cb) {
        const currentDate = moment().format('MMMM Do YYYY [at] HH:mm:ss');
        let action;
        if (originator.uri.endsWith(config.defaultGuestDomain)) {
            action = null;
        } else {
            action = {
                label: 'Call',
                callback: () => { cb(originator.uri); }
            };
        }
        this.refs.notificationSystem.addNotification({
            message: `From ${(originator.displayName || originator.uri)} <br />On ${currentDate}`,
            title: 'Missed Call',
            autoDismiss: 0,
            action: action,
            level: 'info',
            position: 'br'
        });
    }

    render() {
        return (
            <NotificationSystem ref="notificationSystem" allowHTML={true} />
        );
    }
}


module.exports = NotificationCenter;
