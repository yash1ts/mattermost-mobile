// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {
<<<<<<< HEAD
=======
    closeDMChannel,
    closeGMChannel,
    leaveChannel,
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
    blockDMChannel,
    unblockDMChannel,
} from '@actions/views/channel';
import {General} from '@mm-redux/constants';
import {getCurrentChannel} from '@mm-redux/selectors/entities/channels';
import {getFavoritesPreferences} from '@mm-redux/selectors/entities/preferences';
<<<<<<< HEAD
=======
import {getCurrentUser} from '@mm-redux/selectors/entities/users';
import {isGuest as isUserGuest} from '@utils/users';
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838

import Block from './block';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state);
<<<<<<< HEAD
    const favoriteChannels = getFavoritesPreferences(state) || [];
    const isDirectMessage = currentChannel.type === General.DM_CHANNEL;
    const isGroupMessage = currentChannel.type === General.GM_CHANNEL;

    return {
=======
    const currentUser = getCurrentUser(state);
    const favoriteChannels = getFavoritesPreferences(state) || [];
    const isGuest = isUserGuest(currentUser);
    const isDefaultChannel = currentChannel.name === General.DEFAULT_CHANNEL;
    const isDirectMessage = currentChannel.type === General.DM_CHANNEL;
    const isGroupMessage = currentChannel.type === General.GM_CHANNEL;
    const canLeave = (!isDefaultChannel && !isDirectMessage && !isGroupMessage) || (isDefaultChannel && isGuest);

    return {
        canLeave,
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
        currentChannel,
        displayName: (currentChannel?.display_name || '').trim(),
        isDirectMessage,
        isFavorite: favoriteChannels.indexOf(currentChannel?.id) > -1,
        isGroupMessage,
        isPublic: currentChannel?.type === General.OPEN_CHANNEL,
    };
}

const mapDispatchToProps = {
<<<<<<< HEAD
=======
    closeDMChannel,
    closeGMChannel,
    leaveChannel,
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
    blockDMChannel,
    unblockDMChannel,
};

export default connect(mapStateToProps, mapDispatchToProps)(Block);
