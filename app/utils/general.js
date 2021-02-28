// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Alert, Platform} from 'react-native';
import React from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import {t} from '@utils/i18n';
import {Posts} from '@mm-redux/constants';
import Svg, {Path} from 'react-native-svg';

const INVALID_VERSIONS = ['1.29.0'];

export function fromAutoResponder(post) {
    return Boolean(post.type && (post.type === Posts.SYSTEM_AUTO_RESPONDER));
}

export function toTitleCase(str) {
    function doTitleCase(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
    return str.replace(/\w\S*/g, doTitleCase);
}

export function alertErrorWithFallback(intl, error, fallback, values, buttons) {
    let msg = error.message;
    if (!msg || msg === 'Network request failed') {
        msg = intl.formatMessage(fallback, values);
    }
    Alert.alert('', msg, buttons);
}

export function alertErrorIfInvalidPermissions(result) {
    function isForbidden(data) {
        const {error} = data;
        return error && error.status_code === 403;
    }

    let error = null;
    if (Array.isArray(result)) {
        const item = result.find((r) => isForbidden(r));
        if (item) {
            error = item.error;
        }
    } else if (isForbidden(result)) {
        error = result.error;
    }

    if (error) {
        Alert.alert(error.message);
    }
}

export function emptyFunction() { // eslint-disable-line no-empty-function

}

export function hapticFeedback(method = 'impactLight') {
    ReactNativeHapticFeedback.trigger(method, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
    });
}

export function throttle(fn, limit, ...args) {
    let inThrottle;
    let lastFunc;
    let lastRan;

    return () => {
        if (inThrottle) {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    Reflect.apply(fn, this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        } else {
            Reflect.apply(fn, this, args);
            lastRan = Date.now();
            inThrottle = true;
        }
    };
}

export function isPendingPost(postId, userId) {
    return postId.startsWith(userId);
}

export function validatePreviousVersion(previousVersion) {
    if (Platform.OS === 'ios') {
        INVALID_VERSIONS.push('1.31.0', '1.31.1');
    }

    if (INVALID_VERSIONS.includes(previousVersion)) {
        return false;
    }

    return true;
}

export function permalinkBadTeam(intl) {
    const message = {
        id: t('mobile.server_link.unreachable_team.error'),
        defaultMessage: 'This link belongs to a deleted team or to a team to which you do not have access.',
    };

    alertErrorWithFallback(intl, {}, message);
}

export function youtubePlayButton(size = 48) {
    return (
        <Svg
            width={size}
            height={size}
        >
            <Path
                fill='#FF3D00'
                d='M43.2 33.9c-.4 2.1-2.1 3.7-4.2 4-3.3.5-8.8 1.1-15 1.1-6.1 0-11.6-.6-15-1.1-2.1-.3-3.8-1.9-4.2-4-.4-2.3-.8-5.7-.8-9.9s.4-7.6.8-9.9c.4-2.1 2.1-3.7 4.2-4C12.3 9.6 17.8 9 24 9c6.2 0 11.6.6 15 1.1 2.1.3 3.8 1.9 4.2 4 .4 2.3.9 5.7.9 9.9-.1 4.2-.5 7.6-.9 9.9z'
            />
            <Path
                fill='#FFF'
                d='M20 31V17l12 7z'
            />
        </Svg>
    );
}
