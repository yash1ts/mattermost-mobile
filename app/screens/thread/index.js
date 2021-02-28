// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getTheme} from '@mm-redux/selectors/entities/preferences';

import {selectPost} from '@mm-redux/actions/posts';
import {makeGetChannel, getMyCurrentChannelMembership} from '@mm-redux/selectors/entities/channels';
import {makeGetPostIdsForThread} from '@mm-redux/selectors/entities/posts';

import Thread from './thread';
import {General} from '@mm-redux/constants';
import {getCurrentUserId} from '@mm-redux/selectors/entities/users';
import {getUserIdFromChannelName} from '@mm-redux/utils/channel_utils';

function makeMapStateToProps() {
    const getPostIdsForThread = makeGetPostIdsForThread();
    const getChannel = makeGetChannel();

    return function mapStateToProps(state, ownProps) {
        const channel = getChannel(state, {id: ownProps.channelId});
        const currentUserId = getCurrentUserId(state);

        let isBlockedByMe = false;
        let isBlockedByOther = false;
        if (channel) {
            if (channel.type === General.DM_CHANNEL) {
                isBlockedByMe = channel.header.includes(currentUserId);
                isBlockedByOther = channel.header.includes(getUserIdFromChannelName(currentUserId, channel.name));
            }
        }

        return {
            channelId: ownProps.channelId,
            channelType: channel ? channel.type : '',
            displayName: channel ? channel.display_name : '',
            myMember: getMyCurrentChannelMembership(state),
            rootId: ownProps.rootId,
            postIds: getPostIdsForThread(state, ownProps.rootId),
            theme: getTheme(state),
            channelIsArchived: channel ? channel.delete_at !== 0 : false,
            threadLoadingStatus: state.requests.posts.getPostThread,
            isBlockedByMe,
            isBlockedByOther,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            selectPost,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Thread);
