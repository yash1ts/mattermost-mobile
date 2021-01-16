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

export function logo(size = 150) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox='0 0 500 500'
        >
            <Path
                fill='#183ff1'
                d='M554 3083c14-44 37-206 43-296l6-101 22 75c55 190 142 299 239 299 22 0 25-6 35-67 46-287 42-706-9-918-19-80-30-75 161-75h172l-7 33c-34 165-40 234-42 522l-2 300-61 63c-34 35-76 90-93 123l-33 59H767c-203 0-218-1-213-17zM1100 3091c0-10 74-106 88-115 6-3 13 14 16 39 6 39 10 45 32 45 73 0 142-62 191-170 46-101 48-103 61-108 6-2 13 16 17 45 10 80 35 237 41 256 5 16-10 17-220 17-129 0-226-4-226-9zM1573 3077c12-47 36-205 42-278l6-76 57-18c31-10 85-26 118-35l62-18 6 30c3 17 6 54 6 82 0 44 8 103 36 294l7 42h-345l5-23zM2273 3058c71-88 112-215 124-385 5-82 8-93 25-93 10 0 18 6 18 14 0 7 5 71 10 142 13 152 30 236 65 304 14 27 25 52 25 55s-68 5-151 5h-150l34-42zM2611 3059c14-72 38-277 45-383l6-98 97 7c53 3 103 8 112 11 12 3 18 31 27 132 12 139 30 210 65 263 65 97 198 85 266-24 33-54 54-153 49-229-4-53-2-68 8-68 16 0 244 76 252 84 9 9-19 100-43 142-49 84-138 143-270 180-47 13-120 18-341 21l-282 5 9-43zM3584 3074c10-40 36-216 36-246 0-16 5-28 10-28 31 0 171 92 244 160 49 45 106 116 106 132 0 4-90 8-201 8h-201l6-26zM4087 3083c-14-13-6-23 37-42 71-31 121-124 133-246 11-123-49-260-145-329-41-29-51-31-143-34l-99-4 1 154c0 84 4 176 8 205 8 56 8 56-44 17-16-12-69-43-117-68l-86-47-1-160c0-168-12-311-36-443-8-43-15-80-15-82s77-4 170-4c107 0 170 4 170 10 0 5-7 49-15 97-8 49-18 129-23 179l-8 91 131 7c71 4 157 14 190 22 138 36 235 107 285 208 94 191-19 390-258 455-80 22-124 26-135 14zM3450 2619c-30-11-93-29-140-41-76-19-89-26-123-64-57-64-106-84-210-84h-87v71l-47-5c-27-3-78-8-115-11l-67-6-5-52c-2-29-10-106-16-172-10-107-17-153-35-232l-5-23h346l-17 98c-10 53-21 138-25 188l-7 91 131 7c199 10 304 45 399 130 45 41 104 127 86 125-4 0-33-9-63-20zM1627 2483c7-205 40-300 135-389 75-70 164-107 270-112 214-10 348 93 393 303 19 91 20 195 1 195-9 0-15-23-19-83-11-135-46-233-109-296-102-104-266-82-360 49-48 67-70 145-75 278-4 77-10 125-17 127-6 2-51 15-101 28-49 14-98 28-107 32-15 6-16-5-11-132z'
                transform='matrix(.1 0 0 -.1 0 500)'
            />
        </Svg>
    );
}
