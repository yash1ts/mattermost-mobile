// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {
    blockDMChannel,
    unblockDMChannel,
} from '@actions/views/channel';
import {General} from '@mm-redux/constants';
import {getCurrentChannel} from '@mm-redux/selectors/entities/channels';
import {getFavoritesPreferences} from '@mm-redux/selectors/entities/preferences';

import Block from './block';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state);
    const favoriteChannels = getFavoritesPreferences(state) || [];
    const isDirectMessage = currentChannel.type === General.DM_CHANNEL;
    const isGroupMessage = currentChannel.type === General.GM_CHANNEL;

    return {
        currentChannel,
        displayName: (currentChannel?.display_name || '').trim(),
        isDirectMessage,
        isFavorite: favoriteChannels.indexOf(currentChannel?.id) > -1,
        isGroupMessage,
        isPublic: currentChannel?.type === General.OPEN_CHANNEL,
    };
}

const mapDispatchToProps = {
    blockDMChannel,
    unblockDMChannel,
};

export default connect(mapStateToProps, mapDispatchToProps)(Block);
